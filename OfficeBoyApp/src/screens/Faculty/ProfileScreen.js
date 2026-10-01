// import React from 'react';
// import {View, Text, StyleSheet} from 'react-native';

// const ProfileScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Faculty Profile</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0'},
//   text: {fontSize: 20, fontWeight: 'bold', color: '#2e7d32'},
// });

// export default ProfileScreen;





import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const ProfileScreen = ({navigation, route}) => {
  const {user} = route.params || {};

  const getInitials = name => {
    if (!name) return '??';
    const cleaned = name.replace(/^(Dr\.?|Prof\.?|Ms\.?|Mr\.?)\s*/i, '');
    const words = cleaned.trim().split(/[\s_.]+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return cleaned.substring(0, 2).toUpperCase();
  };

  const infoRows = [
    {icon: '👤', label: 'Name', value: user?.name || '-'},
    {icon: '🎓', label: 'Role', value: 'Faculty'},
    {icon: '🆔', label: 'Account ID', value: String(user?.id || '-')},
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{width: 42}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Faculty</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {infoRows.map((row, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,
                index !== infoRows.length - 1 && styles.infoRowBorder,
              ]}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
              </View>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutBtnText}>⇥  Logout</Text>
        </TouchableOpacity>

        <View style={{height: 24}} />
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
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ViewTask', {user: user})}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
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
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 28},
  headerTitle: {
    flex: 1, color: '#fff', fontSize: 21,
    fontWeight: 'bold', textAlign: 'center',
  },

  avatarCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 28,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  avatar: {
    width: 84, height: 84, borderRadius: 20,
    backgroundColor: '#1B6E47',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {color: '#fff', fontSize: 28, fontWeight: 'bold'},
  name: {fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 16},
  roleBadge: {
    backgroundColor: '#E3F2E8',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    marginTop: 10,
  },
  roleBadgeText: {fontSize: 14, color: '#1B6E47', fontWeight: '600'},

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoRowBorder: {borderBottomWidth: 1, borderBottomColor: '#F2F2F2'},
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#E3F2E8',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  infoIcon: {fontSize: 15},
  infoLabel: {flex: 1, fontSize: 14, color: '#8A8A8A'},
  infoValue: {fontSize: 14, color: '#1A1A1A', fontWeight: '600'},

  logoutBtn: {
    backgroundColor: '#E53935',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutBtnText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},

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
});

export default ProfileScreen;