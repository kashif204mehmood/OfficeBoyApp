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
} from 'react-native';
import {API_BASE} from '../../config';


const ViewFloorsScreen = ({navigation}) => {
  const [floors, setFloors] = useState([]);
  const [floorOffices, setFloorOffices] = useState({});
  const [expandedFloor, setExpandedFloor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingOffices, setLoadingOffices] = useState({});

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/floors`);
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load floors');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async (floorId) => {
    if (floorOffices[floorId]) return;
    setLoadingOffices(prev => ({...prev, [floorId]: true}));
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/FloorOffices?id=${floorId}`);
      const data = await response.json();
      setFloorOffices(prev => ({...prev, [floorId]: data}));
    } catch (error) {
      Alert.alert('Error', 'Could not load offices');
    } finally {
      setLoadingOffices(prev => ({...prev, [floorId]: false}));
    }
  };

  const toggleFloor = (floorId) => {
    if (expandedFloor === floorId) {
      setExpandedFloor(null);
    } else {
      setExpandedFloor(floorId);
      fetchOffices(floorId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Floors & Offices</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{marginTop: 40}} />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {floors.map((floor) => (
              <View key={floor.floorId} style={styles.floorCard}>
                <TouchableOpacity
                  style={styles.floorHeader}
                  onPress={() => toggleFloor(floor.floorId)}>
                  <View style={styles.floorLeft}>
                    <View style={[
                      styles.floorIndicator,
                      expandedFloor === floor.floorId && styles.floorIndicatorActive,
                    ]} />
                    <View>
                      <Text style={styles.floorName}>{floor.floorNumber}</Text>
                      <Text style={styles.officeCount}>
                        {floorOffices[floor.floorId]
                          ? `${floorOffices[floor.floorId].length} offices`
                          : 'Tap to view offices'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>
                    {expandedFloor === floor.floorId ? '∧' : '∨'}
                  </Text>
                </TouchableOpacity>

                {expandedFloor === floor.floorId && (
                  <View style={styles.officesList}>
                    {loadingOffices[floor.floorId] ? (
                      <ActivityIndicator size="small" color="#2e7d32" style={{marginVertical: 10}} />
                    ) : floorOffices[floor.floorId] && floorOffices[floor.floorId].length > 0 ? (
                      floorOffices[floor.floorId].map((office, oIndex) => (
                        <View key={oIndex} style={styles.officeItem}>
                          <Text style={styles.officeName}>{office.officeName}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noData}>No offices found</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f4f0'},
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  logoContainer: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  logo: {width: 32, height: 32},
  scrollView: {flex: 1},
  content: {padding: 16},
  floorCard: {
    backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 12, overflow: 'hidden', elevation: 2,
  },
  floorHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  floorLeft: {flexDirection: 'row', alignItems: 'center'},
  floorIndicator: {
    width: 4, height: 40, backgroundColor: '#c8e6c9',
    borderRadius: 2, marginRight: 12,
  },
  floorIndicatorActive: {backgroundColor: '#2e7d32'},
  floorName: {fontSize: 16, fontWeight: 'bold', color: '#1a1a1a'},
  officeCount: {fontSize: 13, color: '#666', marginTop: 2},
  arrow: {fontSize: 18, color: '#2e7d32', fontWeight: 'bold'},
  officesList: {paddingHorizontal: 16, paddingBottom: 12},
  officeItem: {
    backgroundColor: '#e8f5e9', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8,
  },
  officeName: {fontSize: 14, color: '#2e7d32', fontWeight: '500'},
  noData: {textAlign: 'center', color: '#999', paddingVertical: 10},
});

export default ViewFloorsScreen;
