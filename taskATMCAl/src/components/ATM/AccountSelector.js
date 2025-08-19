import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';

const AccountSelector = ({ accounts, onSelect, selectedAccountId }) => {
  const renderAccountItem = ({ item }) => {
    const isSelected = selectedAccountId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.accountItem,
          isSelected && styles.accountItemSelected
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.accountIcon}>
          <Ionicons
            name={getAccountIcon(item.type)}
            size={24}
            color={isSelected ? colors.white : colors.primary}
          />
        </View>
        
        <View style={styles.accountDetails}>
          <View style={styles.accountHeader}>
            <Text style={[
              styles.accountName,
              isSelected && styles.accountNameSelected
            ]}>
              {item.holderName}
            </Text>
            <Text style={[
              styles.accountBalance,
              isSelected && styles.accountBalanceSelected
            ]}>
              {formatUtils.formatCurrency(item.balance)}
            </Text>
          </View>
          
          <View style={styles.accountMeta}>
            <Text style={[
              styles.accountNumber,
              isSelected && styles.accountNumberSelected
            ]}>
              {formatUtils.formatAccountNumber(item.accountNumber)}
            </Text>
            <Text style={[
              styles.accountType,
              isSelected && styles.accountTypeSelected
            ]}>
              {formatUtils.capitalize(item.type)}
            </Text>
          </View>
          
          {item.status !== 'active' && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {formatUtils.capitalize(item.status)}
              </Text>
            </View>
          )}
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getAccountIcon = (type) => {
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

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'checking':
        return colors.primary;
      case 'savings':
        return colors.success;
      case 'credit':
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="card-outline" size={60} color={colors.lightGray} />
        <Text style={styles.emptyTitle}>No Accounts Found</Text>
        <Text style={styles.emptySubtitle}>
          Please contact your bank to set up an account
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Account</Text>
      <Text style={styles.subtitle}>
        Choose the account you want to access
      </Text>
      
      <FlatList
        data={accounts.filter(account => account.status === 'active')}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {accounts.some(account => account.status !== 'active') && (
        <View style={styles.inactiveAccountsContainer}>
          <Text style={styles.inactiveAccountsTitle}>
            Inactive Accounts ({accounts.filter(acc => acc.status !== 'active').length})
          </Text>
          <FlatList
            data={accounts.filter(account => account.status !== 'active')}
            renderItem={renderAccountItem}
            keyExtractor={(item) => `inactive_${item.id}`}
            contentContainerStyle={styles.inactiveListContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
  },
  
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  
  listContainer: {
    paddingBottom: spacing[4],
  },
  
  accountItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...globalStyles.shadow,
  },
  
  accountItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  
  accountDetails: {
    flex: 1,
  },
  
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },
  
  accountName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  
  accountNameSelected: {
    color: colors.white,
  },
  
  accountBalance: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  
  accountBalanceSelected: {
    color: colors.white,
  },
  
  accountMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  accountNumber: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  
  accountNumberSelected: {
    color: colors.primaryLight,
  },
  
  accountType: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  
  accountTypeSelected: {
    color: colors.primaryLight,
  },
  
  statusContainer: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing[1],
  },
  
  statusText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  selectedIndicator: {
    marginLeft: spacing[2],
  },
  
  separator: {
    height: spacing[2],
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
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
  },
  
  inactiveAccountsContainer: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  inactiveAccountsTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  
  inactiveListContainer: {
    opacity: 0.6,
  },
});

export default AccountSelector;