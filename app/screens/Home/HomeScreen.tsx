import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { Card } from '../../components/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  scheduleItems: number;
}

const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: '1',
    name: 'Student Daily',
    description: 'Perfect for students managing classes and study time',
    category: 'Education',
    icon: '📚',
    color: '#6366F1',
    scheduleItems: 8,
  },
  {
    id: '2',
    name: 'Work From Home',
    description: 'Optimize your remote work productivity',
    category: 'Professional',
    icon: '💼',
    color: '#10B981',
    scheduleItems: 10,
  },
  {
    id: '3',
    name: 'Fitness Routine',
    description: 'Stay fit with structured workout schedules',
    category: 'Health',
    icon: '🏋️',
    color: '#F59E0B',
    scheduleItems: 6,
  },
  {
    id: '4',
    name: 'Freelancer Pro',
    description: 'Manage multiple clients and projects efficiently',
    category: 'Professional',
    icon: '🚀',
    color: '#8B5CF6',
    scheduleItems: 12,
  },
  {
    id: '5',
    name: 'Family Planner',
    description: 'Coordinate family activities and responsibilities',
    category: 'Personal',
    icon: '👨‍👩‍👧‍👦',
    color: '#EC4899',
    scheduleItems: 9,
  },
  {
    id: '6',
    name: 'Morning Routine',
    description: 'Start your day right with a structured morning',
    category: 'Personal',
    icon: '☀️',
    color: '#14B8A6',
    scheduleItems: 5,
  },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.name || parsedData.email || 'User');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const categories = ['All', 'Education', 'Professional', 'Health', 'Personal'];

  const filteredTemplates = selectedCategory === 'All'
    ? scheduleTemplates
    : scheduleTemplates.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (template: ScheduleTemplate) => {
    Alert.alert(
      'Import Template',
      `Would you like to import "${template.name}" template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: () => {
            Alert.alert('Success', 'Template imported successfully!');
          } 
        },
      ]
    );
  };

  const renderTemplate = ({ item }: { item: ScheduleTemplate }) => (
    <TouchableOpacity onPress={() => handleTemplateSelect(item)}>
      <Card style={[styles.templateCard, { borderLeftColor: item.color }]}>
        <View style={styles.templateHeader}>
          <Text style={styles.templateIcon}>{item.icon}</Text>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateCategory}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.templateDescription}>{item.description}</Text>
        <View style={styles.templateFooter}>
          <Text style={styles.scheduleItems}>{item.scheduleItems} schedule items</Text>
          <TouchableOpacity style={[styles.importButton, { backgroundColor: item.color }]}>
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Productivity</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule Templates</Text>
        <Text style={styles.sectionSubtitle}>
          Choose from our curated templates to get started quickly
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredTemplates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.templateList}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  categoryList: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  templateList: {
    paddingBottom: 20,
  },
  templateCard: {
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  templateCategory: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  templateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleItems: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
  importButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  importButtonText: {
    ...Typography.body2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});