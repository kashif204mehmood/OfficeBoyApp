import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

const RoleSelector = ({roles, selectedRole, onSelectRole}) => {
  return (
    <View style={styles.container}>
      {roles.map(role => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleButton,
            selectedRole === role && styles.roleButtonActive,
          ]}
          onPress={() => onSelectRole(role)}>
          <Text
            style={[
              styles.roleText,
              selectedRole === role && styles.roleTextActive,
            ]}>
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2e7d32',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2e7d32',
  },
  roleText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#fff',
  },
});

export default RoleSelector;
