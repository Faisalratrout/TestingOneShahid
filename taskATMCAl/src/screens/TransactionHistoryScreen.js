import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import Header from '../components/Common/Header';
import FormButton from '../components/Forms/FormButton';
import FormInput from '../components/Forms/FormInput';
import FormPicker from '../components/Forms/FormPicker';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const TransactionHistoryScreen = ({ navigation }) => {
  const {
    transactions,
    selectedAccount,
    getTransactionsByAccount,
    accounts,
    selectAccount,
    loading,
    syncData,
  } = useData();

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { label: 'All Transactions', value: 'all' },
    { label: 'Withdrawals', value: 'withdrawal' },
    { label: 'Deposits', value: 'deposit' },
    { label: 'Transfers', value: 'transfer' },
  ];

  const periodOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last Year', value: '1year' },
  ];

  useEffect(() => {
    applyFilters();
  }, [transactions, selectedAccount, searchQuery, selectedFilter, selectedPeriod]);

  const applyFilters = () => {
    let filtered = selectedAccount 
      ? getTransactionsByAccount(selectedAccount.id)
      : transactions;

    // Apply transaction type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedFilter);
    }

    // Apply period filter
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const periodStart = new Date();

      switch (selectedPeriod) {
        case '7days':
          periodStart.setDate(now.getDate() - 7);
          break;
        case '30days':
          periodStart.setDate(now.getDate() - 30);
          break;
        case '3months':
          periodStart.setMonth(now.getMonth() - 3);
          break;
        case '1year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(transaction => 
        new Date(transaction.timestamp) >= periodStart
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query) ||
        transaction.type.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredTransactions(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      withdrawal: 'arrow-up-outline',
      deposit: 'arrow-down-outline',
      transfer: 'swap-horizontal-outline',
    };
    return icons[type] || 'receipt-outline';
  };

  const getTransactionColor = (type) => {
    const colors_map = {
      withdrawal: colors.error,
      deposit: colors.success,
      transfer: colors.info,
    };
    return colors_map[type] || colors.textSecondary;
  };

  const formatAmount = (amount, type) => {
    const prefix = type === 'withdrawal' ? '-' : '+';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderTransactionItem = ({ item: transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetails', { transaction })}
      activeOpacity={0.8}
    >
      <View style={[
        styles.transactionIcon,
        { backgroundColor: getTransactionColor(transaction.type) + '20' }
      ]}>
        <Ionicons
          name={getTransactionIcon(transaction.type)}
          size={24}
          color={getTransactionColor(transaction.type)}
        />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.timestamp)}
        </Text>
        <Text style={styles.transactionLocation}>
          {transaction.location || 'ATM Transaction'}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
        <Text style={styles.transactionStatus}>
          {transaction.status || 'Completed'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={colors.textDisabled} />
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedFilter !== 'all' || selectedPeriod !== 'all'
          ? 'Try adjusting your filters'
          : 'Your transaction history will appear here'}
      </Text>
      {(searchQuery || selectedFilter !== 'all' || selectedPeriod !== 'all') && (
        <FormButton
          title="Clear Filters"
          variant="outline"
          onPress={() => {
            setSearchQuery('');
            setSelectedFilter('all');
            setSelectedPeriod('all');
          }}
          style={styles.clearFiltersButton}
        />
      )}
    </View>
  );

  const renderSummaryCard = () => {
    const totalWithdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDeposits = filteredTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTransfers = filteredTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Transaction Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Withdrawals</Text>
            <Text style={[styles.summaryAmount, { color: colors.error }]}>
              -${totalWithdrawals.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Deposits</Text>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>
              +${totalDeposits.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transfers</Text>
            <Text style={[styles.summaryAmount, { color: colors.info }]}>
              ${totalTransfers.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryAmount}>
              {filteredTransactions.length} transactions
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <FormInput
          label="Search Transactions"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by description, amount, or type"
          leftIcon="search-outline"
          clearButtonMode="while-editing"
        />

        <FormPicker
          label="Transaction Type"
          value={selectedFilter}
          onValueChange={setSelectedFilter}
          options={filterOptions}
          placeholder="Select transaction type"
        />

        <FormPicker
          label="Time Period"
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          options={periodOptions}
          placeholder="Select time period"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Transaction History"
        subtitle={selectedAccount?.accountNumber || 'All Accounts'}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon={showFilters ? "close" : "funnel-outline"}
        onRightIconPress={() => setShowFilters(!showFilters)}
      />

      {/* Account Selector */}
      {accounts.length > 1 && (
        <View style={styles.accountSelector}>
          <Text style={styles.accountSelectorLabel}>Account:</Text>
          <FormPicker
            value={selectedAccount?.id || 'all'}
            onValueChange={(accountId) => {
              if (accountId === 'all') {
                selectAccount(null);
              } else {
                const account = accounts.find(acc => acc.id === accountId);
                selectAccount(account);
              }
            }}
            options={[
              { label: 'All Accounts', value: 'all' },
              ...accounts.map(acc => ({
                label: `${acc.type.toUpperCase()} ${acc.accountNumber}`,
                value: acc.id,
              })),
            ]}
            variant="outlined"
            containerStyle={styles.accountPicker}
          />
        </View>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Summary Card */}
      {filteredTransactions.length > 0 && renderSummaryCard()}

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredTransactions.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Export Button */}
      {filteredTransactions.length > 0 && (
        <View style={styles.exportContainer}>
          <FormButton
            title="Export Statement"
            variant="outline"
            leftIcon="download-outline"
            onPress={() => {
              Alert.alert(
                'Export Statement',
                'This feature will be available soon!',
                [{ text: 'OK' }]
              );
            }}
            style={styles.exportButton}
          />
        </View>
      )}

      <LoadingSpinner visible={loading} overlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  accountSelectorLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing[3],
    minWidth: 70,
  },

  accountPicker: {
    flex: 1,
    marginBottom: 0,
  },

  filtersContainer: {
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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

  summaryAmount: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  listContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },

  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  transactionItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    ...globalStyles.shadow,
  },

  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  transactionDetails: {
    flex: 1,
  },

  transactionDescription: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[1],
  },

  transactionDate: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  transactionLocation: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },

  transactionAmount: {
    alignItems: 'flex-end',
  },

  amountText: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },

  transactionStatus: {
    ...typography.captionSmall,
    color: colors.success,
    textTransform: 'uppercase',
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
  },

  clearFiltersButton: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[6],
  },

  exportContainer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },

  exportButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing[6],
  },
});

export default TransactionHistoryScreen;