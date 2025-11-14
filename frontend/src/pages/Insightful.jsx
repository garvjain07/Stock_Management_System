import React, { useState, useEffect } from 'react'
import { 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  AlertTriangle,
  Package2,
  Timer,
  Zap,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

const Insightful = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [alerts, setAlerts] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(15) // seconds - faster for real-time
  const [connectionStatus, setConnectionStatus] = useState('connecting') // connecting, connected, disconnected
  const [retryCount, setRetryCount] = useState(0)

  // Mock data for demonstration when API is not available
  const mockDashboardData = {
    overview: {
      totalProducts: 25,
      lowStockCount: 3,
      outOfStockCount: 1,
      totalStockValue: 125000,
      todaysRevenue: 15000,
      todaysTransactions: 8,
      thisWeekRevenue: 75000,
      thisMonthRevenue: 350000
    },
    performance: {
      averageOrderValue: 1875,
      transactionGrowth: 12.5,
      revenueGrowth: 8.3
    },
    dailySales: [
      { date: '2025-09-30', day: 'Mon', sales: 12000, transactions: 5 },
      { date: '2025-10-01', day: 'Tue', sales: 15000, transactions: 6 },
      { date: '2025-10-02', day: 'Wed', sales: 8000, transactions: 3 },
      { date: '2025-10-03', day: 'Thu', sales: 18000, transactions: 7 },
      { date: '2025-10-04', day: 'Fri', sales: 22000, transactions: 9 },
      { date: '2025-10-05', day: 'Sat', sales: 16000, transactions: 6 },
      { date: '2025-10-06', day: 'Sun', sales: 14000, transactions: 5 }
    ],
    topProducts: [
      { name: 'Samsung Galaxy A54', quantitySold: 12, revenue: 300000 },
      { name: 'iPhone 15', quantitySold: 8, revenue: 640000 },
      { name: 'MacBook Air', quantitySold: 3, revenue: 270000 }
    ]
  }

  const mockActivities = [
    {
      id: 'activity-1',
      type: 'sale',
      title: 'Sale - INV-001',
      description: 'Sale to John Doe - 3 items',
      amount: 2500,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'activity-2',
      type: 'alert',
      title: 'Low Stock Alert',
      description: 'Samsung Galaxy A54 is running low',
      amount: null,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'warning'
    },
    {
      id: 'activity-3',
      type: 'sale',
      title: 'Sale - INV-002',
      description: 'Sale to Jane Smith - 2 items',
      amount: 1800,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ]

  const mockAlerts = [
    {
      id: 'critical-1',
      type: 'critical',
      title: 'Product Out of Stock',
      message: 'iPhone 15 has no stock remaining',
      severity: 'high',
      timestamp: new Date().toISOString(),
      actionRequired: true,
      category: 'inventory'
    },
    {
      id: 'warning-1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Samsung Galaxy A54 is running low: 5 units remaining',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      actionRequired: false,
      category: 'inventory'
    }
  ]

  // Real-time data fetching with enhanced error handling
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/reports/dashboard')
      if (response.data?.success) {
        setDashboardData(response.data.data)
        setLastUpdated(new Date())
        setConnectionStatus('connected')
        setRetryCount(0)
        return true
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setConnectionStatus('disconnected')
      setRetryCount(prev => prev + 1)
      // Use mock data when API is not available
      setDashboardData(mockDashboardData)
      setLastUpdated(new Date())
      return false
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('/api/reports/recent-activities?limit=15')
      if (response.data?.success && response.data.data?.activities) {
        console.log('✅ Real-time activities loaded:', response.data.data.activities.length, 'activities')
        setRecentActivities(response.data.data.activities)
        return true
      } else {
        console.log('⚠️ API response success but no activities data')
        // Don't fall back to mock data - show empty state
        setRecentActivities([])
        return false
      }
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error)
      // Don't use mock data - show empty state or minimal real data
      setRecentActivities([])
      return false
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/reports/alerts')
      if (response.data?.success) {
        setAlerts(response.data.data.alerts)
        return true
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setAlerts(mockAlerts)
      return false
    }
  }

  const fetchAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setConnectionStatus('connecting')
      
      const results = await Promise.all([
        fetchDashboardData(),
        fetchRecentActivities(),
        fetchAlerts()
      ])
      
      const successCount = results.filter(Boolean).length
      
      if (successCount === 3) {
        setConnectionStatus('connected')
        if (!silent) toast.success('Real-time data loaded successfully!')
      } else if (successCount > 0) {
        setConnectionStatus('connected')
        if (!silent) toast('Partial data loaded - some endpoints unavailable', { icon: '⚠️' })
      } else {
        setConnectionStatus('disconnected')
        if (!silent) toast.error('Using demo data - backend not available')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setConnectionStatus('disconnected')
      if (!silent) toast.error('Connection failed - using demo data')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
    toast.success('Insights data refreshed!')
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAllData(true) // Silent refresh for auto-updates
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Connection retry effect for real-time reliability
  useEffect(() => {
    if (connectionStatus === 'disconnected' && retryCount < 5) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retrying connection... (attempt ${retryCount + 1})`)
        fetchAllData(true)
      }, Math.min(2000 * Math.pow(2, retryCount), 30000)) // Exponential backoff
      
      return () => clearTimeout(retryTimeout)
    }
  }, [connectionStatus, retryCount])

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'  
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Real-time Insights</h1>
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-600 mt-1 flex items-center">
            <Activity className={`h-4 w-4 mr-1 ${
              connectionStatus === 'connected' ? 'text-green-500' :
              connectionStatus === 'connecting' ? 'text-yellow-500' :
              'text-red-500'
            }`} />
            Live business intelligence and performance insights
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-600' :
              connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {connectionStatus === 'connected' ? '● LIVE' :
               connectionStatus === 'connecting' ? '● CONNECTING' :
               '● OFFLINE'}
            </span>
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {retryCount > 0 && ` (${retryCount} retries)`}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="form-input py-1 text-sm border-gray-300 rounded"
            disabled={!autoRefresh}
          >
            <option value={5}>5s (Fast)</option>
            <option value={15}>15s (Default)</option>
            <option value={30}>30s (Normal)</option>
            <option value={60}>60s (Slow)</option>
          </select>
          
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
              connectionStatus === 'connected' ? 'bg-green-100 hover:bg-green-200 text-green-700' :
              connectionStatus === 'connecting' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' :
              'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } ${autoRefresh && connectionStatus === 'connected' ? 'animate-pulse' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Overview Stats */}
      {dashboardData?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData.overview.todaysRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{dashboardData.overview.todaysTransactions} transactions</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalProducts}</p>
                <p className="text-xs text-gray-500">₹{dashboardData.overview.totalStockValue.toLocaleString()} value</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.overview.lowStockCount + dashboardData.overview.outOfStockCount}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.overview.outOfStockCount} out of stock
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <p className={`text-2xl font-bold ${dashboardData.performance?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.performance?.revenueGrowth >= 0 ? '+' : ''}{dashboardData.performance?.revenueGrowth?.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-gray-500">vs last period</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Chart */}
      {dashboardData?.dailySales && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div className="space-y-4">
            {dashboardData.dailySales.map((data, index) => {
              const maxSales = Math.max(...dashboardData.dailySales.map(d => d.sales));
              const widthPercentage = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-12">{data.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{data.sales.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500">
                      {data.transactions} orders
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {recentActivities.length} activities
              </span>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh of activities triggered')
                  fetchRecentActivities()
                }}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Refresh activities"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">
                        ₹{activity.amount.toLocaleString()}
                      </span>
                    )}
                    <div className={`inline-flex px-2 py-1 text-xs rounded-full ml-2 ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                      activity.status === 'urgent' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="p-3 border-l-4 border-gray-200 bg-gray-50 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getAlertColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Performance */}
      {dashboardData?.topProducts && dashboardData.topProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
            <Package2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.topProducts.map((product, index) => (
              <div key={product.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{product.revenue.toLocaleString()}
                  </span>
                </div>
                <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                <p className="text-xs text-gray-600">{product.quantitySold} units sold</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Status Footer */}
      <div className={`bg-gradient-to-r border rounded-lg p-6 transition-all duration-300 ${
        connectionStatus === 'connected' ? 'from-green-50 to-blue-50 border-green-200' :
        connectionStatus === 'connecting' ? 'from-yellow-50 to-orange-50 border-yellow-200' :
        'from-red-50 to-pink-50 border-red-200'
      }`}>
        <div className="flex items-start">
          <Activity className={`h-6 w-6 mt-1 ${
            connectionStatus === 'connected' ? 'text-green-600' :
            connectionStatus === 'connecting' ? 'text-yellow-600' :
            'text-red-600'
          }`} />
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              connectionStatus === 'connected' ? 'text-green-800' :
              connectionStatus === 'connecting' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              Real-time Insights Dashboard - {connectionStatus.toUpperCase()}
            </h3>
            <div className={`mt-2 text-sm ${
              connectionStatus === 'connected' ? 'text-green-700' :
              connectionStatus === 'connecting' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              <p>• Data updates automatically every {refreshInterval} seconds when auto-refresh is enabled</p>
              <p>• {connectionStatus === 'connected' ? 
                'All metrics reflect current business performance and stock levels' :
                connectionStatus === 'connecting' ?
                'Connecting to real-time data sources...' :
                'Using cached/demo data - connection will retry automatically'
              }</p>
              <p>• Alerts are generated in real-time based on your business rules</p>
              <p>• Click refresh anytime to get the latest data instantly</p>
              {retryCount > 0 && (
                <p className="mt-1 font-medium">• Connection retries: {retryCount}/5</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Insightful