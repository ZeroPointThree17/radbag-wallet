import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Separator = () => (
    <View style={styles.separator} />
  );

export const SeparatorBorder = () => (
    <View style={styles.separatorBorder} />
    );


const styles = StyleSheet.create({

     separator: {
      marginVertical: 10,
      borderBottomColor: '#737373',
      borderBottomWidth: 0,
    },
    separatorBorder: {
      marginVertical: 0,
      borderTopColor: '#737373',
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });