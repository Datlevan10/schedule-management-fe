import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { Button, Card } from '../../components/common';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [reminder, setReminder] = useState('15 minutes before');

  const categories = ['Work', 'Personal', 'Health', 'Education', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const reminders = ['None', '5 minutes before', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'];

  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    Alert.alert(
      'Success',
      'Task created successfully!',
      [{ text: 'OK', onPress: () => {
        setTitle('');
        setDescription('');
        setDate(new Date());
        setTime(new Date());
        setCategory('Work');
        setPriority('Medium');
        setReminder('15 minutes before');
      }}]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Task</Text>
          <Text style={styles.subtitle}>Add a new task to your schedule</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>📅 {date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>🕐 {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((prio) => (
                <TouchableOpacity
                  key={prio}
                  style={[
                    styles.priorityButton,
                    priority === prio && styles.priorityButtonSelected,
                    priority === prio && { backgroundColor: getPriorityColor(prio) },
                  ]}
                  onPress={() => setPriority(prio)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === prio && styles.priorityTextSelected,
                    ]}
                  >
                    {prio}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reminder</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {reminders.map((rem) => (
                <TouchableOpacity
                  key={rem}
                  style={[
                    styles.chip,
                    reminder === rem && styles.chipSelected,
                  ]}
                  onPress={() => setReminder(rem)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reminder === rem && styles.chipTextSelected,
                    ]}
                  >
                    {rem}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Card>

        <Button
          title="Create Task"
          onPress={handleCreateTask}
          style={styles.createButton}
        />

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Low': return '#10B981';
    case 'Medium': return '#F59E0B';
    case 'High': return '#EF4444';
    case 'Urgent': return '#DC2626';
    default: return Colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  formCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.background.primary,
  },
  dateTimeText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  priorityText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
});