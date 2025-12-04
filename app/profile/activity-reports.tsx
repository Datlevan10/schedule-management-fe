import { Stack } from 'expo-router';
import React from 'react';
import ActivityReportsScreen from '../screens/Reports/ActivityReportsScreen';

export default function ActivityReportsPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Báo Cáo Hoạt Động',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1F2937',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <ActivityReportsScreen />
    </>
  );
}