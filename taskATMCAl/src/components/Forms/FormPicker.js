import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const FormPicker = ({
  label,
  placeholder = 'Select an option',
  value,
  onValueChange,
  options = [], // Array of { label, value, icon?, disabled? }
  error,
  helperText,
  leftIcon,
  disabled = false,
  required = false,
  variant = 'default', // 'default', 'outlined', 'filled'
  size = 'medium', // 'small', 'medium', 'large'
  multiSelect = false,
  searchable = false,
  searchPlaceholder = 'Search options...',
  emptyText = 'No options available',
  modalTitle,
  showCheckmark = true,
  maxHeight = 300,
  style,
  containerStyle,
  testID,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = multiSelect 
    ? options.filter(option => value?.includes(option.value))
    : options.find(option => option.value === value);

  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const openPicker = () => {
    if (!disabled) {
      setIsVisible(true);
      setSearchQuery('');
    }
  };

  const closePicker = () => {
    setIsVisible(false);
    setSearchQuery('');
  };

  const handleOptionPress = (option) => {
    if (option.disabled) return;

    if (multiSelect) {
      const currentValues = value || [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      
      onValueChange && onValueChange(newValues);
    } else {
      onValueChange && onValueChange(option.value);
      closePicker();
    }
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    if (containerStyle) baseStyle.push(containerStyle);
    return baseStyle;
  };

  const getPickerContainerStyle = () => {
    const baseStyle = [styles.pickerContainer];

    // Variant styles
    switch (variant) {
      case 'outlined':
        baseStyle.push(styles.outlinedPicker);
        break;
      case 'filled':
        baseStyle.push(styles.filledPicker);
        break;
      default:
        baseStyle.push(styles.defaultPicker);
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallPicker);
        break;
      case 'medium':
        baseStyle.push(styles.mediumPicker);
        break;
      case 'large':
        baseStyle.push(styles.largePicker);
        break;
    }

    // State styles
    if (error) {
      baseStyle.push(styles.errorPicker);
    }

    if (disabled) {
      baseStyle.push(styles.disabledPicker);
    }

    return baseStyle;
  };

  const getDisplayText = () => {
    if (!selectedOption) return placeholder;

    if (multiSelect) {
      const selectedOptions = selectedOption;
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} items selected`;
    }

    return selectedOption.label;
  };

  const getDisplayTextStyle = () => {
    const baseStyle = [styles.displayText];
    
    if (!selectedOption || (multiSelect && (!value || value.length === 0))) {
      baseStyle.push(styles.placeholderText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  const renderSearchInput = () => {
    if (!searchable) return null;

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.inputPlaceholder}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderOption = ({ item: option }) => {
    const isSelected = multiSelect
      ? value?.includes(option.value)
      : value === option.value;

    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.selectedOptionItem,
          option.disabled && styles.disabledOptionItem,
        ]}
        onPress={() => handleOptionPress(option)}
        disabled={option.disabled}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          {/* Option Icon */}
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={20}
              color={option.disabled ? colors.textDisabled : colors.textSecondary}
              style={styles.optionIcon}
            />
          )}

          {/* Option Label */}
          <Text style={[
            styles.optionLabel,
            isSelected && styles.selectedOptionLabel,
            option.disabled && styles.disabledOptionLabel,
          ]}>
            {option.label}
          </Text>
        </View>

        {/* Selection Indicator */}
        {showCheckmark && isSelected && (
          <Ionicons
            name={multiSelect ? "checkbox-outline" : "checkmark"}
            size={20}
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderModalActions = () => {
    if (!multiSelect) return null;

    return (
      <View style={styles.modalAction}>
        <TouchableOpacity
          style={styles.modalActionButton}
          onPress={closePicker}
        >
          <Text style={styles.modalActionButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalActionButton, styles.modalActionButtonPrimary]}
          onPress={closePicker}
        >
          <Text style={[styles.modalActionButtonText, styles.modalActionButtonTextPrimary]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Picker Trigger */}
      <TouchableOpacity
        style={getPickerContainerStyle()}
        onPress={openPicker}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={disabled ? colors.textDisabled : colors.textSecondary}
            />
          </View>
        )}

        {/* Display Text */}
        <Text style={getDisplayTextStyle()} numberOfLines={1}>
          {getDisplayText()}
        </Text>

        {/* Dropdown Icon */}
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.textDisabled : colors.textSecondary}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={16}// set icon size / small
            color={colors.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

      {/* Modal */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalTitle || label || 'Select Option'}
              </Text>
              {!multiSelect && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closePicker}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Input */}
            {renderSearchInput()}

            {/* Options List */}
            <View style={[styles.optionsList, { maxHeight }]}>
              {filteredOptions.length > 0 ? (
                <FlatList
                  data={filteredOptions}
                  renderItem={renderOption}
                  keyExtractor={(item, index) => `${item.value}_${index}`}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              )}
            </View>

            {/* Modal Actions */}
            {renderModalActions()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    ...typography.inputLabel,
    color: colors.textPrimary,
    marginBottom: spacing[1],
    fontWeight: '500',
  },

  required: {
    color: colors.error,
  },

  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.input,
  },

  // Variant styles
  defaultPicker: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  outlinedPicker: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },

  filledPicker: {
    backgroundColor: colors.surface,
    borderWidth: 0,
  },

  // Size styles
  smallPicker: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    minHeight: 36,
  },

  mediumPicker: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    minHeight: 48,
  },

  largePicker: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 56,
  },

  // State styles
  errorPicker: {
    borderColor: colors.inputError,
    borderWidth: 2,
  },

  disabledPicker: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },

  // Display Text
  displayText: {
    flex: 1,
    ...typography.input,
    color: colors.textPrimary,
  },

  placeholderText: {
    color: colors.inputPlaceholder,
  },

  disabledText: {
    color: colors.textDisabled,
  },

  // Icons
  leftIconContainer: {
    marginRight: spacing[2],
  },

  dropdownIcon: {
    marginLeft: spacing[2],
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },

  errorIcon: {
    marginRight: spacing[1],
  },

  errorText: {
    ...typography.captionSmall,
    color: colors.error,
    flex: 1,
  },

  helperText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
    ...globalStyles.shadowLarge,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  modalTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  closeButton: {
    padding: spacing[1],
  },

  // Search
  searchContainer: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },

  searchIcon: {
    marginRight: spacing[2],
  },

  searchInput: {
    flex: 1,
    ...typography.input,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  clearSearchButton: {
    padding: spacing[1],
  },

  // Options
  optionsList: {
    flex: 1,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },

  selectedOptionItem: {
    backgroundColor: colors.primaryLight,
  },

  disabledOptionItem: {
    opacity: 0.5,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionIcon: {
    marginRight: spacing[3],
  },

  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  selectedOptionLabel: {
    color: colors.primary,
    fontWeight: '600',
  },

  disabledOptionLabel: {
    color: colors.textDisabled,
  },

  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing[3],
  },

  modalActionButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  modalActionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  modalActionButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  modalActionButtonTextPrimary: {
    color: colors.white,
  },
});

export default FormPicker;