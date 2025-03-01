import React, { useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Text, FAB, Searchbar, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import HabitItem from '../components/HabitItem';
import { HabitCategory } from '../types';

type HabitsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HabitsScreen = () => {
  const navigation = useNavigation<HabitsScreenNavigationProp>();
  const { theme, isDarkMode } = useTheme();
  const { habits, getHabitStatsByHabitId } = useHabits();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  
  // Handle search
  const onChangeSearch = (query: string) => setSearchQuery(query);
  
  // Handle category filter
  const toggleCategory = (category: HabitCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };
  
  // Filter habits based on search and category
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? habit.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No habits found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCategory
          ? 'Try changing your search or filters'
          : 'Add a new habit to start tracking your progress'}
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <Searchbar
        placeholder="Search habits"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Category filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === 'health'}
            onPress={() => toggleCategory('health')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.health}
          >
            Health
          </Chip>
          <Chip
            selected={selectedCategory === 'work'}
            onPress={() => toggleCategory('work')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.work}
          >
            Work
          </Chip>
          <Chip
            selected={selectedCategory === 'personal'}
            onPress={() => toggleCategory('personal')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.personal}
          >
            Personal
          </Chip>
          <Chip
            selected={selectedCategory === 'education'}
            onPress={() => toggleCategory('education')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.education}
          >
            Education
          </Chip>
          <Chip
            selected={selectedCategory === 'social'}
            onPress={() => toggleCategory('social')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.social}
          >
            Social
          </Chip>
          <Chip
            selected={selectedCategory === 'other'}
            onPress={() => toggleCategory('other')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            selectedColor={theme.colors.categoryColors.other}
          >
            Other
          </Chip>
        </ScrollView>
      </View>
      
      <Divider />
      
      {/* Habits list */}
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const stats = getHabitStatsByHabitId(item.id);
          return (
            <HabitItem
              habit={item}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
              showStatus={false}
              showProgress={true}
              completionRate={stats?.completionRate || 0}
              currentStreak={stats?.currentStreak || 0}
            />
          );
        }}
        contentContainerStyle={filteredHabits.length === 0 ? { flex: 1 } : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
      
      {/* Add habit button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#fff"
        onPress={() => navigation.navigate('AddHabit')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  filterChip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  filterChipText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HabitsScreen; 