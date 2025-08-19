import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import Header from '../components/Common/Header';
import FormButton from '../components/Forms/FormButton';
import FormInput from '../components/Forms/FormInput';
import FormPicker from '../components/Forms/FormPicker';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const CalendarScreen = ({ navigation }) => {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedDate,
    selectedDate,
    getEventsByDate,
    calendarSettings,
    loading,
  } = useData();

  const { scheduleEventReminder } = useNotifications();

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);

  // Form state for adding/editing events
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'personal',
    priority: 'normal',
    reminder: true,
    reminderMinutes: 15,
  });

  const eventCategories = [
    { label: 'Personal', value: 'personal', icon: 'person-outline' },
    { label: 'Work', value: 'work', icon: 'briefcase-outline' },
    { label: 'Meeting', value: 'meeting', icon: 'people-outline' },
    { label: 'Appointment', value: 'appointment', icon: 'calendar-outline' },
    { label: 'Reminder', value: 'reminder', icon: 'alarm-outline' },
    { label: 'Other', value: 'other', icon: 'ellipsis-horizontal-outline' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  const reminderOptions = [
    { label: '5 minutes before', value: 5 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
  ];

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Set today as selected date if none selected
    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, []);

  const formatEventsForCalendar = () => {
    const markedDates = {};
    
    events.forEach(event => {
      if (!markedDates[event.date]) {
        markedDates[event.date] = {
          dots: [],
          selected: false,
          selectedColor: colors.primary,
        };
      }
      
      const categoryColor = getCategoryColor(event.category);
      markedDates[event.date].dots.push({
        color: categoryColor,
      });
    });

    // Mark selected date
    if (selectedDate) {
      if (!markedDates[selectedDate]) {
        markedDates[selectedDate] = { dots: [] };
      }
      markedDates[selectedDate].selected = true;
      markedDates[selectedDate].selectedColor = colors.primary;
    }

    return markedDates;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      personal: colors.primary,
      work: colors.secondary,
      meeting: colors.info,
      appointment: colors.warning,
      reminder: colors.success,
      other: colors.textSecondary,
    };
    return categoryColors[category] || colors.primary;
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: colors.success,
      normal: colors.info,
      high: colors.warning,
      urgent: colors.error,
    };
    return priorityColors[priority] || colors.info;
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddEvent = () => {
    setEventForm({
      title: '',
      description: '',
      date: selectedDate || today,
      time: '',
      category: 'personal',
      priority: 'normal',
      reminder: true,
      reminderMinutes: 15,
    });
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      category: event.category || 'personal',
      priority: event.priority || 'normal',
      reminder: event.reminder !== false,
      reminderMinutes: event.reminderMinutes || 15,
    });
    setSelectedEvent(event);
    setShowAddEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!eventForm.date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      setEventLoading(true);

      const eventData = {
        ...eventForm,
        id: selectedEvent?.id,
      };

      let result;
      if (selectedEvent) {
        // Update existing event
        result = await updateEvent(selectedEvent.id, eventData);
      } else {
        // Add new event
        result = await addEvent(eventData);
      }

      if (result.success) {
        // Schedule reminder if enabled
        if (eventForm.reminder && eventForm.time) {
          await scheduleEventReminder(result.event || eventData, eventForm.reminderMinutes);
        }

        setShowAddEventModal(false);
        Alert.alert(
          'Success',
          `Event ${selectedEvent ? 'updated' : 'added'} successfully!`
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save event. Please try again.');
    } finally {
      setEventLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setEventLoading(true);
      const result = await deleteEvent(selectedEvent.id);

      if (result.success) {
        setShowDeleteConfirm(false);
        setShowEventDetailsModal(false);
        Alert.alert('Success', 'Event deleted successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event. Please try again.');
    } finally {
      setEventLoading(false);
    }
  };

  const renderEventItem = ({ item: event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => {
        setSelectedEvent(event);
        setShowEventDetailsModal(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.eventHeader}>
        <View style={[
          styles.categoryIndicator,
          { backgroundColor: getCategoryColor(event.category) }
        ]} />
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.eventTime}>
            {event.time || 'All day'}
          </Text>
          {event.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
          )}
        </View>
        <View style={[
          styles.priorityIndicator,
          { backgroundColor: getPriorityColor(event.priority) }
        ]} />
      </View>
    </TouchableOpacity>
  );

  const renderAddEventModal = () => (
    <Modal
      visible={showAddEventModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <Header
          title={selectedEvent ? 'Edit Event' : 'Add Event'}
          showBackButton
          onBackPress={() => setShowAddEventModal(false)}
          rightIcon="checkmark-outline"
          onRightIconPress={handleSaveEvent}
        />

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Event Title"
            value={eventForm.title}
            onChangeText={(text) => setEventForm({ ...eventForm, title: text })}
            placeholder="Enter event title"
            required
          />

          <FormInput
            label="Description"
            value={eventForm.description}
            onChangeText={(text) => setEventForm({ ...eventForm, description: text })}
            placeholder="Enter event description (optional)"
            multiline
            numberOfLines={3}
          />

          <FormInput
            label="Date"
            value={eventForm.date}
            onChangeText={(text) => setEventForm({ ...eventForm, date: text })}
            placeholder="YYYY-MM-DD"
            required
          />

          <FormInput
            label="Time"
            value={eventForm.time}
            onChangeText={(text) => setEventForm({ ...eventForm, time: text })}
            placeholder="HH:MM (optional)"
          />

          <FormPicker
            label="Category"
            value={eventForm.category}
            onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
            options={eventCategories}
            placeholder="Select category"
          />

          <FormPicker
            label="Priority"
            value={eventForm.priority}
            onValueChange={(value) => setEventForm({ ...eventForm, priority: value })}
            options={priorityOptions}
            placeholder="Select priority"
          />

          <View style={styles.reminderSection}>
            <TouchableOpacity
              style={styles.reminderToggle}
              onPress={() => setEventForm({ ...eventForm, reminder: !eventForm.reminder })}
            >
              <Ionicons
                name={eventForm.reminder ? 'checkbox' : 'square-outline'}
                size={24}
                color={eventForm.reminder ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.reminderText}>Set Reminder</Text>
            </TouchableOpacity>

            {eventForm.reminder && (
              <FormPicker
                label="Remind me"
                value={eventForm.reminderMinutes}
                onValueChange={(value) => setEventForm({ ...eventForm, reminderMinutes: value })}
                options={reminderOptions}
                style={styles.reminderPicker}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <FormButton
            title="Cancel"
            variant="outline"
            onPress={() => setShowAddEventModal(false)}
            style={styles.cancelButton}
          />
          <FormButton
            title={selectedEvent ? 'Update' : 'Add Event'}
            onPress={handleSaveEvent}
            loading={eventLoading}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );

  const renderEventDetailsModal = () => (
    <Modal
      visible={showEventDetailsModal}
      animationType="slide"
      transparent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.eventDetailsContainer}>
          <View style={styles.eventDetailsHeader}>
            <Text style={styles.eventDetailsTitle}>Event Details</Text>
            <TouchableOpacity
              onPress={() => setShowEventDetailsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedEvent && (
            <View style={styles.eventDetailsContent}>
              <Text style={styles.detailTitle}>{selectedEvent.title}</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.detailText}>{selectedEvent.date}</Text>
              </View>

              {selectedEvent.time && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{selectedEvent.time}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {eventCategories.find(c => c.value === selectedEvent.category)?.label || 'Other'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
                <Text style={[
                  styles.detailText,
                  { color: getPriorityColor(selectedEvent.priority) }
                ]}>
                  {selectedEvent.priority?.toUpperCase() || 'NORMAL'} Priority
                </Text>
              </View>

              {selectedEvent.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Description:</Text>
                  <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.eventDetailsActions}>
            <FormButton
              title="Edit"
              variant="outline"
              onPress={() => {
                setShowEventDetailsModal(false);
                handleEditEvent(selectedEvent);
              }}
              style={styles.editButton}
            />
            <FormButton
              title="Delete"
              variant="danger"
              onPress={() => setShowDeleteConfirm(true)}
              style={styles.deleteButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const todaysEvents = getEventsByDate(selectedDate || today);

  return (
    <View style={styles.container}>
      <Header
        title="Calendar"
        subtitle="Manage your events and appointments"
        rightIcon="add"
        onRightIconPress={handleAddEvent}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate || today}
            onDayPress={handleDayPress}
            markingType="multi-dot"
            markedDates={formatEventsForCalendar()}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textDisabled,
              arrowColor: colors.primary,
              monthTextColor: colors.textPrimary,
              indicatorColor: colors.primary,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Events for Selected Date */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.eventsSectionTitle}>
              Events for {selectedDate || today}
            </Text>
            <TouchableOpacity onPress={handleAddEvent} style={styles.addEventButton}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {todaysEvents.length > 0 ? (
            <FlatList
              data={todaysEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.noEventsText}>No events for this date</Text>
              <FormButton
                title="Add Event"
                variant="outline"
                onPress={handleAddEvent}
                style={styles.noEventsButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Event Modal */}
      {renderAddEventModal()}

      {/* Event Details Modal */}
      {renderEventDetailsModal()}

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Loading */}
      <LoadingSpinner
        visible={eventLoading}
        message="Processing..."
        overlay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
  },

  calendarContainer: {
    backgroundColor: colors.surface,
    margin: spacing[4],
    borderRadius: borderRadius.lg,
    padding: spacing[2],
    ...globalStyles.shadow,
  },

  eventsSection: {
    margin: spacing[4],
    marginTop: 0,
  },

  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  eventsSectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  addEventButton: {
    padding: spacing[1],
  },

  eventItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...globalStyles.shadow,
  },

  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  categoryIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: spacing[3],
  },

  eventContent: {
    flex: 1,
  },

  eventTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[1],
  },

  eventTime: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  eventDescription: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },

  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing[2],
    marginTop: spacing[1],
  },

  noEventsContainer: {
    alignItems: 'center',
    padding: spacing[6],
  },

  noEventsText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },

  noEventsButton: {
    paddingHorizontal: spacing[6],
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalContent: {
    flex: 1,
    padding: spacing[4],
  },

  modalActions: {
    flexDirection: 'row',
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing[3],
  },

  cancelButton: {
    flex: 1,
  },

  saveButton: {
    flex: 1,
  },

  reminderSection: {
    marginTop: spacing[2],
  },

  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  reminderText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing[2],
  },

  reminderPicker: {
    marginTop: spacing[2],
  },

  // Event Details Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventDetailsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing[4],
    maxHeight: '80%',
    minWidth: '90%',
    ...globalStyles.shadow,
  },

  eventDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  eventDetailsTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  closeButton: {
    padding: spacing[1],
  },

  eventDetailsContent: {
    padding: spacing[4],
  },

  detailTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing[4],
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  detailText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing[3],
  },

  descriptionContainer: {
    marginTop: spacing[4],
  },

  descriptionLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[2],
  },

  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  eventDetailsActions: {
    flexDirection: 'row',
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing[3],
  },

  editButton: {
    flex: 1,
  },

  deleteButton: {
    flex: 1,
  },
});

export default CalendarScreen;