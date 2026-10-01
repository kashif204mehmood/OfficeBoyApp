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

const DashboardScreen = ({navigation, route}) => {
  const {user} = route.params || {};
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/dashboard`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: '🏢',
      value: stats?.totalFloors ?? 0,
      label: 'Total Floors',
    },
    {
      icon: '▦',
      value: stats?.totalOffices ?? 0,
      label: 'Total Offices',
    },
    {
      icon: '👥',
      value: stats?.totalFaculty ?? 0,
      label: 'Total Faculty',
    },
    {
      icon: '👤',
      value: stats?.totalOfficeBoys ?? 0,
      label: 'Office Boys',
    },
  ];

  const quickActions = [
    {
      icon: '🏢',
      title: 'View Floors & Offices',
      screen: 'ViewFloors',
      badge: null,
    },
    {
      icon: '👥',
      title: 'View Faculty',
      screen: 'ViewFaculty',
      badge: null,
    },
    {
      icon: '👤',
      title: 'View Office Boys',
      screen: 'ViewOfficeBoy',
      badge: stats?.totalOfficeBoys ? `${stats.totalOfficeBoys} Available` : null,
    },
    {
      icon: '💬',
      title: 'Faculty Feedback',
      screen: 'ReviewByFilters',
      badge: null,
    },
    {
      icon: '🗓️',
      title: 'Leave Requests',
      screen: 'SupervisorLeaveRequests',
      badge: null,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Green Header Card */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.replace('Login')}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>Supervisor Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your system</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B5E3F"
            style={{marginTop: 40}}
          />
        ) : (
          <>
            {/* 2x2 Stat Cards */}
            <View style={styles.statsGrid}>
              {statCards.map((card, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <Text style={styles.statIcon}>{card.icon}</Text>
                  </View>
                  <Text style={styles.statValue}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsCard}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionRow,
                    index !== quickActions.length - 1 && styles.actionRowBorder,
                  ]}
                  onPress={() => navigation.navigate(action.screen)}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  {action.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{action.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{height: 24}} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F6F5'},

  // Header
  header: {
    backgroundColor: '#1B5E3F',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 45,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 19, fontWeight: 'bold'},
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
  },
  logo: {width: 34, height: 34},
  headerTitle: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  headerSubtitle: {color: '#A8D5BA', fontSize: 13, marginTop: 3},

  // Stat cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  statCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {fontSize: 17},
  statValue: {fontSize: 24, fontWeight: 'bold', color: '#1A1A1A'},
  statLabel: {fontSize: 12, color: '#8A8F8C', marginTop: 2},

  // Quick actions
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F1',
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {fontSize: 15},
  actionTitle: {flex: 1, fontSize: 14, color: '#1A1A1A', fontWeight: '500'},
  badge: {
    backgroundColor: '#E8F3EC',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {fontSize: 11, color: '#1B5E3F', fontWeight: '600'},
  chevron: {fontSize: 20, color: '#C4C9C6'},
});

export default DashboardScreen;
