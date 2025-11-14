import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Edit3,
  Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardCard from '../components/DashboardCard'
import RecentActivities from '../components/RecentActivities'
import StockChart from '../components/StockChart'
import SalesChart from '../components/SalesChart'
import StockModal from '../components/StockModal'
import CustomerModal from '../components/CustomerModal'
import ProductsModal from '../components/ProductsModal'
import SalesModal from '../components/SalesModal'
import BillsModal from '../components/BillsModal'
import LowStockModal from '../components/LowStockModal'
import ResetPriceModal from '../components/ResetPriceModal'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Helper function to check if user can perform admin actions
  const canPerformAdminActions = () => {
    return user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'Manager'
  }
  
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // Default to 7 days
  
  // Modal states
  const [showStockModal, setShowStockModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [showSalesModal, setShowSalesModal] = useState(false)
  const [showBillsModal, setShowBillsModal] = useState(false)
  const [showLowStockModal, setShowLowStockModal] = useState(false)
  const [showResetPriceModal, setShowResetPriceModal] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [stockItems, setStockItems] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchSuppliers()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Dashboard: Fetching data for date range:', dateRange, 'days')
      const response = await api.get(`/api/dashboard/stats?days=${dateRange}`)
      console.log('Dashboard: Received response:', response.data)
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/api/suppliers')
      setSuppliers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to load suppliers')
    }
  }

  // Quick action handlers
  const handleAddStock = () => {
    setShowStockModal(true)
  }

  const handleAddCustomer = () => {
    setShowCustomerModal(true)
  }

  const handleCreateBill = () => {
    console.log('Create New Bill button clicked - attempting to navigate to /bills/create')
    try {
      // Navigate to bills page to create new bill
      navigate('/bills/create')
      console.log('Navigation to /bills/create completed')
    } catch (error) {
      console.error('Error navigating to bills/create:', error)
      toast.error('Failed to open bill creation page')
    }
  }

  const handleRestockItems = () => {
    console.log('Manage Stock button clicked - navigating to stock page with low stock filter')
    try {
      // Navigate to stock page with a query parameter to show low stock items
      navigate('/stock?filter=lowstock')
      console.log('Navigation to /stock?filter=lowstock completed')
    } catch (error) {
      console.error('Error navigating to stock page:', error)
      toast.error('Failed to open restock page')
    }
  }

  const handleResetPrice = async () => {
    console.log('Reset Price button clicked')
    try {
      // Fetch stock items for the modal
      const response = await api.get('/api/stock')
      const stockData = response.data?.data || response.data
      setStockItems(Array.isArray(stockData) ? stockData : [])
      setShowResetPriceModal(true)
    } catch (error) {
      console.error('Error fetching stock items:', error)
      toast.error('Failed to load stock items')
    }
  }

  // Delete handlers
  const handleDeleteProduct = async () => {
    if (window.confirm('Are you sure you want to delete a product? This action cannot be undone.')) {
      try {
        // Navigate to stock page for product selection and deletion
        navigate('/stock')
        toast.success('Navigated to Stock page for product deletion')
      } catch (error) {
        console.error('Error navigating to stock page:', error)
        toast.error('Failed to navigate to stock page')
      }
    }
  }

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete a customer? This action cannot be undone.')) {
      try {
        // Navigate to customers page for customer selection and deletion
        navigate('/customers')
        toast.success('Navigated to Customers page for customer deletion')
      } catch (error) {
        console.error('Error navigating to customers page:', error)
        toast.error('Failed to navigate to customers page')
      }
    }
  }

  const handleDeleteBill = async () => {
    if (window.confirm('Are you sure you want to delete a bill? This action cannot be undone.')) {
      try {
        // Navigate to bills page for bill selection and deletion
        navigate('/bills')
        toast.success('Navigated to Bills page for bill deletion')
      } catch (error) {
        console.error('Error navigating to bills page:', error)
        toast.error('Failed to navigate to bills page')
      }
    }
  }

  const handleSaveStock = async (stockData) => {
    console.log('Dashboard handleSaveStock called with:', stockData)
    try {
      console.log('Making API call to /api/stock...')
      const response = await api.post('/api/stock', stockData)
      console.log('API response received:', response.data)
      
      if (response.data.success) {
        console.log('Stock added successfully, closing modal and refreshing data')
        setShowStockModal(false)
        fetchDashboardData() // Refresh dashboard data
        toast.success('Stock item added successfully!')
      } else {
        console.log('API returned success=false:', response.data.message)
        toast.error(response.data.message || 'Failed to add stock item')
      }
    } catch (error) {
      console.error('Error adding stock:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      const errorMessage = error.response?.data?.message || 'Failed to add stock item'
      toast.error(errorMessage)
    }
  }

  const handleStockAdded = () => {
    setShowStockModal(false)
    fetchDashboardData() // Refresh dashboard data
    toast.success('Stock item added successfully!')
  }

  const handleSaveCustomer = async (customerData) => {
    console.log('Dashboard handleSaveCustomer called with:', customerData)
    try {
      console.log('Making API call to /api/customers...')
      const response = await api.post('/api/customers', customerData)
      console.log('API response received:', response.data)
      
      if (response.data.success) {
        console.log('Customer added successfully, closing modal')
        setShowCustomerModal(false)
        toast.success('Customer added successfully!')
      } else {
        console.log('API returned success=false:', response.data.message)
        toast.error(response.data.message || 'Failed to add customer')
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      const errorMessage = error.response?.data?.message || 'Failed to add customer'
      toast.error(errorMessage)
    }
  }

  const handleCustomerAdded = () => {
    setShowCustomerModal(false)
    toast.success('Customer added successfully!')
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const recentActivities = dashboardData?.recentActivities || []
  const chartData = dashboardData?.chartData || {}
  
  // Provide safe defaults for chart data
  const safeStockData = chartData.stockData || []
  const safeSalesData = chartData.salesData || []
  
  // Debug logging for dashboard data
  console.log('Dashboard - Date Range:', dateRange)
  console.log('Dashboard - Chart Data:', chartData)
  console.log('Dashboard - Sales Data:', safeSalesData)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => {
              console.log('Dashboard: Date range changed from', dateRange, 'to', e.target.value)
              setDateRange(e.target.value)
            }}
            className="form-input py-2 text-sm"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={Package}
          color="blue"
          onClick={() => setShowProductsModal(true)}
        />
        
        <DashboardCard
          title="Total Sales"
          value={`₹${(stats.totalSales || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          onClick={() => setShowSalesModal(true)}
        />
        
        <DashboardCard
          title="Total Bills"
          value={stats.totalBills || 0}
          icon={ShoppingCart}
          color="purple"
          onClick={() => setShowBillsModal(true)}
        />
        
        <DashboardCard
          title="Low Stock Items"
          value={stats.lowStockItems || 0}
          icon={AlertTriangle}
          color="red"
          onClick={() => setShowLowStockModal(true)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <SalesChart data={safeSalesData} dateRange={dateRange} />
        </div>

        {/* Stock Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <StockChart data={safeStockData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities activities={recentActivities} />
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleAddStock}
                className="w-full btn-primary text-left flex items-center justify-start hover:bg-blue-600 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </button>
              <button 
                onClick={handleCreateBill}
                className="w-full btn-secondary text-left flex items-center justify-start hover:bg-gray-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create New Bill
              </button>
              <button 
                onClick={handleAddCustomer}
                className="w-full btn-secondary text-left flex items-center justify-start hover:bg-gray-600 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </button>
              <button 
                onClick={handleRestockItems}
                className="w-full btn-secondary text-left flex items-center justify-start hover:bg-orange-600 transition-colors bg-orange-500 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Manage Stock
              </button>
              <button 
                onClick={handleResetPrice}
                className="w-full btn-secondary text-left flex items-center justify-start hover:bg-purple-600 transition-colors bg-purple-500 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Reset Price
              </button>
              
              {/* Delete Actions - Hidden for Cashiers */}
              {canPerformAdminActions() && (
                <div className="border-t pt-3 mt-3">
                  <button 
                    onClick={handleDeleteProduct}
                    className="w-full btn-secondary text-left flex items-center justify-start hover:bg-red-600 transition-colors bg-red-500 text-white mb-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </button>
                  <button 
                    onClick={handleDeleteCustomer}
                    className="w-full btn-secondary text-left flex items-center justify-start hover:bg-red-600 transition-colors bg-red-500 text-white mb-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Customer
                  </button>
                  <button 
                    onClick={handleDeleteBill}
                    className="w-full btn-secondary text-left flex items-center justify-start hover:bg-red-600 transition-colors bg-red-500 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Bill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {stats.lowStockItems > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800">
                  Low Stock Alert
                </h4>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {stats.lowStockItems} items are running low on stock. 
                Please restock soon.
              </p>
            </div>
          )}

          {/* System Status */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-medium text-green-800">
                System Status
              </h4>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All systems are running normally
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStockModal && (
        <StockModal
          stock={null}
          suppliers={suppliers}
          onSave={handleSaveStock}
          onClose={() => setShowStockModal(false)}
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          onSave={handleSaveCustomer}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {/* Dashboard Card Modals */}
      <ProductsModal 
        isOpen={showProductsModal} 
        onClose={() => setShowProductsModal(false)} 
      />
      
      <SalesModal 
        isOpen={showSalesModal} 
        onClose={() => setShowSalesModal(false)} 
      />
      
      <BillsModal 
        isOpen={showBillsModal} 
        onClose={() => setShowBillsModal(false)} 
      />
      
      <LowStockModal 
        isOpen={showLowStockModal} 
        onClose={() => setShowLowStockModal(false)} 
      />

      <ResetPriceModal
        isOpen={showResetPriceModal}
        onClose={() => setShowResetPriceModal(false)}
        stockItems={stockItems}
        onUpdate={(updatedItem) => {
          // Update the stock items list
          setStockItems(stockItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          ))
          // Refresh dashboard data to reflect changes
          fetchDashboardData()
        }}
      />
    </div>
  )
}

export default Dashboard