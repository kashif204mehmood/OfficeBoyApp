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

const ReviewByFiltersScreen = ({navigation}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoorFeedback();
  }, []);

  const fetchPoorFeedback = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Tasks`);
      const data = await response.json();

      const poorFeedback = Array.isArray(data)
        ? data.filter(task => typeof task.rating === 'number' && task.rating <= 3)
        : [];

      setTasks(poorFeedback);
    } catch (error) {
      Alert.alert('Error', 'Could not load poor feedback');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // "125d ago" nikalne ke liye
  const timeAgo = dateString => {
    if (!dateString) return '';
    const then = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const renderStars = rating => {
    const r = rating || 0;
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <Text
            key={star}
            style={[styles.star, {color: star <= r ? '#C62828' : '#E0E0E0'}]}>
            ★
          </Text>
        ))}
        <Text style={styles.ratingText}>{r} / 5</Text>
      </View>
    );
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
          <Text style={styles.headerTitle}>Poor Feedback</Text>
          <Text style={styles.headerSubtitle}>
            Tasks rated as Poor performance
          </Text>
        </View>

        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>☹</Text>
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
            {tasks.length === 0 ? (
              <Text style={styles.noData}>No poor feedback found</Text>
            ) : (
              tasks.map((task, index) => (
                <View key={index} style={styles.cardWrapper}>
                  {/* Red top bar */}
                  <View style={styles.redBar} />

                  <View style={styles.card}>
                    {/* Task name + Poor badge */}
                    <View style={styles.cardTop}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.description}
                      </Text>
                      <View style={styles.poorBadge}>
                        <Text style={styles.poorBadgeText}>⚠ Poor</Text>
                      </View>
                    </View>

                    {/* Pink info box */}
                    <View style={styles.infoBox}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>👤</Text>
                        <Text style={styles.infoLabel}>Office Boy: </Text>
                        <Text style={styles.infoValue}>{task.officeBoy}</Text>
                      </View>
                      <View style={[styles.infoRow, {marginTop: 6}]}>
                        <Text style={styles.infoIcon}>🎓</Text>
                        <Text style={styles.infoLabel}>Faculty: </Text>
                        <Text style={styles.infoValue}>{task.faculty}</Text>
                      </View>
                    </View>

                    {/* Stars + time */}
                    <View style={styles.ratingRow}>
                      {renderStars(task.rating)}
                      <Text style={styles.timeText}>
                        🕐 {timeAgo(task.taskTime)}
                      </Text>
                    </View>

                    {/* Remarks */}
                    {task.remarks ? (
                      <>
                        <View style={styles.divider} />
                        <View style={styles.remarksRow}>
                          <Text style={styles.quoteIcon}>❞</Text>
                          <Text style={styles.remarksText}>{task.remarks}</Text>
                        </View>
                      </>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
  headerSubtitle: {color: '#B8DCC8', fontSize: 12, marginTop: 2},
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {fontSize: 20, color: '#fff'},

  content: {padding: 14},
  cardWrapper: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  redBar: {height: 6, backgroundColor: '#B71C1C'},
  card: {backgroundColor: '#fff', padding: 16},

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 10,
  },
  poorBadge: {
    backgroundColor: '#FDECEC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  poorBadgeText: {fontSize: 12, color: '#C62828', fontWeight: '700'},

  infoBox: {
    backgroundColor: '#FDF3F3',
    borderWidth: 1,
    borderColor: '#F7DADA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {flexDirection: 'row', alignItems: 'center'},
  infoIcon: {fontSize: 12, marginRight: 6},
  infoLabel: {fontSize: 13, color: '#8A8A8A'},
  infoValue: {fontSize: 13, color: '#1A1A1A', fontWeight: 'bold'},

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsRow: {flexDirection: 'row', alignItems: 'center'},
  star: {fontSize: 18, marginRight: 2},
  ratingText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeText: {fontSize: 12, color: '#9E9E9E'},

  divider: {height: 1, backgroundColor: '#F3E5E5', marginVertical: 12},
  remarksRow: {flexDirection: 'row', alignItems: 'flex-start'},
  quoteIcon: {fontSize: 15, color: '#C62828', marginRight: 8},
  remarksText: {
    flex: 1,
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },

  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 15,
  },
});

export default ReviewByFiltersScreen;