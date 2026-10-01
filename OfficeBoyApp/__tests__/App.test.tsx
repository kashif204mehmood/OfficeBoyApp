/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const {View, Text} = require('react-native');

  return function MockAppNavigator() {
    return (
      <View>
        <Text>App Shell</Text>
      </View>
    );
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
