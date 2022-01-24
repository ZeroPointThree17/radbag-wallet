import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Separator = () => (
    <View style={styles.separator} />
  );

export const SeparatorBorder = () => (
    <View style={styles.separatorBorder} />
    );

export const SeparatorBorderMargin = () => (
  <View style={styles.separatorBorderMargin} />
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
    separatorBorderMargin: {
      marginVertical: 5,
      borderTopColor: '#737373',
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });