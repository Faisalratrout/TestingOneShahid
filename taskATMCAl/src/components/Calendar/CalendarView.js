import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEventColor } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { dateUtils } from '../../utils/dateUtils';
import { CALENDAR_CONFIG } from '../../utils/constants';

const CalendarView = ({ 
  events = [], 
  onDateSelect, 
  onEventPress, 
  selectedDate,
  showEventsList = true 
}) => {
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    generateMarkedDates();
  }, [events, selectedDate]);

  const generateMarkedDates = () => {
    const marked = {};

    // Mark dates with events
    events.forEach(event => {
      const dateKey = event.date;
      if (!marked[dateKey]) {
        marked[dateKey] = {
          dots: [],
          selected: false,
          selectedColor: colors.primary,
        };
      }

      // Add dot for event category
      const eventColor = getEventColor(event.category);
      marked[dateKey].dots.push({
        key: event.id,
        color: eventColor,
        selectedDotColor: colors.white,
      });
    });

    // Mark selected date
    if (selectedDate) {
      if (!marked[selectedDate]) {
        marked[selectedDate] = { dots: [] };
      }
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = colors.primary;
    }

    // Mark today
    const today = dateUtils.getCurrentDate();
    if (!marked[today]) {
      marked[today] = { dots: [] };
    }
    if (today !== selectedDate) {
      marked[today].marked = true;
      marked[today].dotColor = colors.primary;
    }

    setMarkedDates(marked);
  };

  const handleDayPress = (day) => {
    onDateSelect && onDateSelect(day.dateString);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month.month - 1);
    setCurrentYear(month.year);
  };

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date);
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  };

  const renderEventItem = (event) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventItem,
        { borderLeftColor: getEventColor(event.category) }
      ]}
      onPress={() => onEventPress && onEventPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.eventTime}>
          {dateUtils.formatTime(event.time)}
        </Text>
      </View>
      
      {event.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      )}
      
      <View style={styles.eventMeta}>
        <View style={[
          styles.eventCategory,
          { backgroundColor: getEventColor(event.category) }
        ]}>
          <Text style={styles.eventCategoryText}>
            {formatUtils.capitalize(event.category)}
          </Text>
        </View>
        
        {event.priority && (
          <View style={styles.eventPriority}>
            <Ionicons
              name={getPriorityIcon(event.priority)}
              size={12}
              color={getPriorityColor(event.priority)}
            />
            <Text style={[
              styles.eventPriorityText,
              { color: getPriorityColor(event.priority) }
            ]}>
              {formatUtils.capitalize(event.priority)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'alert-circle';
      case 'high':
        return 'chevron-up-circle';
      case 'medium':
        return 'remove-circle';
      case 'low':
        return 'chevron-down-circle';
      default:
        return 'remove-circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return colors.urgentPriority;
      case 'high':
        return colors.highPriority;
      case 'medium':
        return colors.mediumPriority;
      case 'low':
        return colors.lowPriority;
      default:
        return colors.mediumPriority;
    }
  };

  const renderCustomHeader = () => {
    const monthName = dateUtils.getMonthName(new Date(currentYear, currentMonth));
    
    return (
      <View style={styles.customHeader}>
        <Text style={styles.monthYearText}>
          {monthName} {currentYear}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              const newDate = new Date(currentYear, currentMonth - 1);
              setCurrentMonth(newDate.getMonth());
              setCurrentYear(newDate.getFullYear());
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              const today = new Date();
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
              onDateSelect && onDateSelect(dateUtils.getCurrentDate());
            }}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              const newDate = new Date(currentYear, currentMonth + 1);
              setCurrentMonth(newDate.getMonth());
              setCurrentYear(newDate.getFullYear());
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedDateEvents = getSelectedDateEvents();
  const hasEventsOnSelectedDate = selectedDateEvents.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Custom Header */}
      {renderCustomHeader()}

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          markingType={'multi-dot'}
          theme={{
            backgroundColor: colors.white,
            calendarBackground: colors.white,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textDisabled,
            dotColor: colors.primary,
            selectedDotColor: colors.white,
            arrowColor: colors.primary,
            disabledArrowColor: colors.textDisabled,
            monthTextColor: colors.primary,
            indicatorColor: colors.primary,
            textDayFontFamily: typography.body.fontFamily,
            textMonthFontFamily: typography.h5.fontFamily,
            textDayHeaderFontFamily: typography.label.fontFamily,
            textDayFontWeight: typography.body.fontWeight,
            textMonthFontWeight: typography.h5.fontWeight,
            textDayHeaderFontWeight: typography.label.fontWeight,
            textDayFontSize: typography.body.fontSize,
            textMonthFontSize: typography.h5.fontSize,
            textDayHeaderFontSize: typography.captionSmall.fontSize,
          }}
          hideExtraDays={true}
          firstDay={1} // Monday as first day
          hideDayNames={false}
          showWeekNumbers={false}
          disableAllTouchEventsForDisabledDays={true}
          enableSwipeMonths={true}
        />
      </View>

      {/* Events List for Selected Date */}
      {showEventsList && (
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.eventsSectionTitle}>
              {selectedDate ? (
                `Events for ${dateUtils.formatDate(selectedDate, 'long')}`
              ) : (
                'Select a date to view events'
              )}
            </Text>
            {selectedDate && (
              <View style={styles.eventsCount}>
                <Text style={styles.eventsCountText}>
                  {selectedDateEvents.length}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.eventsList}>
            {hasEventsOnSelectedDate ? (
              selectedDateEvents
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(renderEventItem)
            ) : selectedDate ? (
              <View style={styles.noEventsContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={colors.lightGray}
                />
                <Text style={styles.noEventsTitle}>No Events</Text>
                <Text style={styles.noEventsSubtitle}>
                  No events scheduled for this date
                </Text>
              </View>
            ) : (
              <View style={styles.selectDateContainer}>
                <Ionicons
                  name="hand-left-outline"
                  size={48}
                  color={colors.lightGray}
                />
                <Text style={styles.selectDateTitle}>Select a Date</Text>
                <Text style={styles.selectDateSubtitle}>
                  Tap on a calendar date to view events
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Event Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Event Categories</Text>
        <View style={styles.legendItems}>
          {Object.entries({
            work: 'Work',
            personal: 'Personal',
            health: 'Health',
            atm: 'ATM Transaction',
            finance: 'Finance',
            other: 'Other'
          }).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[
                styles.legendDot,
                { backgroundColor: getEventColor(key) }
              ]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  monthYearText: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  headerButton: {
    padding: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },

  todayButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
    paddingHorizontal: spacing[1],
  },

  calendarContainer: {
    backgroundColor: colors.white,
    margin: spacing[2],
    borderRadius: borderRadius.card,
    ...globalStyles.shadow,
  },

  eventsSection: {
    margin: spacing[2],
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    ...globalStyles.shadow,
  },

  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  eventsSectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    flex: 1,
  },

  eventsCount: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventsCountText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: 'bold',
  },

  eventsList: {
    padding: spacing[2],
  },

  eventItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginVertical: spacing[1],
    borderLeftWidth: 4,
    ...globalStyles.shadowSmall,
  },

  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },

  eventTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing[2],
  },

  eventTime: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  eventDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },

  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eventCategory: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1] / 2,
    borderRadius: borderRadius.sm,
  },

  eventCategoryText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  eventPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1] / 2,
  },

  eventPriorityText: {
    ...typography.captionSmall,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  noEventsContainer: {
    alignItems: 'center',
    padding: spacing[8],
  },

  noEventsTitle: {
    ...typography.h6,
    color: colors.textSecondary,
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },

  noEventsSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  selectDateContainer: {
    alignItems: 'center',
    padding: spacing[8],
  },

  selectDateTitle: {
    ...typography.h6,
    color: colors.textSecondary,
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },

  selectDateSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  legendContainer: {
    margin: spacing[2],
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    ...globalStyles.shadow,
  },

  legendTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },

  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
});

export default CalendarView;