// // import React from 'react';
// // import {View, Text, StyleSheet} from 'react-native';

// // const AddFeedbackScreen = () => {
// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.text}>Add Feedback</Text>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0'},
// //   text: {fontSize: 20, fontWeight: 'bold', color: '#2e7d32'},
// // });

// // export default AddFeedbackScreen;





// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {API_BASE} from '../../config';

// const RATING_LABELS = {
//   1: 'Poor',
//   2: 'Below Average',
//   3: 'Average',
//   4: 'Good',
//   5: 'Excellent',
// };

// const AddFeedbackScreen = ({navigation, route}) => {
//   const {task, user} = route.params || {};
//   const [rating, setRating] = useState(0);
//   const [remarks, setRemarks] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (rating === 0) {
//       Alert.alert('Error', 'Please select a rating');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${API_BASE}/api/Tasks/${task?.taskId}/rate`,
//         {
//           method: 'PUT',
//           headers: {'Content-Type': 'application/json'},
//           body: JSON.stringify({
//             rating: rating,
//             remarks: remarks,
//           }),
//         },
//       );

//       if (response.ok) {
//         Alert.alert('Success', 'Feedback submitted successfully!', [
//           {text: 'OK', onPress: () => navigation.goBack()},
//         ]);
//       } else {
//         Alert.alert('Error', 'Could not submit feedback');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Could not connect to server');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backBtn}
//           onPress={() => navigation.goBack()}>
//           <Text style={styles.backArrow}>‹</Text>
//         </TouchableOpacity>
//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>Add Feedback & Rating</Text>
//           <Text style={styles.headerSubtitle}>Rate the completed task</Text>
//         </View>
//         <View style={styles.headerIconBox}>
//           <Text style={styles.headerIcon}>☆</Text>
//         </View>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Task Details */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <View style={styles.cardIconBox}>
//               <Text style={styles.cardIcon}>📋</Text>
//             </View>
//             <Text style={styles.cardTitle}>Task Details</Text>
//             <View style={styles.completedBadge}>
//               <Text style={styles.completedText}>✓ Completed</Text>
//             </View>
//           </View>
//           <View style={styles.divider} />

//           <Text style={styles.taskName}>{task?.description}</Text>
//           <View style={styles.byRow}>
//             <Text style={styles.byIcon}>👤</Text>
//             <Text style={styles.byText}>Completed by {task?.officeBoy}</Text>
//           </View>
//         </View>

//         {/* Performance Rating */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <View style={styles.cardIconBox}>
//               <Text style={styles.cardIcon}>☆</Text>
//             </View>
//             <Text style={styles.cardTitle}>Performance Rating</Text>
//           </View>
//           <View style={styles.divider} />

