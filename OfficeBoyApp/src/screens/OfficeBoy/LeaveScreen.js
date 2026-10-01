import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_BASE} from '../../config';

const STATUS_STYLE = {
  Pending: {bg: '#FFF3E0', color: '#E8912B'},
  Approved: {bg: '#E3F2E8', color: '#1B6E47'},
  Rejected: {bg: '#FDECEC', color: '#C62828'},
};

const LeaveScreen = ({navigation, route}) => {
  const {user} = route.params || {};

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState('');
  const [pickerMode, setPickerMode] = useState(null); // 'from' | 'to' | null
  const [submitting, setSubmitting] = useState(false);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Leave/officeboy/${user?.id}`);
      const data = await response.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
    }, []),
  );

  const onPickerChange = (event, value) => {
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
    if (event.type === 'dismissed' || !value) return;

    if (pickerMode === 'from') {
      setFromDate(value);
    } else if (pickerMode === 'to') {
      setToDate(value);
    }
  };

  const formatDate = d => {
    if (!d) return null;
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      Alert.alert('Error', 'Please select From and To dates');
      return;
    }
    if (toDate < fromDate) {
      Alert.alert('Error', 'To Date cannot be before From Date');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/Leave`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          officeBoyAccountId: user?.id,
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
          reason: reason,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request submitted!');
        setFromDate(null);
        setToDate(null);
        setReason('');
        fetchLeaves();
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert('Error', data?.message || 'Could not submit leave request');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Leave</Text>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIcon}>🗓️</Text>
          </View>
        </View>

        {/* Apply form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Leave Request</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>From Date</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setPickerMode('from')}>
            <Text style={styles.dropdownIcon}>📅</Text>
            <Text style={fromDate ? styles.dropdownText : styles.dropdownPlaceholder}>
              {formatDate(fromDate) || 'Select date'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, {marginTop: 16}]}>To Date</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setPickerMode('to')}>
            <Text style={styles.dropdownIcon}>📅</Text>
            <Text style={toDate ? styles.dropdownText : styles.dropdownPlaceholder}>
              {formatDate(toDate) || 'Select date'}
            </Text>
          </TouchableOpacity>

          {pickerMode && (
            <DateTimePicker
              value={(pickerMode === 'from' ? fromDate : toDate) || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={onPickerChange}
            />
          )}

          <Text style={[styles.label, {marginTop: 16}]}>Reason</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Why do you need leave?"
            placeholderTextColor="#B0B0B0"
            value={reason}
            onChangeText={setReason}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Past requests */}
        <Text style={styles.sectionTitle}>My Leave Requests</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1B6E47" style={{marginTop: 20}} />
        ) : leaves.length === 0 ? (
          <Text style={styles.noData}>No leave requests yet</Text>
        ) : (
          <View style={{paddingHorizontal: 16}}>
            {leaves.map(leave => {
              const s = STATUS_STYLE[leave.status] || STATUS_STYLE.Pending;
              return (
                <View key={leave.leaveId} style={styles.leaveCard}>
                  <View style={styles.leaveTop}>
                    <Text style={styles.leaveDates}>
                      {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                    </Text>
                    <View style={[styles.statusBadge, {backgroundColor: s.bg}]}>
                      <Text style={[styles.statusBadgeText, {color: s.color}]}>
                        {leave.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leaveReason}>{leave.reason}</Text>
                  {leave.supervisorRemarks ? (
                    <Text style={styles.leaveRemarks}>
                      Supervisor: {leave.supervisorRemarks}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <View style={{height: 30}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F1F5F3'},

  header: {
    backgroundColor: '#1B6E47',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 22,
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

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  cardTitle: {fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
  divider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},

  label: {fontSize: 14, color: '#3A3A3A', fontWeight: '600', marginBottom: 8},
  dropdown: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {fontSize: 15, marginRight: 10},
  dropdownText: {fontSize: 14, color: '#333'},
  dropdownPlaceholder: {fontSize: 14, color: '#B0B0B0'},

  textArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 90,
  },

  submitBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},

  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#1A1A1A',
    marginHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  noData: {textAlign: 'center', color: '#999', marginTop: 10, fontSize: 14},

  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  leaveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveDates: {fontSize: 13, fontWeight: 'bold', color: '#1A1A1A'},
  statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
  statusBadgeText: {fontSize: 11, fontWeight: '700'},
  leaveReason: {fontSize: 13, color: '#666', marginTop: 6},
  leaveRemarks: {fontSize: 12, color: '#999', marginTop: 6, fontStyle: 'italic'},
});

export default LeaveScreen;