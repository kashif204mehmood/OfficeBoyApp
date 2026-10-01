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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE} from '../../config';

const TABS = ['All', 'Pending', 'Completed'];

const MODE_STYLE = {
  Now: {bg: '#E3F2E8', color: '#1B6E47', label: 'Now'},
  Later: {bg: '#F5F2FF', color: '#7C5CFC', label: 'Scheduled'},
  Geofence: {bg: '#EAF3FB', color: '#1976D2', label: 'Geofence'},
};

const ViewTaskScreen = ({navigation, route}) => {
  const {user} = route.params || {};

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
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

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, []),
  );

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

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  const filteredTasks = tasks
    .filter(t => {
      if (activeTab === 'All') return true;
      return t.status === activeTab;
    })
    .filter(t =>
      search.trim()
        ? (t.description || '').toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .sort((a, b) => new Date(b.taskTime) - new Date(a.taskTime));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchTasks}>
            <Text style={styles.refreshIcon}>⟳</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#B8DCC8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const count =
              tab === 'All'
                ? tasks.length
                : tab === 'Pending'
                ? pendingCount
                : completedCount;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
                <Text
                  style={[
                    styles.tabCount,
                    activeTab === tab && styles.tabCountActive,
                  ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.resultsText}>{filteredTasks.length} tasks found</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B6E47" style={{marginTop: 40}} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <View style={styles.content}>
            {filteredTasks.length === 0 ? (
              <Text style={styles.noData}>No tasks found</Text>
            ) : (
              filteredTasks.map(task => {
                const mode = MODE_STYLE[task.taskMode] || MODE_STYLE.Now;
                const isCompleted = task.status === 'Completed';
                return (
                  <View key={task.taskId} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.description}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {backgroundColor: isCompleted ? '#E3F2E8' : '#FFF3E0'},
                        ]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {color: isCompleted ? '#1B6E47' : '#E8912B'},
                          ]}>
                          {isCompleted ? '✓ Completed' : '⏳ Pending'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modeBadge}>
                      <View style={[styles.modeDot, {backgroundColor: mode.color}]} />
                      <Text style={[styles.modeBadgeText, {color: mode.color}]}>
                        {mode.label}
                      </Text>
                    </View>

                    <Text style={styles.taskMeta}>By {task.assignedBy}</Text>
                    <Text style={styles.taskMeta}>📍 {task.location}</Text>
                    <Text style={styles.taskMeta}>🕐 {formatDate(task.taskTime)}</Text>

                    {isCompleted && task.rating && (
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Text
                            key={star}
                            style={[
                              styles.star,
                              {color: star <= task.rating ? '#F5A623' : '#E0E0E0'},
                            ]}>
                            ★
                          </Text>
                        ))}
                      </View>
                    )}

                    {!isCompleted && (
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
                    )}
                  </View>
                );
              })
            )}
          </View>
          <View style={{height: 100}} />
        </ScrollView>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OfficeBoyDashboard', {user})}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Tasks</Text>
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
    backgroundColor: '#1B6E47',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  refreshBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  refreshIcon: {color: '#fff', fontSize: 16},

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 16,
    height: 44,
  },
  searchIcon: {fontSize: 14, marginRight: 8},
  searchInput: {flex: 1, color: '#fff', fontSize: 14},

  tabsRow: {flexDirection: 'row', marginTop: 14, gap: 8},
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 9,
    gap: 6,
  },
  tabActive: {backgroundColor: '#fff'},
  tabText: {color: '#D9EEE2', fontSize: 13, fontWeight: '600'},
  tabTextActive: {color: '#1B6E47'},
  tabCount: {
    color: '#fff', fontSize: 11, fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1,
  },
  tabCountActive: {color: '#1B6E47', backgroundColor: '#E3F2E8'},

  resultsText: {
    fontSize: 12, color: '#9E9E9E',
    marginTop: 14, marginHorizontal: 18,
  },

  content: {padding: 16, paddingTop: 8},
  noData: {textAlign: 'center', color: '#999', marginTop: 50, fontSize: 15},

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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginRight: 8},
  statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
  statusBadgeText: {fontSize: 11, fontWeight: '700'},

  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  modeDot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  modeBadgeText: {fontSize: 11, fontWeight: '600'},

  taskMeta: {fontSize: 12, color: '#777', marginTop: 3},

  ratingRow: {flexDirection: 'row', marginTop: 8},
  star: {fontSize: 16, marginRight: 2},

  completeBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  completeBtnText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},

  bottomNav: {
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

export default ViewTaskScreen;