//           <View style={styles.starsRow}>
//             {[1, 2, 3, 4, 5].map(star => (
//               <TouchableOpacity key={star} onPress={() => setRating(star)}>
//                 <Text
//                   style={[
//                     styles.star,
//                     {color: star <= rating ? '#FFA726' : '#E0E0E0'},
//                   ]}>
//                   ★
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {rating > 0 && (
//             <View style={styles.ratingLabelBox}>
//               <Text style={styles.ratingLabelText}>
//                 {RATING_LABELS[rating]}
//               </Text>
//             </View>
//           )}

//           <View style={styles.scaleRow}>
//             <Text style={styles.scaleText}>Poor</Text>
//             <Text style={styles.scaleText}>Excellent</Text>
//           </View>
//         </View>

//         {/* Your Remarks */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <View style={styles.cardIconBox}>
//               <Text style={styles.cardIcon}>💬</Text>
//             </View>
//             <Text style={styles.cardTitle}>Your Remarks</Text>
//           </View>
//           <View style={styles.divider} />

//           <TextInput
//             style={styles.textArea}
//             placeholder="Write your feedback about the task performance..."
//             placeholderTextColor="#B0B0B0"
//             value={remarks}
//             onChangeText={setRemarks}
//             multiline
//             textAlignVertical="top"
//           />
//         </View>

//         {/* Submit button */}
//         <TouchableOpacity
//           style={styles.submitBtn}
//           onPress={handleSubmit}
//           disabled={loading}>
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.submitBtnText}>Submit Feedback</Text>
//           )}
//         </TouchableOpacity>

//         <View style={{height: 24}} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#F1F5F3'},

//   header: {
//     backgroundColor: '#1B6E47',
//     borderBottomLeftRadius: 26,
//     borderBottomRightRadius: 26,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 45,
//     paddingBottom: 22,
//     paddingHorizontal: 18,
//   },
//   backBtn: {
//     width: 42, height: 42, borderRadius: 21,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   backArrow: {color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 28},
//   headerCenter: {flex: 1, marginLeft: 14},
//   headerTitle: {color: '#fff', fontSize: 19, fontWeight: 'bold'},
//   headerSubtitle: {color: '#B8DCC8', fontSize: 12, marginTop: 2},
//   headerIconBox: {
//     width: 42, height: 42, borderRadius: 21,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   headerIcon: {color: '#fff', fontSize: 20},

//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     shadowOffset: {width: 0, height: 2},
//   },
//   cardHeader: {flexDirection: 'row', alignItems: 'center'},
//   cardIconBox: {
//     width: 40, height: 40, borderRadius: 11,
//     backgroundColor: '#E3F2E8',
//     alignItems: 'center', justifyContent: 'center',
//     marginRight: 12,
//   },
//   cardIcon: {fontSize: 17},
//   cardTitle: {flex: 1, fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
//   completedBadge: {
//     backgroundColor: '#E3F2E8',
//     paddingHorizontal: 11,
//     paddingVertical: 5,
//     borderRadius: 13,
//   },
//   completedText: {fontSize: 12, color: '#1B6E47', fontWeight: '600'},
//   divider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},

//   taskName: {fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
//   byRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
//   byIcon: {fontSize: 12, marginRight: 8},
//   byText: {fontSize: 14, color: '#757575'},

//   starsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 14,
//   },
//   star: {fontSize: 42, marginHorizontal: 6},
//   ratingLabelBox: {
//     alignSelf: 'center',
//     backgroundColor: '#E3F2E8',
//     paddingHorizontal: 26,
//     paddingVertical: 10,
//     borderRadius: 22,
//   },
//   ratingLabelText: {fontSize: 16, color: '#1B6E47', fontWeight: 'bold'},
//   scaleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 14,
//   },
//   scaleText: {fontSize: 13, color: '#9E9E9E'},

//   textArea: {
//     backgroundColor: '#FAFAFA',
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//     borderRadius: 10,
//     padding: 14,
//     fontSize: 14,
//     color: '#333',
//     minHeight: 130,
//   },

//   submitBtn: {
//     backgroundColor: '#1B6E47',
//     borderRadius: 14,
//     marginHorizontal: 16,
//     marginTop: 18,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   submitBtnText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
// });

// export default AddFeedbackScreen;



import React, {useState} from 'react';
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

const RATING_LABELS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const AddFeedbackScreen = ({navigation, route}) => {
  const {task, user} = route.params || {};
  const [rating, setRating] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/Tasks/${task?.taskId}/rate`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            rating: rating,
            remarks: remarks,
          }),
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Feedback submitted successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', 'Could not submit feedback');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Feedback & Rating</Text>
          <Text style={styles.headerSubtitle}>Rate the completed task</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>☆</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Task Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>📋</Text>
            </View>
            <Text style={styles.cardTitle}>Task Details</Text>
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <Text style={styles.taskName}>{task?.description}</Text>
          <View style={styles.byRow}>
            <Text style={styles.byIcon}>👤</Text>
            <Text style={styles.byText}>Completed by {task?.officeBoy}</Text>
          </View>
        </View>

        {/* Performance Rating */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>☆</Text>
            </View>
            <Text style={styles.cardTitle}>Performance Rating</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text
                  style={[
                    styles.star,
                    {color: star <= rating ? '#FFA726' : '#E0E0E0'},
                  ]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <View style={styles.ratingLabelBox}>
              <Text style={styles.ratingLabelText}>
                {RATING_LABELS[rating]}
              </Text>
            </View>
          )}

          <View style={styles.scaleRow}>
            <Text style={styles.scaleText}>Poor</Text>
            <Text style={styles.scaleText}>Excellent</Text>
          </View>
        </View>

        {/* Your Remarks */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>💬</Text>
            </View>
            <Text style={styles.cardTitle}>Your Remarks</Text>
          </View>
          <View style={styles.divider} />

          <TextInput
            style={styles.textArea}
            placeholder="Write your feedback about the task performance..."
            placeholderTextColor="#B0B0B0"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>

        <View style={{height: 24}} />
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
  headerCenter: {flex: 1, marginLeft: 14},
  headerTitle: {color: '#fff', fontSize: 19, fontWeight: 'bold'},
  headerSubtitle: {color: '#B8DCC8', fontSize: 12, marginTop: 2},
  headerIconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcon: {color: '#fff', fontSize: 20},

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
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  cardIconBox: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: '#E3F2E8',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {fontSize: 17},
  cardTitle: {flex: 1, fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
  completedBadge: {
    backgroundColor: '#E3F2E8',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 13,
  },
  completedText: {fontSize: 12, color: '#1B6E47', fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},

  taskName: {fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
  byRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  byIcon: {fontSize: 12, marginRight: 8},
  byText: {fontSize: 14, color: '#757575'},

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  star: {fontSize: 42, marginHorizontal: 6},
  ratingLabelBox: {
    alignSelf: 'center',
    backgroundColor: '#E3F2E8',
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 22,
  },
  ratingLabelText: {fontSize: 16, color: '#1B6E47', fontWeight: 'bold'},
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  scaleText: {fontSize: 13, color: '#9E9E9E'},

  textArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#333',
    minHeight: 130,
  },

  submitBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});

export default AddFeedbackScreen;