import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEventColor, getPriorityColor } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { dateUtils } from '../../utils/dateUtils';
import { validationUtils } from '../../utils/validationUtils';
import { EVENT_CATEGORIES, EVENT_PRIORITIES } from '../../utils/constants';

const EventModal = ({
  visible,
  event = null,
  selectedDate,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'personal',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!event;

  useEffect(() => {
    if (visible) {
      if (event) {
        // Editing existing event
        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          time: event.time || '',
          category: event.category || 'personal',
          priority: event.priority || 'medium',
        });
      } else {
        // Creating new event
        setFormData({
          title: '',
          description: '',
          date: selectedDate || dateUtils.getCurrentDate(),
          time: dateUtils.getCurrentTime(),
          category: 'personal',
          priority: 'medium',
        });
      }
      setErrors({});
    }
  }, [visible, event, selectedDate]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    const titleValidation = validationUtils.validateEventTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.errors;
    }

    // Description validation
    const descValidation = validationUtils.validateEventDescription(formData.description);
    if (!descValidation.isValid) {
      newErrors.description = descValidation.errors;
    }

    // Date validation
    const dateValidation = validationUtils.validateDate(formData.date, true);
    if (!dateValidation.isValid) {
      newErrors.date = dateValidation.errors;
    }

    // Time validation
    const timeValidation = validationUtils.validateTime(formData.time);
    if (!timeValidation.isValid) {
      newErrors.time = timeValidation.errors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        ...formData,
        id: event?.id || Date.now().toString(),
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(eventData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDelete(event.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const renderFormField = (field, label, multiline = false, placeholder = '') => {
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[
            multiline ? styles.textArea : styles.textInput,
            errors[field] && styles.inputError
          ]}
          value={formData[field]}
          onChangeText={(text) => updateFormData(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          maxLength={field === 'title' ? 100 : 500}
        />
        {errors[field] && (
          <View style={styles.fieldErrorContainer}>
            {errors[field].map((error, index) => (
              <Text key={index} style={styles.fieldError}>
                • {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCategorySelector = () => {
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {Object.entries(EVENT_CATEGORIES).map(([key, value]) => {
            const isSelected = formData.category === value;
            const categoryColor = getEventColor(value);
            
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryItem,
                  isSelected && { 
                    backgroundColor: categoryColor,
                    borderColor: categoryColor 
                  }
                ]}
                onPress={() => updateFormData('category', value)}
              >
                <Ionicons
                  name={getCategoryIcon(value)}
                  size={20}
                  color={isSelected ? colors.white : categoryColor}
                />
                <Text style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected
                ]}>
                  {formatUtils.capitalize(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderPrioritySelector = () => {
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Priority</Text>
        <View style={styles.priorityContainer}>
          {Object.entries(EVENT_PRIORITIES).map(([key, value]) => {
            const isSelected = formData.priority === value;
            const priorityColor = getPriorityColor(value);
            
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.priorityItem,
                  isSelected && { 
                    backgroundColor: priorityColor,
                    borderColor: priorityColor 
                  }
                ]}
                onPress={() => updateFormData('priority', value)}
              >
                <Ionicons
                  name={getPriorityIcon(value)}
                  size={16}
                  color={isSelected ? colors.white : priorityColor}
                />
                <Text style={[
                  styles.priorityText,
                  isSelected && styles.priorityTextSelected
                ]}>
                  {formatUtils.capitalize(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onCancel}
          >
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Event' : 'New Event'}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              isLoading && styles.headerButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={[
              styles.headerButtonText,
              styles.headerButtonSave,
              isLoading && styles.headerButtonTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title */}
          {renderFormField('title', 'Event Title *', false, 'Enter event title')}

          {/* Description */}
          {renderFormField('description', 'Description', true, 'Add event description (optional)')}

          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <View style={[styles.formField, { flex: 1, marginRight: spacing[2] }]}>
              <Text style={styles.fieldLabel}>Date *</Text>
              <TouchableOpacity
                style={[styles.dateTimeInput, errors.date && styles.inputError]}
                onPress={() => {
                  // You would implement a date picker here
                  Alert.alert('Date Picker', 'Date picker would open here');
                }}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.dateTimeText}>
                  {formData.date ? dateUtils.formatDate(formData.date, 'short') : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {errors.date && (
                <View style={styles.fieldErrorContainer}>
                  {errors.date.map((error, index) => (
                    <Text key={index} style={styles.fieldError}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.formField, { flex: 1, marginLeft: spacing[2] }]}>
              <Text style={styles.fieldLabel}>Time *</Text>
              <TouchableOpacity
                style={[styles.dateTimeInput, errors.time && styles.inputError]}
                onPress={() => {
                  // You would implement a time picker here
                  Alert.alert('Time Picker', 'Time picker would open here');
                }}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.dateTimeText}>
                  {formData.time ? dateUtils.formatTime(formData.time) : 'Select Time'}
                </Text>
              </TouchableOpacity>
              {errors.time && (
                <View style={styles.fieldErrorContainer}>
                  {errors.time.map((error, index) => (
                    <Text key={index} style={styles.fieldError}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Category */}
          {renderCategorySelector()}

          {/* Priority */}
          {renderPrioritySelector()}

          {/* Delete Button (only for editing) */}
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Ionicons name="trash-outline" size={20} color={colors.white} />
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...globalStyles.shadow,
  },

  headerButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },

  headerButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },

  headerButtonSave: {
    fontWeight: 'bold',
  },

  headerButtonDisabled: {
    opacity: 0.5,
  },

  headerButtonTextDisabled: {
    color: colors.textDisabled,
  },

  headerTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    padding: spacing[4],
  },

  formField: {
    marginBottom: spacing[4],
  },

  fieldLabel: {
    ...typography.inputLabel,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },

  textInput: {
    ...globalStyles.input,
    ...typography.input,
  },

  textArea: {
    ...globalStyles.input,
    ...typography.input,
    height: 100,
    textAlignVertical: 'top',
  },

  inputError: {
    borderColor: colors.inputError,
  },

  fieldErrorContainer: {
    marginTop: spacing[1],
  },

  fieldError: {
    ...typography.inputError,
    color: colors.error,
  },

  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.input,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    minHeight: 44,
  },

  dateTimeText: {
    ...typography.input,
    color: colors.textPrimary,
  },

  categoryContainer: {
    paddingVertical: spacing[1],
    gap: spacing[2],
  },

  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing[1],
  },

  categoryText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  categoryTextSelected: {
    color: colors.white,
  },

  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing[1],
    flex: 1,
    minWidth: '45%',
    justifyContent: 'center',
  },

  priorityText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  priorityTextSelected: {
    color: colors.white,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    gap: spacing[2],
  },

  deleteButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default EventModal;