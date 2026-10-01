// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from 'react-native';
// import {API_BASE} from '../../config';


// const ViewFacultyScreen = ({navigation}) => {
//   const [faculty, setFaculty] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchFaculty();
//   }, []);

//   const fetchFaculty = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/Supervisor/faculty`);
//       const data = await response.json();
//       setFaculty(data);
//     } catch (error) {
//       Alert.alert('Error', 'Could not load faculty');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return '??';
//     const words = name.trim().split(/[\s_]+/);
//     if (words.length >= 2) {
//       return (words[0][0] + words[1][0]).toUpperCase();
//     }
//     return name.substring(0, 2).toUpperCase();
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backArrow}>←</Text>
//         </TouchableOpacity>
//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>View Faculty</Text>
//           <Text style={styles.headerSubtitle}>{faculty.length} faculty members</Text>
//         </View>
//         <View style={styles.logoContainer}>
//           <Image
//             source={require('../../../assets/logo.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#2e7d32" style={{marginTop: 40}} />
//       ) : (
//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           <View style={styles.content}>
//             {faculty.length === 0 ? (
//               <Text style={styles.noData}>No faculty found</Text>
//             ) : (
//               faculty.map((member, index) => (
//                 <View key={member.id || index} style={styles.card}>
//                   {/* Avatar */}
//                   <View style={styles.avatarContainer}>
//                     <View style={styles.avatar}>
//                       <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
//                     </View>
//                   </View>

//                   {/* Info */}
//                   <View style={styles.info}>
//                     <Text style={styles.name}>{member.name}</Text>
//                     {member.office && (
//                       <Text style={styles.office}>{member.office}</Text>
//                     )}
//                     <View style={styles.locationRow}>
//                       <View style={styles.dot} />
//                       <Text style={styles.locationIcon}>📍</Text>
//                       <Text style={styles.location}>
//                         {member.floor || 'No Floor'} • {member.office || 'No Office'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               ))
//             )}
//           </View>
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#f0f4f0'},
//   header: {
//     backgroundColor: '#2e7d32',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: 50,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//   },
//   backBtn: {
//     width: 36, height: 36, borderRadius: 10,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   backArrow: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
//   headerCenter: {alignItems: 'center'},
//   headerTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
//   headerSubtitle: {color: '#a5d6a7', fontSize: 12, marginTop: 2},
//   logoContainer: {
//     width: 36, height: 36, borderRadius: 18,
//     backgroundColor: '#fff', alignItems: 'center',
//     justifyContent: 'center', overflow: 'hidden',
//   },
//   logo: {width: 32, height: 32},
//   scrollView: {flex: 1},
//   content: {padding: 16},
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     elevation: 2,
//   },
//   avatarContainer: {
//     marginRight: 14,
//   },
//   avatar: {
//     width: 52, height: 52, borderRadius: 14,
//     backgroundColor: '#e8f5e9',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   avatarText: {
//     fontSize: 16, fontWeight: 'bold', color: '#2e7d32',
//   },
//   info: {flex: 1},
//   name: {
//     fontSize: 16, fontWeight: 'bold',
//     color: '#1a1a1a', marginBottom: 2,
//   },
//   office: {
//     fontSize: 13, color: '#666',
//     marginBottom: 6,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: 8, height: 8, borderRadius: 4,
//     backgroundColor: '#4caf50', marginRight: 6,
//   },
//   locationIcon: {fontSize: 12, marginRight: 4},
//   location: {
//     fontSize: 13, color: '#555',
//   },
//   noData: {
//     textAlign: 'center', color: '#999',
//     marginTop: 40, fontSize: 16,
//   },
// });

// export default ViewFacultyScreen;




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

// Har card ke avatar ka rang - cycle hota rehta hai
const AVATAR_COLORS = [
  '#0F7A4A',
  '#1565C0',
  '#7B1FA2',
  '#C2185B',
  '#00695C',
  '#4E342E',
];

const ViewFacultyScreen = ({navigation}) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Supervisor/faculty`);
      const data = await response.json();
      setFaculty(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Could not load faculty');
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = name => {
    if (!name) return '??';
    // "Dr. Ahmad Raza" -> AR  |  "Prof.Sarah Khan" -> PK
    const cleaned = name.replace(/^(Dr\.?|Prof\.?|Ms\.?|Mr\.?)\s*/i, '');
    const words = cleaned.trim().split(/[\s_.]+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.substring(0, 1).toUpperCase();
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

        <Text style={styles.headerTitle}>View Faculty</Text>

        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>🎓</Text>
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
            {faculty.length === 0 ? (
              <Text style={styles.noData}>No faculty found</Text>
            ) : (
              faculty.map((member, index) => (
                <View key={member.id || index} style={styles.card}>
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
                      {getInitials(member.name)}
                    </Text>
                  </View>

                  {/* Name + office + floor */}
                  <View style={styles.info}>
                    <Text style={styles.name}>{member.name}</Text>
                    <Text style={styles.office}>{member.office || '-'}</Text>
                    <View style={styles.floorRow}>
                      <Text style={styles.floorIcon}>◈</Text>
                      <Text style={styles.floorText}>
                        {member.floor || 'No floor'}
                      </Text>
                    </View>
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
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 14,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {fontSize: 18},

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
  name: {fontSize: 16, fontWeight: 'bold', color: '#1A1A1A'},
  office: {fontSize: 13, color: '#9E9E9E', marginTop: 2, marginBottom: 5},
  floorRow: {flexDirection: 'row', alignItems: 'center'},
  floorIcon: {fontSize: 13, color: '#1B6E47', marginRight: 5},
  floorText: {fontSize: 13, color: '#1B6E47', fontWeight: '600'},

  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 15,
  },
});

export default ViewFacultyScreen;