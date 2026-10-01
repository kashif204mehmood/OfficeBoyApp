import React, {useState, useCallback} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE} from '../../config';

const DashboardScreen = ({navigation, route}) => {
  const {user} = route.params || {};

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/OfficeBoy/${user?.id}/tasks`);
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Could not load your tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Har baar screen par wapis aane par list refresh ho
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, []),
  );

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const scheduledTasks = pendingTasks.filter(t => t.taskMode === 'Later');

  const handleMarkComplete = async taskId => {
    setCompletingId(taskId);
    try {
      const response = await fetch(`${API_BASE}/api/Tasks/${taskId}/complete`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchTasks();
      } else {
        Alert.alert('Error', 'Could not mark task as complete');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setCompletingId(null);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()} • ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.userName}>{user?.name || 'Office Boy'}</Text>
            </View>
            <View style={styles.headerIconsRow}>
              <View style={styles.bellBox}>
                <Text style={styles.bellIcon}>🔔</Text>
              </View>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B5E3F"
            style={{marginTop: 40}}
          />
        ) : (
          <>
            {/* Stat cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{pendingTasks.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: '#7C5CFC'}]}>
                  {scheduledTasks.length}
                </Text>
                <Text style={styles.statLabel}>Scheduled</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: '#1B6E47'}]}>
                  {completedTasks.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            {/* Scheduled Tasks */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Scheduled Tasks</Text>
              {scheduledTasks.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{scheduledTasks.length}</Text>
                </View>
              )}
            </View>

            {scheduledTasks.length === 0 ? (
              <Text style={styles.noData}>No scheduled tasks right now</Text>
            ) : (
              <View style={styles.tasksList}>
                {scheduledTasks.map(task => (
                  <View key={task.taskId} style={styles.taskCard}>
                    <View style={styles.taskCardTop}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.description}
                      </Text>
                      <View style={styles.scheduledBadge}>
                        <Text style={styles.scheduledBadgeText}>Scheduled</Text>
                      </View>
                    </View>
                    <Text style={styles.taskMeta}>By {task.assignedBy}</Text>
                    <Text style={styles.taskMeta}>📍 {task.location}</Text>
                    <Text style={styles.taskMeta}>🕐 {formatDate(task.taskTime)}</Text>

                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => handleMarkComplete(task.taskId)}
                      disabled={completingId === task.taskId}>
                      {completingId === task.taskId ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.completeBtnText}>✓ Mark as Complete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={{height: 100}} />
          </>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OfficeBoyViewTask', {user})}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OfficeBoyProfile', {user})}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F6F5'},

  header: {
    backgroundColor: '#1B5E3F',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 45,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {color: '#A8D5BA', fontSize: 13},
  userName: {color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 2},
  headerIconsRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  bellBox: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellIcon: {fontSize: 16},
  logoCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {width: 34, height: 34},

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
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
  statValue: {fontSize: 22, fontWeight: 'bold', color: '#E8912B'},
  statLabel: {fontSize: 12, color: '#8A8F8C', marginTop: 4},

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {fontSize: 16, fontWeight: 'bold', color: '#1A1A1A'},
  countBadge: {
    backgroundColor: '#7C5CFC',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },
  countBadgeText: {color: '#fff', fontSize: 11, fontWeight: 'bold'},

  noData: {textAlign: 'center', color: '#999', marginTop: 10, fontSize: 14},

  tasksList: {paddingHorizontal: 16},
  taskCard: {
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
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  taskTitle: {flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginRight: 8},
  scheduledBadge: {
    backgroundColor: '#F5F2FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scheduledBadgeText: {fontSize: 11, color: '#7C5CFC', fontWeight: '600'},
  taskMeta: {fontSize: 12, color: '#777', marginTop: 3},

  completeBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  completeBtnText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},

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

export default DashboardScreen;
