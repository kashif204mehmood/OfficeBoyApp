import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import {API_BASE} from '../../config';

// Har card ke avatar ka rang - cycle hota rehta hai
const AVATAR_COLORS = [
  '#0F7A4A',
  '#1565C0',
  '#7B1FA2',
  '#C2185B',
  '#00695C',
  '#4E342E',
];

const ViewOfficeBoyScreen = ({navigation}) => {
  const [officeBoys, setOfficeBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reassign modal ke liye
  const [reassignFor, setReassignFor] = useState(null); // office boy object
  const [floors, setFloors] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [step, setStep] = useState('floor'); // 'floor' | 'office'
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOfficeBoys();
  }, []);

  const fetchOfficeBoys = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/officeboys`);
      const data = await response.json();
      setOfficeBoys(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Could not load office boys');
      setOfficeBoys([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = name => {
    if (!name) return '??';
    const words = name.trim().split(/[\s_.]+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ── Reassign flow ──────────────────────────────────────
  const openReassign = async ob => {
    setReassignFor(ob);
    setSelectedFloor(null);
    setSelectedOffice(null);
    setStep('floor');
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/floors`);
      const data = await response.json();
      setFloors(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Could not load floors');
    }
  };

  const pickFloor = async floor => {
    setSelectedFloor(floor);
    setOffices([]);
    try {
      const response = await fetch(
        `${API_BASE}/api/Supervisor/floor/${floor.floorId}/offices`,
      );
      const data = await response.json();
      setOffices(Array.isArray(data) ? data : []);
      setStep('office');
    } catch (error) {
      Alert.alert('Error', 'Could not load offices');
    }
  };

  const confirmReassign = async office => {
    setSelectedOffice(office);
    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/Supervisor/officeboys/${reassignFor.id}/reassign`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            floorId: selectedFloor.floorId,
            officeId: office.id,
          }),
        },
      );
      if (response.ok) {
        Alert.alert('Success', `${reassignFor.name} reassigned successfully`);
        setReassignFor(null);
        fetchOfficeBoys();
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert('Error', data?.message || 'Could not reassign');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>View Office Boys</Text>
          <Text style={styles.headerSubtitle}>
            {officeBoys.length} Available
          </Text>
        </View>

        <View style={styles.logoBox}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1B5E3F"
          style={{marginTop: 40}}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {officeBoys.length === 0 ? (
              <Text style={styles.noData}>No office boys found</Text>
            ) : (
              officeBoys.map((ob, index) => (
                <View key={ob.id || index} style={styles.card}>
                  {/* Colored initials avatar */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          AVATAR_COLORS[index % AVATAR_COLORS.length],
                      },
                    ]}>
                    <Text style={styles.avatarText}>
                      {getInitials(ob.name)}
                    </Text>
                  </View>

                  {/* Name + floor */}
                  <View style={styles.info}>
                    <Text style={styles.name}>{ob.name}</Text>
                    <View style={styles.floorRow}>
                      <Text style={styles.floorIcon}>◈</Text>
                      <Text style={styles.floorText}>
                        {ob.assignedFloors && ob.assignedFloors.length > 0
                          ? `Floor ${ob.assignedFloors[0]}`
                          : 'No floor assigned'}
                      </Text>
                    </View>
                  </View>

                  {/* Reassign button */}
                  <TouchableOpacity
                    style={styles.reassignBtn}
                    onPress={() => openReassign(ob)}>
                    <Text style={styles.reassignBtnText}>⇄ Reassign</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Reassign Modal */}
      <Modal visible={!!reassignFor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {step === 'floor' ? 'Select Floor' : 'Select Office'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Reassigning {reassignFor?.name}
              {step === 'office' && selectedFloor
                ? ` → Floor ${selectedFloor.floorNumber}`
                : ''}
            </Text>

            {step === 'floor' ? (
              <FlatList
                data={floors}
                keyExtractor={item => String(item.floorId)}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => pickFloor(item)}>
                    <Text style={styles.modalItemText}>
                      Floor {item.floorNumber}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <FlatList
                data={offices}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => confirmReassign(item)}
                    disabled={saving}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noData}>No offices on this floor</Text>
                }
              />
            )}

            {saving && (
              <ActivityIndicator size="small" color="#1B6E47" style={{marginTop: 10}} />
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setReassignFor(null)}
              disabled={saving}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 28},
  headerCenter: {flex: 1, marginLeft: 14},
  headerTitle: {color: '#fff', fontSize: 21, fontWeight: 'bold'},
  headerSubtitle: {color: '#B8DCC8', fontSize: 13, marginTop: 2},
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {width: 38, height: 38},

  content: {padding: 14},
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
  info: {flex: 1},
  name: {fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5},
  floorRow: {flexDirection: 'row', alignItems: 'center'},
  floorIcon: {fontSize: 13, color: '#1B6E47', marginRight: 5},
  floorText: {fontSize: 13, color: '#1B6E47', fontWeight: '600'},

  reassignBtn: {
    borderWidth: 1.3,
    borderColor: '#1B6E47',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  reassignBtnText: {fontSize: 12, color: '#1B6E47', fontWeight: '700'},

  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 15,
  },

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
    maxHeight: '65%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#1A1A1A',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12, color: '#888', textAlign: 'center',
    marginTop: 4, marginBottom: 14,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  modalItemText: {fontSize: 15, color: '#333'},
  modalCancel: {
    marginTop: 12, paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  modalCancelText: {fontSize: 15, color: '#C62828', fontWeight: '600'},
});

export default ViewOfficeBoyScreen;