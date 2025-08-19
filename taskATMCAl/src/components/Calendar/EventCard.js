import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEventColor, getPriorityColor } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { dateUtils } from '../../utils/dateUtils';

const EventCard = ({ 
  event, 
  onPress, 
  onEdit, 
  onDelete, 
  showDate = false,
  style 
}) => {
  if (!event) return null;

  const eventColor = getEventColor(event.category);
  const priorityColor = getPriorityColor(event.priority);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      case 'health':
        return 'fitness-outline';
      case 'atm':
        return 'card-outline';
      case 'finance':
        return 'wallet-outline';
      default:
        return 'ellipse-outline';
    }
  };

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

  const handlePress = () => {
    if (onPress) {
      onPress(event);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event);
    }
  };

  const isUpcoming = dateUtils.isUpcoming(event.date, event.time);
  const isPast = dateUtils.isPast(event.date, event.time);
  const isToday = dateUtils.isToday(event.date);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: eventColor },
        isPast && styles.pastEvent,
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Event Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: eventColor }]}>
            <Ionicons
              name={getCategoryIcon(event.category)}
              size={16}
              color={colors.white}
            />
          </View>
          <View style={styles.titleSection}>
            <Text style={[
              styles.title,
              isPast && styles.pastEventText
            ]} numberOfLines={1}>
              {event.title}
            </Text>
            {showDate && (
              <Text style={[
                styles.dateText,
                isPast && styles.pastEventText
              ]}>
                {dateUtils.formatDate(event.date, 'short')}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="pencil-outline"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Event Time */}
      <View style={styles.timeContainer}>
        <Ionicons
          name="time-outline"
          size={14}
          color={isPast ? colors.textDisabled : colors.textSecondary}
        />
        <Text style={[
          styles.timeText,
          isPast && styles.pastEventText
        ]}>
          {dateUtils.formatTime(event.time)}
        </Text>
        
        {/* Status Indicator */}
        {isToday && !isPast && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>TODAY</Text>
          </View>
        )}
        {isUpcoming && !isToday && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
          </View>
        )}
        {isPast && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>COMPLETED</Text>
          </View>
        )}
      </View>

      {/* Event Description */}
      {event.description && (
        <Text style={[
          styles.description,
          isPast && styles.pastEventText
        ]} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      {/* Event Footer */}
      <View style={styles.footer}>
        {/* Category Badge */}
        <View style={[
          styles.categoryBadge,
          { backgroundColor: eventColor }
        ]}>
          <Text style={styles.categoryText}>
            {formatUtils.capitalize(event.category)}
          </Text>
        </View>

        {/* Priority Indicator */}
        {event.priority && (
          <View style={styles.priorityContainer}>
            <Ionicons
              name={getPriorityIcon(event.priority)}
              size={12}
              color={priorityColor}
            />
            <Text style={[
              styles.priorityText,
              { color: priorityColor }
            ]}>
              {formatUtils.capitalize(event.priority)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar for Past Events */}
      {isPast && (
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { backgroundColor: eventColor }
          ]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginVertical: spacing[1],
    marginHorizontal: spacing[2],
    borderLeftWidth: 4,
    ...globalStyles.shadowSmall,
  },

  pastEvent: {
    opacity: 0.7,
    backgroundColor: colors.surface,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },

  titleSection: {
    flex: 1,
  },

  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[1] / 2,
  },

  dateText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  pastEventText: {
    color: colors.textDisabled,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: spacing[1],
  },

  actionButton: {
    padding: spacing[1],
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[1],
  },

  timeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  todayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1] / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },

  todayBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },

  upcomingBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1] / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },

  upcomingBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },

  pastBadge: {
    backgroundColor: colors.gray,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1] / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },

  pastBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: 20,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1] / 2,
    borderRadius: borderRadius.sm,
  },

  categoryText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1] / 2,
  },

  priorityText: {
    ...typography.captionSmall,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  progressBar: {
    height: 2,
    backgroundColor: colors.borderLight,
    marginTop: spacing[2],
    borderRadius: 1,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    width: '100%',
    opacity: 0.5,
  },
});

export default EventCard;