import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE} from '../../config';

const TABS = ['Pending', 'All'];

const STATUS_STYLE = {
  Pending: {bg: '#FFF3E0', color: '#E8912B'},
  Approved: {bg: '#E3F2E8', color: '#1B6E47'},
  Rejected: {bg: '#FDECEC', color: '#C62828'},
};

const LeaveRequestsScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  // Replacement picker modal
  const [pickingFor, setPickingFor] = useState(null); // leave object
  const [officeBoys, setOfficeBoys] = useState([]);

  const fetchLeaves = async tab => {
    setLoading(true);
    try {
      const url =
        tab === 'Pending'
          ? `${API_BASE}/api/Leave/pending`
          : `${API_BASE}/api/Leave`;
      const response = await fetch(url);
      const data = await response.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Could not load leave requests');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves(activeTab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]),
  );

  const formatDate = d => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
  };

  // ── Reject (koi replacement nahi chahiye) ──────────────
  const handleReject = async leaveId => {
    setActingId(leaveId);
    try {
      const response = await fetch(`${API_BASE}/api/Leave/${leaveId}/reject`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({remarks: null}),
      });
      if (response.ok) fetchLeaves(activeTab);
      else Alert.alert('Error', 'Could not reject leave');
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setActingId(null);
    }
  };

  // ── Approve flow: pehle replacement office boy chunwana ──
  const openReplacementPicker = async leave => {
    setPickingFor(leave);
    try {
      const response = await fetch(`${API_BASE}/api/OfficeBoy`);
      const data = await response.json();
      // Jis office boy ki leave hai, usay list se hata dein
      setOfficeBoys(
        (Array.isArray(data) ? data : []).filter(ob => ob.id !== leave.officeBoyId),
      );
    } catch (error) {
      Alert.alert('Error', 'Could not load office boys');
    }
  };

  const confirmApprove = async replacement => {
    const leave = pickingFor;
    setPickingFor(null);
    setActingId(leave.leaveId);
    try {
      const response = await fetch(`${API_BASE}/api/Leave/${leave.leaveId}/approve`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          remarks: null,
          replacementOfficeBoyId: replacement ? replacement.id : null,
        }),
      });
      if (response.ok) fetchLeaves(activeTab);
      else Alert.alert('Error', 'Could not approve leave');
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setActingId(null);
    }
  };

  // ── Restore (leave khatam, sab apni jagah wapis) ────────
  const handleRestore = async leaveId => {
    setActingId(leaveId);
    try {
      const response = await fetch(`${API_BASE}/api/Leave/${leaveId}/restore`, {
        method: 'PUT',
      });
      if (response.ok) {
        Alert.alert('Success', 'Original assignment restored');
        fetchLeaves(activeTab);
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert('Error', data?.message || 'Could not restore assignment');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setActingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Requests</Text>
        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>🗓️</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B5E3F" style={{marginTop: 40}} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <View style={styles.content}>
            {leaves.length === 0 ? (
              <Text style={styles.noData}>No leave requests found</Text>
            ) : (
              leaves.map(leave => {
                const s = STATUS_STYLE[leave.status] || STATUS_STYLE.Pending;
                const canRestore =
                  leave.status === 'Approved' &&
                  leave.replacementOfficeBoyName &&
                  !leave.isRestored;
                return (
                  <View key={leave.leaveId} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.officeBoyName}>{leave.officeBoyName}</Text>
                      <View style={[styles.statusBadge, {backgroundColor: s.bg}]}>
                        <Text style={[styles.statusBadgeText, {color: s.color}]}>
                          {leave.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dates}>
                      📅 {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                    </Text>
                    <Text style={styles.reason}>{leave.reason}</Text>

                    {leave.replacementOfficeBoyName && (
                      <View style={styles.replacementRow}>
                        <Text style={styles.replacementText}>
                          ⇄ Replaced by {leave.replacementOfficeBoyName}
                          {leave.isRestored ? ' (restored)' : ''}
                        </Text>
                      </View>
                    )}

                    {leave.status === 'Pending' && (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleReject(leave.leaveId)}
                          disabled={actingId === leave.leaveId}>
                          <Text style={styles.rejectBtnText}>✕ Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => openReplacementPicker(leave)}
                          disabled={actingId === leave.leaveId}>
                          {actingId === leave.leaveId ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.approveBtnText}>✓ Approve</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {canRestore && (
                      <TouchableOpacity
                        style={styles.restoreBtn}
                        onPress={() => handleRestore(leave.leaveId)}
                        disabled={actingId === leave.leaveId}>
                        {actingId === leave.leaveId ? (
                          <ActivityIndicator size="small" color="#1B5E3F" />
                        ) : (
                          <Text style={styles.restoreBtnText}>↺ Restore Original Assignment</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
          <View style={{height: 20}} />
        </ScrollView>
      )}

      {/* Replacement picker modal */}
      <Modal visible={!!pickingFor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Replacement</Text>
            <Text style={styles.modalSubtitle}>
              Who will cover {pickingFor?.officeBoyName}'s duties?
            </Text>

            <FlatList
              data={officeBoys}
              keyExtractor={item => String(item.id)}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => confirmApprove(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noData}>No other office boys available</Text>
              }
            />

            <TouchableOpacity
              style={styles.modalSkip}
              onPress={() => confirmApprove(null)}>
              <Text style={styles.modalSkipText}>Approve without replacement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setPickingFor(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F6F5'},

  header: {
    backgroundColor: '#1B5E3F',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 28},
  headerTitle: {flex: 1, color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 14},
  headerIconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcon: {fontSize: 18},

  tabsRow: {flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10},
  tab: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    elevation: 1,
  },
  tabActive: {backgroundColor: '#1B5E3F'},
  tabText: {fontSize: 13, color: '#555', fontWeight: '600'},
  tabTextActive: {color: '#fff'},

  content: {padding: 16},
  noData: {textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15},

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  officeBoyName: {fontSize: 15, fontWeight: 'bold', color: '#1A1A1A'},
  statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
  statusBadgeText: {fontSize: 11, fontWeight: '700'},
  dates: {fontSize: 13, color: '#555', marginBottom: 4},
  reason: {fontSize: 13, color: '#777'},

  replacementRow: {
    marginTop: 10,
    backgroundColor: '#F5F2FF',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  replacementText: {fontSize: 12, color: '#7C5CFC', fontWeight: '600'},

  actionsRow: {flexDirection: 'row', gap: 10, marginTop: 14},
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#C62828',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  rejectBtnText: {color: '#C62828', fontSize: 13, fontWeight: 'bold'},
  approveBtn: {
    flex: 1,
    backgroundColor: '#1B5E3F',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  approveBtnText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},

  restoreBtn: {
    borderWidth: 1.5,
    borderColor: '#1B5E3F',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  restoreBtnText: {color: '#1B5E3F', fontSize: 13, fontWeight: 'bold'},

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center'},
  modalSubtitle: {fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 14},
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  modalItemText: {fontSize: 15, color: '#333'},
  modalSkip: {
    marginTop: 8, paddingVertical: 13, alignItems: 'center',
    backgroundColor: '#F4F6F5', borderRadius: 10,
  },
  modalSkipText: {fontSize: 13, color: '#555', fontWeight: '600'},
  modalCancel: {
    marginTop: 12, paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  modalCancelText: {fontSize: 15, color: '#C62828', fontWeight: '600'},
});

export default LeaveRequestsScreen;