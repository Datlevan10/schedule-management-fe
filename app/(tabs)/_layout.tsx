import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🏠" color={color} focused={color === '#6366F1'} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create Task',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="➕" color={color} focused={color === '#6366F1'} />
          ),
        }}
      />
      <Tabs.Screen
        name="notify"
        options={{
          title: 'Notify',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🔔" color={color} focused={color === '#6366F1'} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="👤" color={color} focused={color === '#6366F1'} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color, focused }: { icon: string; color: string; focused: boolean }) {
  return (
    <Text style={{ 
      fontSize: focused ? 26 : 24, 
      marginBottom: 2,
      opacity: focused ? 1 : 0.7 
    }}>
      {icon}
    </Text>
  );
}
