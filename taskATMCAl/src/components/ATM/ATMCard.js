import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';

const ATMCard = ({ account, showBalance = true, onPress, style }) => {
  if (!account) {
    return null;
  }

  const getCardGradient = (type) => {
    switch (type) {
      case 'checking':
        return [colors.primary, colors.primaryDark];
      case 'savings':
        return [colors.success, colors.successDark];
      case 'credit':
        return [colors.warning, colors.warningDark];
      default:
        return [colors.gray, colors.darkGray];
    }
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'checking':
        return 'card-outline';
      case 'savings':
        return 'wallet-outline';
      case 'credit':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const CardContent = () => (
    <LinearGradient
      colors={getCardGradient(account.type)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>MBC Bank</Text>
          <Text style={styles.cardType}>
            {formatUtils.capitalize(account.type)} Card
          </Text>
        </View>
        <View style={styles.cardIcon}>
          <Ionicons
            name={getCardIcon(account.type)}
            size={32}
            color={colors.white}
          />
        </View>
      </View>

      {/* Chip and Contactless */}
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <View style={styles.chipInner} />
        </View>
        <Ionicons
          name="wifi"
          size={20}
          color={colors.white}
          style={styles.contactless}
        />
      </View>

      {/* Account Number */}
      <View style={styles.accountNumberContainer}>
        <Text style={styles.accountNumber}>
          {formatUtils.formatAccountNumber(account.accountNumber, false)}
        </Text>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.holderInfo}>
          <Text style={styles.holderLabel}>CARD HOLDER</Text>
          <Text style={styles.holderName}>
            {account.holderName.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.expiryInfo}>
          <Text style={styles.expiryLabel}>EXPIRES</Text>
          <Text style={styles.expiryDate}>
            {formatUtils.formatCardExpiry('12', '28')}
          </Text>
        </View>
      </View>

      {/* Balance Display */}
      {showBalance && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatUtils.formatCurrency(account.balance)}
          </Text>
        </View>
      )}

      {/* Status Indicator */}
      {account.status !== 'active' && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {formatUtils.capitalize(account.status)}
          </Text>
        </View>
      )}

      {/* Card Pattern Overlay */}
      <View style={styles.patternOverlay}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[styles.patternDot, { 
            left: `${20 + (i * 15)}%`,
            top: `${30 + (i % 2) * 20}%`
          }]} />
        ))}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginVertical: spacing[3],
    marginHorizontal: spacing[2],
    position: 'relative',
    overflow: 'hidden',
    ...globalStyles.shadowLarge,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },

  bankInfo: {
    flex: 1,
  },

  bankName: {
    ...typography.label,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  cardType: {
    ...typography.captionSmall,
    color: colors.white,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  cardIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing[2],
  },

  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },

  chip: {
    width: 32,
    height: 24,
    backgroundColor: colors.atmGold,
    borderRadius: 4,
    padding: 2,
  },

  chipInner: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 2,
    opacity: 0.8,
  },

  contactless: {
    opacity: 0.7,
    transform: [{ rotate: '90deg' }],
  },

  accountNumberContainer: {
    marginBottom: spacing[4],
  },

  accountNumber: {
    ...typography.atmAccountNumber,
    color: colors.white,
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  holderInfo: {
    flex: 1,
  },

  holderLabel: {
    ...typography.overline,
    color: colors.white,
    opacity: 0.7,
    fontSize: 8,
    letterSpacing: 1,
  },

  holderName: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  expiryInfo: {
    alignItems: 'flex-end',
  },

  expiryLabel: {
    ...typography.overline,
    color: colors.white,
    opacity: 0.7,
    fontSize: 8,
    letterSpacing: 1,
  },

  expiryDate: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  balanceContainer: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[4],
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },

  balanceLabel: {
    ...typography.captionSmall,
    color: colors.white,
    opacity: 0.8,
    fontSize: 10,
  },

  balanceAmount: {
    ...typography.atmBalance,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  statusBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[4],
    backgroundColor: colors.error,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },

  statusText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },

  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },

  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
});

export default ATMCard;