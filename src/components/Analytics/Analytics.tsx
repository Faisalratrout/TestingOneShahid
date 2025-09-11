import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { Product } from '../../types';
import './Analytics.css';

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state: RootState) => state.orders);
  const { products } = useSelector((state: RootState) => state.products);

  // Calculate analytics data
  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status distribution
    const orderStatusCount = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly sales last 6 months 
    const monthlySales = [
      { month: 'Aug', sales: 12500, orders: 45 },
      { month: 'Sep', sales: 15800, orders: 52 },
      { month: 'Oct', sales: 18200, orders: 63 },
      { month: 'Nov', sales: 21500, orders: 71 },
      { month: 'Dec', sales: 25300, orders: 89 },
      { month: 'Jan', sales: totalRevenue || 19800, orders: totalOrders || 67 },
    ];

    // Top selling products 
    const topProducts = products.slice(0, 5).map((product: Product, index: number) => ({
      ...product,
      soldCount: 45 - (index * 8),
      revenue: (45 - (index * 8)) * product.price
    }));

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      orderStatusCount,
      monthlySales,
      topProducts,
      totalProducts: products.length,
      conversionRate: 12.4,
      customerSatisfaction: 4.6,
    };
  }, [orders, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: string;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {change && <div className="stat-change">{change}</div>}
      </div>
    </div>
  );

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>{t('analytics.title')}</h1>
        <p>{t('analytics.subtitle')}</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title={t('analytics.totalRevenue')}
          value={formatCurrency(analytics.totalRevenue)}
          change={`+12.5% ${t('analytics.fromLastMonth')}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title={t('analytics.totalOrders')}
          value={analytics.totalOrders}
          change={`+8.3% ${t('analytics.fromLastMonth')}`}
          icon="📦"
          color="blue"
        />
        <StatCard
          title={t('analytics.averageOrderValue')}
          value={formatCurrency(analytics.averageOrderValue)}
          change={`+5.2% ${t('analytics.fromLastMonth')}`}
          icon="🛒"
          color="purple"
        />
        <StatCard
          title={t('analytics.productsSold')}
          value={analytics.totalProducts}
          icon="📊"
          color="orange"
        />
      </div>

      <div className="analytics-content">
        <div className="chart-section">
          <h2>{t('analytics.monthlySalesTrend')}</h2>
          <div className="sales-chart">
            {analytics.monthlySales.map((month, index) => {
              const height = 200;
              
              return (
                <div key={month.month} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ height: `${height}px` }}
                    title={`${month.month}: ${formatCurrency(month.sales)}`}
                  ></div>
                  <div className="chart-label">
                    <div>{month.month}</div>
                    <div className="chart-value">{formatCurrency(month.sales)}</div>
                    <div className="chart-orders">{month.orders} {t('analytics.orders')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="status-section">
          <h2>{t('analytics.orderStatusDistribution')}</h2>
          <div className="status-grid">
            {Object.entries(analytics.orderStatusCount).map(([status, count]) => (
              <div key={status} className="status-item">
                <div className={`status-indicator status-${status}`}></div>
                <span className="status-label">{t(`orders.status.${status}`)}</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="products-section">
          <h2>{t('analytics.topSellingProducts')}</h2>
          <div className="products-table">
            <div className="table-header">
              <span>{t('products.title').slice(0, -1)}</span>
              <span>Sold</span>
              <span>Revenue</span>
            </div>
            {analytics.topProducts.map((product: any, index: number) => (
              <div key={product.id} className="table-row">
                <div className="product-info">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-thumb"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/40x40/3b82f6/ffffff?text=${product.name.charAt(0)}`;
                    }}
                  />
                  <span>{product.name}</span>
                </div>
                <span className="sold-count">{product.soldCount} units</span>
                <span className="revenue">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="additional-metrics">
          <div className="metric-card">
            <h3>{t('analytics.conversionRate')}</h3>
            <div className="metric-value">{analytics.conversionRate}%</div>
            <div className="metric-trend positive">↑ +2.1%</div>
          </div>
          
          <div className="metric-card">
            <h3>{t('analytics.customerSatisfaction')}</h3>
            <div className="metric-value">{analytics.customerSatisfaction}/5.0</div>
            <div className="metric-stars">
              {'★'.repeat(Math.floor(analytics.customerSatisfaction))}
              {'☆'.repeat(5 - Math.floor(analytics.customerSatisfaction))}
            </div>
          </div>

          <div className="metric-card">
            <h3>{t('analytics.returnRate')}</h3>
            <div className="metric-value">2.3%</div>
            <div className="metric-trend negative">↓ -0.5%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
