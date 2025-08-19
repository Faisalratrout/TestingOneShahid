import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Header from '../components/Common/Header';
import FormButton from '../components/Forms/FormButton';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const AccountManagementScreen = ({ navigation }) => {
  const {
    accounts,
    selectedAccount,
    selectAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    setAccountAsPrimary,
    getAccountBalance,
    loading,
    syncData,
  } = useData();

  const { user } = useAuth();
  const { sendSecurityAlert } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState(null);

  useEffect(() => {
    // Auto-select first account if none selected
    if (accounts.length > 0 && !selectedAccount) {
      selectAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh account data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectAccount = (account) => {
    selectAccount(account);
    Alert.alert(
      'Account Selected',
      `${account.type.toUpperCase()} account ending in ${account.accountNumber.slice(-4)} is now your active account.`
    );
  };

  const handleSetPrimary = async (account) => {
    try {
      const result = await setAccountAsPrimary(account.id);
      if (result.success) {
        Alert.alert('Success', 'Primary account updated successfully');
        sendSecurityAlert({
          title: 'Primary Account Changed',
          message: `Your primary account has been changed to ${account.type.toUpperCase()} ${account.accountNumber}`,
          type: 'account_change',
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to set primary account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set primary account');
    }
  };

  const handleDeleteAccount = (account) => {
    if (account.isPrimary) {
      Alert.alert(
        'Cannot Delete Primary Account',
        'Please set another account as primary before deleting this account.'
      );
      return;
    }

    if (accounts.length <= 1) {
      Alert.alert(
        'Cannot Delete Last Account',
        'You must have at least one account to use the ATM services.'
      );
      return;
    }

    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const result = await deleteAccount(accountToDelete.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        Alert.alert('Success', 'Account deleted successfully');
        
        // Send security alert
        sendSecurityAlert({
          title: 'Account Deleted',
          message: `${accountToDelete.type.toUpperCase()} account ${accountToDelete.accountNumber} has been deleted`,
          type: 'account_deletion',
        });

        // If deleted account was selected, select another one
        if (selectedAccount?.id === accountToDelete.id) {
          const remainingAccounts = accounts.filter(acc => acc.id !== accountToDelete.id);
          if (remainingAccounts.length > 0) {
            selectAccount(remainingAccounts[0]);
          }
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccountDetails(account);
    setShowAccountDetails(true);
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      checking: 'card-outline',
      savings: 'wallet-outline',
      credit: 'card',
      business: 'briefcase-outline',
    };
    return icons[type.toLowerCase()] || 'card-outline';
  };

  const getAccountStatusColor = (account) => {
    if (!account.isActive) return colors.error;
    if (account.isPrimary) return colors.success;
    return colors.info;
  };

  const getAccountStatusText = (account) => {
    if (!account.isActive) return 'Inactive';
    if (account.isPrimary) return 'Primary';
    return 'Active';
  };

  const formatAccountNumber = (accountNumber) => {
    // Format as ****1234 for security
    return `****${accountNumber.slice(-4)}`;
  };

  const renderAccountItem = ({ item: account }) => (
    <TouchableOpacity
      style={[
        styles.accountCard,
        selectedAccount?.id === account.id && styles.selectedAccountCard,
        !account.isActive && styles.inactiveAccountCard,
      ]}
      onPress={() => handleSelectAccount(account)}
      onLongPress={() => handleViewAccountDetails(account)}
      activeOpacity={0.8}
    >
      <View style={styles.accountHeader}>
        <View style={styles.accountIconContainer}>
          <Ionicons
            name={getAccountTypeIcon(account.type)}
            size={32}
            color={account.isActive ? colors.primary : colors.textSecondary}
          />
        </View>
        
        <View style={styles.accountInfo}>
          <View style={styles.accountTitleRow}>
            <Text style={styles.accountType}>
              {account.type.toUpperCase()} ACCOUNT
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getAccountStatusColor(account) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getAccountStatusColor(account) }
              ]}>
                {getAccountStatusText(account)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.accountNumber}>
            {formatAccountNumber(account.accountNumber)}
          </Text>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={[
              styles.balanceAmount,
              !account.isActive && styles.inactiveBalance
            ]}>
              {account.currency} {account.balance.toFixed(2)}
            </Text>
          </View>

          {account.lastTransaction && (
            <Text style={styles.lastTransaction}>
              Last transaction: {new Date(account.lastTransaction).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.accountActions}>
        {account.isActive && (
          <>
            {!account.isPrimary && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleSetPrimary(account);
                }}
              >
                <Ionicons name="star-outline" size={16} color={colors.warning} />
                <Text style={styles.actionButtonText}>Set Primary</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleViewAccountDetails(account);
              }}
            >
              <Ionicons name="eye-outline" size={16} color={colors.info} />
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteAccount(account);
              }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAccountSummary = () => {
    const activeAccounts = accounts.filter(acc => acc.isActive);
    const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const primaryAccount = accounts.find(acc => acc.isPrimary);

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Account Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Accounts</Text>
            <Text style={styles.summaryValue}>{activeAccounts.length}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Balance</Text>
            <Text style={styles.summaryValue}>
              {primaryAccount?.currency || 'USD'} {totalBalance.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Primary Account</Text>
            <Text style={styles.summaryValue}>
              {primaryAccount ? formatAccountNumber(primaryAccount.accountNumber) : 'None'}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected Account</Text>
            <Text style={styles.summaryValue}>
              {selectedAccount ? formatAccountNumber(selectedAccount.accountNumber) : 'None'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={colors.textDisabled} />
      <Text style={styles.emptyTitle}>No Accounts Found</Text>
      <Text style={styles.emptySubtitle}>
        Add your first account to start using ATM services
      </Text>
      <FormButton
        title="Add Account"
        variant="primary"
        leftIcon="add-outline"
        onPress={() => navigation.navigate('AddAccount')}
        style={styles.addAccountButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Account Management"
        subtitle={`Welcome, ${user?.name || 'User'}`}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightIconPress={() => navigation.navigate('AddAccount')}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Account Summary */}
        {accounts.length > 0 && renderAccountSummary()}

        {/* Account List */}
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Accounts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAccount')}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {accounts.length > 0 ? (
            <FlatList
              data={accounts}
              renderItem={renderAccountItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.accountsList}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Quick Actions */}
        {accounts.length > 0 && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ATMTab')}
              >
                <Ionicons name="card-outline" size={32} color={colors.primary} />
                <Text style={styles.quickActionTitle}>ATM Services</Text>
                <Text style={styles.quickActionSubtitle}>Withdraw, deposit, transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('HistoryTab')}
              >
                <Ionicons name="time-outline" size={32} color={colors.secondary} />
                <Text style={styles.quickActionTitle}>Transaction History</Text>
                <Text style={styles.quickActionSubtitle}>View past transactions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Account Details Modal */}
      <ConfirmDialog
        visible={showAccountDetails}
        title="Account Details"
        message={
          selectedAccountDetails && (
            <View style={styles.accountDetailsContent}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Type: </Text>
                {selectedAccountDetails.type.toUpperCase()}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Number: </Text>
                {selectedAccountDetails.accountNumber}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance: </Text>
                {selectedAccountDetails.currency} {selectedAccountDetails.balance.toFixed(2)}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status: </Text>
                {getAccountStatusText(selectedAccountDetails)}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created: </Text>
                {new Date(selectedAccountDetails.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          )
        }
        confirmText="Close"
        onConfirm={() => setShowAccountDetails(false)}
        hideCancel
        variant="info"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Account"
        message={`Are you sure you want to delete the ${accountToDelete?.type.toUpperCase()} account ${accountToDelete?.accountNumber}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Loading Overlay */}
      <LoadingSpinner
        visible={loading}
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

  summaryCard: {
    backgroundColor: colors.surface,
    margin: spacing[4],
    marginBottom: spacing[2],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...globalStyles.shadow,
  },

  summaryTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing[3],
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  summaryItem: {
    width: '48%',
    marginBottom: spacing[3],
  },

  summaryLabel: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  accountsSection: {
    margin: spacing[4],
    marginTop: spacing[2],
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  sectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  addButton: {
    padding: spacing[1],
  },

  accountsList: {
    paddingBottom: spacing[2],
  },

  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: 'transparent',
    ...globalStyles.shadow,
  },

  selectedAccountCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  inactiveAccountCard: {
    opacity: 0.6,
  },

  accountHeader: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },

  accountIconContainer: {
    marginRight: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountInfo: {
    flex: 1,
  },

  accountTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  accountType: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },

  statusText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },

  accountNumber: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    fontFamily: 'monospace',
  },

  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },

  balanceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  balanceAmount: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },

  inactiveBalance: {
    color: colors.textSecondary,
  },

  lastTransaction: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },

  accountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  actionButtonText: {
    ...typography.captionSmall,
    color: colors.textPrimary,
    marginLeft: spacing[1],
    fontWeight: '600',
  },

  deleteButton: {
    borderColor: colors.error + '30',
    backgroundColor: colors.error + '10',
  },

  deleteButtonText: {
    color: colors.error,
  },

  quickActionsSection: {
    margin: spacing[4],
    marginTop: 0,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },

  quickActionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    alignItems: 'center',
    ...globalStyles.shadow,
  },

  quickActionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing[2],
  },

  quickActionSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing[1],
  },

  emptyContainer: {
    alignItems: 'center',
    padding: spacing[8],
  },

  emptyTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },

  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },

  addAccountButton: {
    paddingHorizontal: spacing[8],
  },

  accountDetailsContent: {
    alignItems: 'flex-start',
  },

  detailRow: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  detailLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default AccountManagementScreen;