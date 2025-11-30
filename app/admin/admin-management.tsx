import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../constants';

export default function AdminManagementScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Management</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.text}>Admin management features coming soon...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { ...Typography.h2, color: Colors.text.primary },
  card: { marginHorizontal: 20, padding: 20, backgroundColor: Colors.white, borderRadius: 12 },
  text: { ...Typography.body1, color: Colors.text.primary },
});