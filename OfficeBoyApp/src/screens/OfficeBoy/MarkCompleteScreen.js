import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MarkCompleteScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mark Complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0'},
  text: {fontSize: 20, fontWeight: 'bold', color: '#2e7d32'},
});

export default MarkCompleteScreen;
