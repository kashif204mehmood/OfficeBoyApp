import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE} from '../../config';

const initials = name => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
};

const ProfileScreen = ({navigation, route}) => {
  const {user} = route.params || {};

  const [tasks, setTasks] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/OfficeBoy/${user?.id}/tasks`);
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/OfficeBoy/${user?.id}/assignment`);
      const data = await response.json();
      setAssignment(data);
    } catch (error) {
      setAssignment(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      fetchAssignment();
    }, []),
  );

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const ratedTasks = completedTasks.filter(t => typeof t.rating === 'number');
  const avgRating = ratedTasks.length
    ? (
        ratedTasks.reduce((sum, t) => sum + t.rating, 0) / ratedTasks.length
      ).toFixed(1)
    : null;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Office Boy'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Office Boy</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1B6E47" style={{marginTop: 30}} />
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: '#1B6E47'}]}>
                  {completedTasks.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: '#F5A623'}]}>
                  {avgRating ?? '—'}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>

            {/* Account info */}
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👤</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{user?.name || '—'}</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🏷️</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>Office Boy</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🆔</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.infoLabel}>Account ID</Text>
                  <Text style={styles.infoValue}>#{user?.id ?? '—'}</Text>
                </View>
              </View>
            </View>

            {/* Current Assignment */}
            <Text style={styles.sectionTitle}>Current Assignment</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>◈</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.infoLabel}>Floor</Text>
                  <Text style={styles.infoValue}>
                    {assignment?.floorNumber ? `Floor ${assignment.floorNumber}` : 'Not assigned'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🏢</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.infoLabel}>Office</Text>
                  <Text style={styles.infoValue}>
                    {assignment?.officeName || 'Not assigned'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Apply for Leave */}
            <TouchableOpacity
              style={styles.leaveBtn}
              onPress={() => navigation.navigate('OfficeBoyLeave', {user})}>
              <Text style={styles.leaveBtnText}>🗓️  Apply for Leave</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>⎋  Logout</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OfficeBoyDashboard', {user})}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OfficeBoyViewTask', {user})}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F6F5'},

  header: {
    backgroundColor: '#1B6E47',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingTop: 45,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},

  avatarSection: {alignItems: 'center', marginTop: -46},
  avatarCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: '#1B6E47',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
  },
  avatarText: {color: '#fff', fontSize: 30, fontWeight: 'bold'},
  userName: {fontSize: 19, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10},
  roleBadge: {
    backgroundColor: '#E3F2E8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 8,
  },
  roleBadgeText: {color: '#1B6E47', fontSize: 12, fontWeight: '700'},

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  statValue: {fontSize: 20, fontWeight: 'bold', color: '#E8912B'},
  statLabel: {fontSize: 11, color: '#8A8F8C', marginTop: 4},

  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#1A1A1A',
    marginHorizontal: 20, marginTop: 24, marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  infoRow: {flexDirection: 'row', alignItems: 'center', padding: 12},
  infoIcon: {fontSize: 18, marginRight: 14},
  infoLabel: {fontSize: 11, color: '#9E9E9E'},
  infoValue: {fontSize: 14, color: '#1A1A1A', fontWeight: '600', marginTop: 2},
  infoDivider: {height: 1, backgroundColor: '#F0F2F1', marginLeft: 44},

  leaveBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  leaveBtnText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},

  logoutBtn: {
    borderWidth: 1.5,
    borderColor: '#E24C4C',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {color: '#E24C4C', fontSize: 15, fontWeight: 'bold'},

  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingVertical: 10,
    paddingBottom: 18,
  },
  navItem: {flex: 1, alignItems: 'center'},
  navIcon: {fontSize: 18},
  navLabel: {fontSize: 11, color: '#9E9E9E', marginTop: 3},
  navLabelActive: {color: '#1B6E47', fontWeight: 'bold'},
});

export default ProfileScreen;