
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {API_BASE} from '../../config';

const AVATAR_COLORS = [
  '#0F7A4A',
  '#1565C0',
  '#7B1FA2',
  '#C2185B',
  '#00695C',
  '#4E342E',
];

const DashboardScreen = ({navigation, route}) => {
  const {user} = route.params || {};
  const [officeBoys, setOfficeBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficeBoys();
  }, []);

  const fetchOfficeBoys = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/Tasks/byfaculty/${user?.id}`,
      );
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
    const cleaned = name.replace(/^(Dr\.?|Prof\.?|Ms\.?|Mr\.?)\s*/i, '');
    const words = cleaned.trim().split(/[\s_.]+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return cleaned.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.avatarSquare}>
          <Text style={styles.avatarSquareText}>{getInitials(user?.name)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.userName}>{user?.name || 'Faculty'}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutIcon}>⇥</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Set Location Task card */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() =>
            navigation.navigate('PointLocation', {user: user})
          }>
          <Text style={styles.pinIcon}>📍</Text>
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.locationTitle}>Set Location Task</Text>
            <Text style={styles.locationSubtitle}>
              Set Arrival / Departure task for office boys
            </Text>
          </View>
          <Text style={styles.locationChevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Assigned Office Boys</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B6E47"
            style={{marginTop: 30}}
          />
        ) : officeBoys.length === 0 ? (
          <Text style={styles.noData}>No office boys assigned</Text>
        ) : (
          officeBoys.map((ob, index) => (
            <View key={ob.id || index} style={styles.obCard}>
              <View style={styles.obTop}>
                <View
                  style={[
                    styles.obAvatar,
                    {backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length]},
                  ]}>
                  <Text style={styles.obAvatarText}>
                    {getInitials(ob.name)}
                  </Text>
                </View>

                <View style={styles.obInfo}>
                  <Text style={styles.obName}>{ob.name}</Text>
                  <View style={styles.obRow}>
                    <Text style={styles.obSmallIcon}>📞</Text>
                    {/* <Text style={styles.obPhone}>+92 300 0000000</Text> */}
                  </View>
                  <View style={styles.obTags}>
                    <View style={styles.availableTag}>
                      <Text style={styles.availableDot}>●</Text>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                    <Text style={styles.obFloor}>{ob.floor || 'No floor'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.obDivider} />

              <View style={styles.obRow}>
                <Text style={styles.obSmallIcon}>🏢</Text>
                <Text style={styles.obOffice}>
                  {ob.assignedOffices && ob.assignedOffices.length > 0
                    ? ob.assignedOffices[0]
                    : '-'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.assignBtn}
                onPress={() =>
                  navigation.navigate('AssignTask', {
                    officeBoy: ob,
                    user: user,
                  })
                }>
                <Text style={styles.assignBtnText}>Assign Task</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{height: 20}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ViewTask', {user: user})}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('FacultyProfile', {user: user})}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  avatarSquare: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSquareText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  headerText: {flex: 1, marginLeft: 14},
  welcome: {color: '#B8DCC8', fontSize: 13},
  userName: {color: '#fff', fontSize: 19, fontWeight: 'bold', marginTop: 1},
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {color: '#fff', fontSize: 20},

  locationCard: {
    backgroundColor: '#1F7A50',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  pinIcon: {fontSize: 22},
  locationTitle: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  locationSubtitle: {color: '#C5E4D2', fontSize: 12, marginTop: 3},
  locationChevron: {color: '#fff', fontSize: 24},

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 14,
  },

  obCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  obTop: {flexDirection: 'row', alignItems: 'flex-start'},
  obAvatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  obAvatarText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  obInfo: {flex: 1},
  obName: {fontSize: 16, fontWeight: 'bold', color: '#1A1A1A'},
  obRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  obSmallIcon: {fontSize: 12, marginRight: 6},
  obPhone: {fontSize: 13, color: '#8A8A8A'},
  obTags: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  availableDot: {fontSize: 8, color: '#2E7D32', marginRight: 5},
  availableText: {fontSize: 12, color: '#1B6E47', fontWeight: '600'},
  obFloor: {fontSize: 13, color: '#666'},
  obDivider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},
  obOffice: {fontSize: 13, color: '#8A8A8A'},
  assignBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  assignBtnText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 18,
    justifyContent: 'space-around',
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 12,
  },
  navItemActive: {backgroundColor: '#E3F2E8'},
  navIcon: {fontSize: 20},
  navText: {fontSize: 11, color: '#9E9E9E', marginTop: 3},
  navTextActive: {color: '#1B6E47', fontWeight: 'bold'},

  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
});

export default DashboardScreen;