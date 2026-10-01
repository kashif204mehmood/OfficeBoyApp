// import React from 'react';
// import {View, Text, StyleSheet} from 'react-native';

// const ViewTaskScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>View Task</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0'},
//   text: {fontSize: 20, fontWeight: 'bold', color: '#2e7d32'},
// });

// export default ViewTaskScreen;



import React, {useEffect, useState} from 'react';
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
import {API_BASE} from '../../config';

const ViewTaskScreen = ({navigation, route}) => {
  const {user} = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/Tasks`);
      const data = await response.json();

      const facultyTasks = Array.isArray(data)
        ? data.filter(task => task.faculty === user?.name)
        : [];

      setTasks(facultyTasks);
    } catch (error) {
      Alert.alert('Error', 'Could not load tasks');
      setTasks([]);
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

  const formatDate = d => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  };

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  // Filter + search apply karo
  const visibleTasks = tasks
    .filter(t => (filter === 'All' ? true : t.status === filter))
    .filter(t =>
      search.trim()
        ? (t.description || '').toLowerCase().includes(search.toLowerCase())
        : true,
    );

  const filterTabs = [
    {label: 'All', count: tasks.length},
    {label: 'Pending', count: pendingCount},
    {label: 'Completed', count: completedCount},
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity style={styles.headerCircle} onPress={fetchTasks}>
          <Text style={styles.headerIcon}>⟳</Text>
        </TouchableOpacity>
        <View style={[styles.headerCircle, {marginLeft: 10}]}>
          <Text style={styles.headerInitials}>{getInitials(user?.name)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#B0B0B0"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.label}
              style={[
                styles.filterCard,
                filter === tab.label && styles.filterCardActive,
              ]}
              onPress={() => setFilter(tab.label)}>
              <Text
                style={[
                  styles.filterLabel,
                  filter === tab.label && styles.filterLabelActive,
                ]}>
                {tab.label}
              </Text>
              <Text
                style={[
                  styles.filterCount,
                  filter === tab.label && styles.filterCountActive,
                ]}>
                {tab.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.foundText}>
          {visibleTasks.length} tasks found
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B6E47"
            style={{marginTop: 30}}
          />
        ) : visibleTasks.length === 0 ? (
          <Text style={styles.noData}>No tasks found</Text>
        ) : (
          visibleTasks.map((task, index) => (
            <View key={task.taskId || index} style={styles.taskCard}>
              <View style={styles.taskTop}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {task.description}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    task.status === 'Completed'
                      ? styles.statusBadgeDone
                      : styles.statusBadgePending,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      task.status === 'Completed'
                        ? styles.statusTextDone
                        : styles.statusTextPending,
                    ]}>
                    {task.status === 'Completed' ? '✓ Completed' : '⧗ Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>👤</Text>
                <Text style={styles.metaText}>
                  Assigned to {task.officeBoy}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{task.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>🕐</Text>
                <Text style={styles.metaText}>{formatDate(task.taskTime)}</Text>
              </View>

              {/* Completed tasks pe feedback button */}
              {task.status === 'Completed' && !task.rating && (
                <>
                  <View style={styles.taskDivider} />
                  <TouchableOpacity
                    style={styles.feedbackBtn}
                    onPress={() =>
                      navigation.navigate('AddFeedback', {
                        task: task,
                        user: user,
                      })
                    }>
                    <Text style={styles.feedbackBtnText}>
                      ☆  Add Feedback & Rating
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))
        )}

        <View style={{height: 20}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('FacultyDashboard', {user: user})
          }>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Tasks</Text>
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
    paddingHorizontal: 20,
  },
  headerTitle: {flex: 1, color: '#fff', fontSize: 24, fontWeight: 'bold'},
  headerCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcon: {color: '#fff', fontSize: 20},
  headerInitials: {color: '#fff', fontSize: 14, fontWeight: 'bold'},

  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  searchIcon: {fontSize: 16, marginRight: 10},
  searchInput: {flex: 1, fontSize: 15, color: '#333', paddingVertical: 12},

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 14,
  },
  filterCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 4,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 1,
  },
  filterCardActive: {backgroundColor: '#1B6E47'},
  filterLabel: {fontSize: 13, color: '#666'},
  filterLabelActive: {color: '#fff'},
  filterCount: {fontSize: 19, fontWeight: 'bold', color: '#1A1A1A', marginTop: 2},
  filterCountActive: {color: '#fff'},

  foundText: {
    fontSize: 13,
    color: '#8A8A8A',
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
  },

  taskCard: {
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
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskTitle: {
    flex: 1, fontSize: 16, fontWeight: 'bold',
    color: '#1A1A1A', marginRight: 10,
  },
  statusBadge: {paddingHorizontal: 11, paddingVertical: 5, borderRadius: 13},
  statusBadgeDone: {backgroundColor: '#E3F2E8'},
  statusBadgePending: {backgroundColor: '#FFF3E0'},
  statusText: {fontSize: 12, fontWeight: '600'},
  statusTextDone: {color: '#1B6E47'},
  statusTextPending: {color: '#E68A00'},

  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  metaIcon: {fontSize: 12, marginRight: 8},
  metaText: {fontSize: 13, color: '#757575'},

  taskDivider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},
  feedbackBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  feedbackBtnText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},

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
    alignItems: 'center', paddingHorizontal: 22,
    paddingVertical: 6, borderRadius: 12,
  },
  navItemActive: {backgroundColor: '#E3F2E8'},
  navIcon: {fontSize: 20},
  navText: {fontSize: 11, color: '#9E9E9E', marginTop: 3},
  navTextActive: {color: '#1B6E47', fontWeight: 'bold'},

  noData: {textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15},
});

export default ViewTaskScreen;