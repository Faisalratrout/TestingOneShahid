import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import Header from '../components/Common/Header';
import FormButton from '../components/Forms/FormButton';
import FormPicker from '../components/Forms/FormPicker';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const { atmSettings, updateATMSettings, calendarSettings, updateCalendarSettings } = useData();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Currency options
  const currencyOptions = [
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'British Pound (GBP)', value: 'GBP' },
    { label: 'Canadian Dollar (CAD)', value: 'CAD' },
  ];

  // Language options
  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
  ];

  // Theme options
  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System Default', value: 'system' },
  ];

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleATMSettingChange = async (key, value) => {
    try {
      const updatedSettings = { ...atmSettings, [key]: value };
      await updateATMSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update ATM settings');
    }
  };

  const handleCalendarSettingChange = async (key, value) => {
    try {
      const updatedSettings = { ...calendarSettings, [key]: value };
      await updateCalendarSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update calendar settings');
    }
  };

  const handleNotificationSettingChange = async (key, value) => {
    try {
      const updatedSettings = { [key]: value };
      await updateNotificationSettings(updatedSettings);
      
      if (key === 'pushEnabled' && value) {
        Alert.alert(
          'Notifications Enabled',
          'You will now receive push notifications for transactions and events.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const renderSettingsSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderSettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    showArrow = true,// by default, show arrow if onPress is provided
    rightComponent // custmized component to render on right side  of the item 
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        {icon && (
          <View style={styles.settingsItemIcon}>
            <Ionicons name={icon} size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
          {value && (
            <Text style={styles.settingsItemValue}>{value}</Text>
          )}
        </View>
      </View>
      
      {rightComponent || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const renderSwitchItem = ({ icon, title, subtitle, value, onValueChange }) => (
    renderSettingsItem({
      icon,
      title,
      subtitle,
      rightComponent: (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
          thumbColor={value ? colors.primary : colors.textSecondary}
        />
      ),
      showArrow: false,
    })
  );

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        subtitle="Manage your preferences"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        {renderSettingsSection('Profile', 
          <View>
            {renderSettingsItem({
              icon: 'person-outline',
              title: user?.name || 'User Name',
              subtitle: user?.email || 'user@example.com',//default email for user
              onPress: () => navigation.navigate('Profile'),
            })}
            {renderSettingsItem({
              icon: 'card-outline',
              title: 'Account Information',
              subtitle: 'Manage your accounts and details',
              onPress: () => navigation.navigate('AccountsTab'),
            })}
          </View>
        )}

        {/* ATM Settings */}
        {renderSettingsSection('ATM Preferences',
          <View>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Default Currency</Text>
              <FormPicker
                value={atmSettings.currency}
                onValueChange={(value) => handleATMSettingChange('currency', value)}
                options={currencyOptions}
                variant="outlined"
                containerStyle={styles.picker}
              />
            </View>

            {renderSwitchItem({
              icon: 'receipt-outline',
              title: 'Auto Print Receipt',
              subtitle: 'Automatically generate receipts',
              value: atmSettings.autoPrintReceipt,
              onValueChange: (value) => handleATMSettingChange('autoPrintReceipt', value),
            })}

            {renderSwitchItem({
              icon: 'flash-outline',
              title: 'Quick Amount Access',
              subtitle: 'Show quick amount buttons',
              value: atmSettings.showQuickAmounts,
              onValueChange: (value) => handleATMSettingChange('showQuickAmounts', value),
            })}

            {renderSettingsItem({
              icon: 'lock-closed-outline',
              title: 'Change PIN',
              subtitle: 'Update your ATM PIN',
              onPress: () => navigation.navigate('ChangePIN'),
            })}
          </View>
        )}

        {/* Calendar Settings */}
        {renderSettingsSection('Calendar Preferences',
          <View>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Week Starts On</Text>
              <FormPicker
                value={calendarSettings.weekStartsOn || 1}
                onValueChange={(value) => handleCalendarSettingChange('weekStartsOn', value)}
                options={[
                  { label: 'Sunday', value: 0 },
                  { label: 'Monday', value: 1 },
                ]}
                variant="outlined"
                containerStyle={styles.picker}
              />
            </View>

            {renderSwitchItem({
              icon: 'calendar-number-outline',
              title: 'Show Week Numbers',
              subtitle: 'Display week numbers in calendar',
              value: calendarSettings.showWeekNumbers || false,
              onValueChange: (value) => handleCalendarSettingChange('showWeekNumbers', value),
            })}

            {renderSwitchItem({
              icon: 'alarm-outline',
              title: 'Default Reminders',
              subtitle: 'Set reminders for new events',
              value: calendarSettings.defaultReminder || true,
              onValueChange: (value) => handleCalendarSettingChange('defaultReminder', value),
            })}
          </View>
        )}

        {/* Notification Settings */}
        {renderSettingsSection('Notifications',
          <View>
            {renderSwitchItem({
              icon: 'notifications-outline',
              title: 'Push Notifications',
              subtitle: 'Receive push notifications',
              value: notificationSettings.pushEnabled,
              onValueChange: (value) => handleNotificationSettingChange('pushEnabled', value),
            })}

            {renderSwitchItem({
              icon: 'volume-high-outline',
              title: 'Sound',
              subtitle: 'Play notification sounds',
              value: notificationSettings.soundEnabled,
              onValueChange: (value) => handleNotificationSettingChange('soundEnabled', value),
            })}

            {renderSwitchItem({
              icon: 'phone-portrait-outline',
              title: 'Vibration',
              subtitle: 'Vibrate for notifications',
              value: notificationSettings.vibrationEnabled,
              onValueChange: (value) => handleNotificationSettingChange('vibrationEnabled', value),
            })}

            {renderSwitchItem({
              icon: 'card-outline',
              title: 'Transaction Alerts',
              subtitle: 'Get notified of transactions',
              value: notificationSettings.transactionAlerts,
              onValueChange: (value) => handleNotificationSettingChange('transactionAlerts', value),
            })}

            {renderSwitchItem({
              icon: 'calendar-outline',
              title: 'Event Reminders',
              subtitle: 'Receive event reminders',
              value: notificationSettings.eventReminders,
              onValueChange: (value) => handleNotificationSettingChange('eventReminders', value),
            })}

            {renderSwitchItem({
              icon: 'shield-outline',
              title: 'Security Alerts',
              subtitle: 'Important security notifications',
              value: notificationSettings.securityAlerts,
              onValueChange: (value) => handleNotificationSettingChange('securityAlerts', value),
            })}
          </View>
        )}

        {/* App Settings */}
        {renderSettingsSection('App Preferences',
          <View>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Language</Text>
              <FormPicker
                value="en"
                onValueChange={(value) => Alert.alert('Coming Soon', 'Language settings will be available in a future update.')}
                options={languageOptions}
                variant="outlined"
                containerStyle={styles.picker}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Theme</Text>
              <FormPicker
                value="light"
                onValueChange={(value) => Alert.alert('Coming Soon', 'Theme settings will be available in a future update.')}
                options={themeOptions}
                variant="outlined"
                containerStyle={styles.picker}
              />
            </View>

            {renderSettingsItem({
              icon: 'download-outline',
              title: 'Data Export',
              subtitle: 'Export your data',
              onPress: () => Alert.alert('Coming Soon', 'Data export will be available soon!'),
            })}
          </View>
        )}

        {/* Support & Info */}
        {renderSettingsSection('Support & Information',
          <View>
            {renderSettingsItem({
              icon: 'help-circle-outline',
              title: 'Help & Support',
              subtitle: 'Get help and contact support',
              onPress: () => Alert.alert('Support', 'For support, please email: support@atmapp.com'),
            })}

            {renderSettingsItem({
              icon: 'document-text-outline',
              title: 'Privacy Policy',
              subtitle: 'Read our privacy policy',
              onPress: () => Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.'),
            })}

            {renderSettingsItem({
              icon: 'shield-checkmark-outline',
              title: 'Terms of Service',
              subtitle: 'View terms and conditions',
              onPress: () => Alert.alert('Terms of Service', 'Terms of service will be displayed here.'),
            })}

            {renderSettingsItem({
              icon: 'information-circle-outline',
              title: 'About',
              subtitle: 'App version 1.0.0',
              onPress: () => Alert.alert(
                'About ATM & Calendar App',
                'Version 1.0.0\nBuilt with React Native\n\nA comprehensive ATM and calendar management application.'
              ),
            })}
          </View>
        )}

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <FormButton
            title="Logout"
            variant="danger"
            leftIcon="log-out-outline"
            onPress={() => setShowLogoutConfirm(true)}
            loading={loading}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
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

  section: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },

  sectionContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    ...globalStyles.shadow,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingsItemIcon: {
    marginRight: spacing[3],
  },

  settingsItemContent: {
    flex: 1,
  },

  settingsItemTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[1],
  },

  settingsItemSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },

  settingsItemValue: {
    ...typography.captionSmall,
    color: colors.primary,
    marginTop: spacing[1],
  },

  pickerContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  pickerLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[2],
  },

  picker: {
    marginBottom: 0,
  },

  logoutSection: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },

  logoutButton: {
    marginTop: spacing[4],
  },
});

export default SettingsScreen;
