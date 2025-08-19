import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { dateUtils } from '../../utils/dateUtils';
import EventCard from './EventCard';

const EventList = ({
  events = [],
  onEventPress,
  onEventEdit,
  onEventDelete,
  onRefresh,
  isRefreshing = false,
  showGroupByDate = true,
  showSearch = true,
  filterCategory = null,
  filterPriority = null,
  sortBy = 'date', // 'date', 'priority', 'category'
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'today', 'upcoming', 'past'

  // Filter and sort events
  const processedEvents = useMemo(() => {
    let filtered = [...events];

    // Text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(event => event.category === filterCategory);
    }

    // Priority filter
    if (filterPriority) {
      filtered = filtered.filter(event => event.priority === filterPriority);
    }

    // Date filter
    const today = dateUtils.getCurrentDate();
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(event => event.date === today);
        break;
      case 'upcoming':
        filtered = filtered.filter(event => 
          dateUtils.isUpcoming(event.date, event.time)
        );
        break;
      case 'past':
        filtered = filtered.filter(event => 
          dateUtils.isPast(event.date, event.time)
        );
        break;
      // 'all' - no additional filtering
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateCompare = new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
          return dateCompare;
        
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          const priorityCompare = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
          if (priorityCompare !== 0) return priorityCompare;
          // If same priority, sort by date
          return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
        
        case 'category':
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;
          // If same category, sort by date
          return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
        
        default:
          return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
      }
    });

    return filtered;
  }, [events, searchQuery, selectedFilter, filterCategory, filterPriority, sortBy]);

  // Group events by date if enabled
  const groupedEvents = useMemo(() => {
    if (!showGroupByDate) {
      return [{ title: 'All Events', data: processedEvents }];
    }

    const groups = {};
    processedEvents.forEach(event => {
      const dateKey = event.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.keys(groups)
      .sort()
      .map(dateKey => ({
        title: dateUtils.formatDate(dateKey, 'full'),
        date: dateKey,
        data: groups[dateKey],
      }));
  }, [processedEvents, showGroupByDate]);

  const renderFilterButton = (filter, label, icon) => {
    const isSelected = selectedFilter === filter;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected && styles.filterButtonActive
        ]}
        onPress={() => setSelectedFilter(filter)}
      >
        <Ionicons
          name={icon}
          size={16}
          color={isSelected ? colors.white : colors.primary}
        />
        <Text style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextActive
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => {
    if (!showGroupByDate) return null;
    
    const isToday = section.date === dateUtils.getCurrentDate();
    const eventCount = section.data.length;
    
    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={[
            styles.sectionHeaderTitle,
            isToday && styles.sectionHeaderTitleToday
          ]}>
            {isToday ? 'Today' : section.title}
          </Text>
          <View style={[
            styles.eventCountBadge,
            isToday && styles.eventCountBadgeToday
          ]}>
            <Text style={[
              styles.eventCountText,
              isToday && styles.eventCountTextToday
            ]}>
              {eventCount}
            </Text>
          </View>
        </View>
        {isToday && (
          <Ionicons
            name="today"
            size={16}
            color={colors.primary}
          />
        )}
      </View>
    );
  };

  const renderEventItem = ({ item }) => (
    <EventCard
      event={item}
      onPress={onEventPress}
      onEdit={onEventEdit}
      onDelete={onEventDelete}
      showDate={!showGroupByDate}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={colors.lightGray}
      />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() 
          ? `No events match "${searchQuery}"`
          : selectedFilter === 'today'
          ? "No events scheduled for today"
          : selectedFilter === 'upcoming'
          ? "No upcoming events"
          : selectedFilter === 'past'
          ? "No past events"
          : "No events to display"
        }
      </Text>
    </View>
  );

  const getSectionListData = () => {
    return groupedEvents.map(group => ({
      title: group.title,
      date: group.date,
      data: group.data,
    }));
  };

  return (
    <View style={[styles.container, style]}>
      {/* Search and Filters */}
      {showSearch && (
        <View style={styles.searchSection}>
          {/* Search Input would go here - simplified for now */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search events...</Text>
          </View>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtons}>
          {renderFilterButton('all', 'All', 'list-outline')}
          {renderFilterButton('today', 'Today', 'today-outline')}
          {renderFilterButton('upcoming', 'Upcoming', 'arrow-up-outline')}
          {renderFilterButton('past', 'Past', 'checkmark-outline')}
        </View>
      </View>

      {/* Events List */}
      <FlatList
        data={groupedEvents.flatMap(group => 
          showGroupByDate 
            ? [{ type: 'header', ...group }, ...group.data.map(item => ({ type: 'item', ...item }))]
            : group.data.map(item => ({ type: 'item', ...item }))
        )}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return renderSectionHeader({ section: item });
          }
          return renderEventItem({ item });
        }}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header_${item.date}` : `event_${item.id || index}`
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  searchSection: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.white,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },

  searchPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
  },

  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  filterButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing[1],
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
  },

  filterButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },

  filterButtonTextActive: {
    color: colors.white,
  },

  listContainer: {
    paddingBottom: spacing[4],
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    marginTop: spacing[2],
  },

  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  sectionHeaderTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  sectionHeaderTitleToday: {
    color: colors.primary,
  },

  eventCountBadge: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventCountBadgeToday: {
    backgroundColor: colors.primary,
  },

  eventCountText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 10,
  },

  eventCountTextToday: {
    color: colors.white,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    marginTop: spacing[8],
  },

  emptyTitle: {
    ...typography.h5,
    color: colors.textSecondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },

  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EventList;