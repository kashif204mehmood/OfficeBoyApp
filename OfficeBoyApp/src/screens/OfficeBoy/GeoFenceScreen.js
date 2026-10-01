import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const GeoFenceScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Geo Fence</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0'},
  text: {fontSize: 20, fontWeight: 'bold', color: '#2e7d32'},
});

export default GeoFenceScreen;
