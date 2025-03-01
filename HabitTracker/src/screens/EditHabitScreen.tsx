import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Button, Chip, Switch, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Habit, HabitCategory, HabitFrequencyType, WeekDay } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditHabit'>;

const ICONS = [
  'run', 'weight-lifter', 'food-apple', 'water', 'book-open-page-variant',
  'school', 'briefcase', 'meditation', 'sleep', 'music', 'brush', 'palette',
  'phone', 'email', 'cash', 'home', 'broom', 'trash-can', 'pill',
  'smoking-off', 'bottle-tonic-plus', 'bike', 'swim', 'yoga'
];

const WEEKDAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EditHabitScreen = ({ route, navigation }: Props) => {
  const { habitId } = route.params;
  const { theme } = useTheme();
  const { habits, updateHabit } = useHabits();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('personal');
  const [icon, setIcon] = useState('checkbox-marked-circle-outline');
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>(['Mon', 'Wed', 'Fri']);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  
  // UI state
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Load habit data
  useEffect(() => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setCategory(habit.category);
      setIcon(habit.icon || 'checkbox-marked-circle-outline');
      setFrequencyType(habit.frequency.type);
      
      if (habit.frequency.type === 'weekly' && habit.frequency.days) {
        setSelectedDays(habit.frequency.days);
      }
      
      if (habit.reminder) {
        setHasReminder(true);
        
        // Parse time string to Date object
        const [hours, minutes] = habit.reminder.time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours);
        timeDate.setMinutes(minutes);
        setReminderTime(timeDate);
      } else {
        setHasReminder(false);
      }
    } else {
      // Habit not found, go back
      Alert.alert('Error', 'Habit not found');
      navigation.goBack();
    }
  }, [habitId, habits]);
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    
    // Create updated habit object
    const updatedHabit: Partial<Habit> = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      icon,
      frequency: {
        type: frequencyType,
        days: frequencyType === 'weekly' ? selectedDays : [],
        customDays: frequencyType === 'custom' ? [] : undefined,
      },
      reminder: hasReminder ? {
        enabled: true,
        time: reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        days: frequencyType === 'weekly' ? selectedDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as WeekDay[],
      } : undefined,
    };
    
    // Update habit
    updateHabit(habitId, updatedHabit);
    
    // Navigate back
    navigation.goBack();
  };
  
  // Toggle day selection for weekly frequency
  const toggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  // Handle time picker change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Habit name */}
        <TextInput
          label="Habit Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />
        
        {/* Habit description */}
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />
        
        {/* Category selection */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={category === 'health'}
              onPress={() => setCategory('health')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.health}
            >
              Health
            </Chip>
            <Chip
              selected={category === 'work'}
              onPress={() => setCategory('work')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.work}
            >
              Work
            </Chip>
            <Chip
              selected={category === 'personal'}
              onPress={() => setCategory('personal')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.personal}
            >
              Personal
            </Chip>
            <Chip
              selected={category === 'education'}
              onPress={() => setCategory('education')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.education}
            >
              Education
            </Chip>
            <Chip
              selected={category === 'social'}
              onPress={() => setCategory('social')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.social}
            >
              Social
            </Chip>
            <Chip
              selected={category === 'other'}
              onPress={() => setCategory('other')}
              style={styles.categoryChip}
              selectedColor={theme.colors.categoryColors.other}
            >
              Other
            </Chip>
          </ScrollView>
        </View>
        
        {/* Icon selection */}
        <Text style={styles.sectionTitle}>Icon</Text>
        <TouchableOpacity 
          style={styles.iconSelector} 
          onPress={() => setShowIconPicker(true)}
        >
          <Icon name={icon} size={32} color={theme.colors.primary} />
          <Text style={styles.iconSelectorText}>Select Icon</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        {/* Frequency selection */}
        <Text style={styles.sectionTitle}>Frequency</Text>
        <View style={styles.frequencyContainer}>
          <Chip
            selected={frequencyType === 'daily'}
            onPress={() => setFrequencyType('daily')}
            style={styles.frequencyChip}
          >
            Daily
          </Chip>
          <Chip
            selected={frequencyType === 'weekly'}
            onPress={() => setFrequencyType('weekly')}
            style={styles.frequencyChip}
          >
            Weekly
          </Chip>
          <Chip
            selected={frequencyType === 'custom'}
            onPress={() => setFrequencyType('custom')}
            style={styles.frequencyChip}
          >
            Custom
          </Chip>
        </View>
        
        {/* Day selection for weekly frequency */}
        {frequencyType === 'weekly' && (
          <View style={styles.daysContainer}>
            {WEEKDAYS.map(day => (
              <Chip
                key={day}
                selected={selectedDays.includes(day)}
                onPress={() => toggleDay(day)}
                style={styles.dayChip}
              >
                {day}
              </Chip>
            ))}
          </View>
        )}
        
        {/* Custom frequency options */}
        {frequencyType === 'custom' && (
          <View style={styles.customFrequencyContainer}>
            <Text style={styles.customFrequencyText}>
              Custom frequency options will be available in a future update.
            </Text>
          </View>
        )}
        
        {/* Reminder toggle */}
        <View style={styles.reminderContainer}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <Switch
            value={hasReminder}
            onValueChange={setHasReminder}
            color={theme.colors.primary}
          />
        </View>
        
        {/* Reminder time picker */}
        {hasReminder && (
          <TouchableOpacity 
            style={styles.timeSelector} 
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.timeSelectorText}>
              {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Submit button */}
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Save Changes
        </Button>
      </ScrollView>
      
      {/* Icon picker modal */}
      <Modal
        visible={showIconPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Icon</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowIconPicker(false)}
              />
            </View>
            <ScrollView style={styles.iconList}>
              <View style={styles.iconGrid}>
                {ICONS.map(iconName => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconItem,
                      icon === iconName && { backgroundColor: theme.colors.primaryContainer }
                    ]}
                    onPress={() => {
                      setIcon(iconName);
                      setShowIconPicker(false);
                    }}
                  >
                    <Icon name={iconName} size={32} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Time picker */}
      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  iconSelectorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frequencyChip: {
    marginRight: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayChip: {
    margin: 4,
  },
  customFrequencyContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  customFrequencyText: {
    fontStyle: 'italic',
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  timeSelectorText: {
    marginLeft: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconList: {
    flex: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: '2.5%',
  },
});

export default EditHabitScreen; 