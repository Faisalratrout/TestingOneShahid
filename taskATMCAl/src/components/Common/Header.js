import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const Header = ({
  title,
  subtitle,
  onBackPress,
  onMenuPress,
  rightIcon,
  onRightIconPress,
  backgroundColor = colors.white,
  titleColor = colors.textPrimary,
  showBackButton = false,
  showMenuButton = false,
  elevation = true,
  style,
}) => {
  return (
    <>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle={backgroundColor === colors.white ? 'dark-content' : 'light-content'}
      />
      <View style={[
        styles.container,
        { backgroundColor },
        elevation && styles.elevation,
        style
      ]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={titleColor}
              />
            </TouchableOpacity>
          )}
          
          {showMenuButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onMenuPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={titleColor}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: titleColor }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightIconPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={rightIcon}
                size={24}
                color={titleColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 60,
    paddingTop: Platform.OS === 'ios' ? spacing[3] + 20 : spacing[3], // Account for status bar
  },

  elevation: {
    ...globalStyles.shadow,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },

  centerSection: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },

  iconButton: {
    padding: spacing[1],
    borderRadius: borderRadius.sm,
  },

  title: {
    ...typography.h5,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    ...typography.captionSmall,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing[1] / 2,
  },
});

export default Header;