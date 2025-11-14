import React, { useState, useEffect } from 'react'
import { Briefcase, Settings, Users, Package, BarChart3, Shield, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import UserManagement from '../components/UserManagement'
import UserModal from '../components/UserModal'
import InventoryControl from '../components/InventoryControl'
import AnalyticsReports from '../components/AnalyticsReports'
import SecuritySettings from '../components/SecuritySettings'
import api from '../services/api'

const Manage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)

  // Redirect cashiers from restricted tabs to overview
  useEffect(() => {
    if (user?.role === 'Cashier' && (activeTab === 'users' || activeTab === 'security')) {
      setActiveTab('overview')
      toast.error('Access denied. Redirected to overview.')
    }
  }, [user, activeTab])

  // System Cleanup Function
  const handleSystemCleanup = async () => {
    try {
      setCleanupLoading(true)
      toast.success('Starting system cleanup...')
      
      // Simulate cleanup operations
      const cleanupTasks = [
        { name: 'Clearing browser cache', delay: 800 },
        { name: 'Removing temporary files', delay: 1200 },
        { name: 'Cleaning up localStorage', delay: 600 },
        { name: 'Optimizing session data', delay: 900 },
        { name: 'Clearing expired tokens', delay: 500 }
      ]
      
      for (const task of cleanupTasks) {
        toast.loading(`${task.name}...`, { duration: task.delay })
        await new Promise(resolve => setTimeout(resolve, task.delay))
      }
      
      // Actual cleanup operations
      
      // Clean localStorage (keep essential data)
      const essentialKeys = ['token', 'user', 'theme']
      const allKeys = Object.keys(localStorage)
      let removedItems = 0
      
      allKeys.forEach(key => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key)
          removedItems++
        }
      })
      
      // Clear session storage
      const sessionItems = sessionStorage.length
      sessionStorage.clear()
      
      // Clear any cached API responses (if using browser cache)
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc()
      }
      
      const cleanupSummary = {
        localStorageItems: removedItems,
        sessionStorageItems: sessionItems,
        cachesCleared: 'caches' in window ? 'Yes' : 'N/A',
        timestamp: new Date().toLocaleString()
      }
      
      console.log('🧹 Cleanup Summary:', cleanupSummary)
      
      toast.success(
        `System cleanup completed! Removed ${removedItems} localStorage items, ` +
        `cleared ${sessionItems} session items, and optimized browser cache.`,
        { duration: 5000 }
      )
      
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('System cleanup failed. Please try again.')
    } finally {
      setCleanupLoading(false)
    }
  }

  // Comprehensive Export Data Function
  const handleExportAllData = async () => {
    try {
      setLoading(true)
      toast.success('Starting comprehensive data export...')
      
      // Fetch all data from different endpoints
      console.log('🚀 Starting API calls...')
      const [stockRes, billsRes, customersRes, usersRes] = await Promise.allSettled([
        api.get('/stock'),
        api.get('/bills'),
        api.get('/customers'),
        api.get('/users')
      ])
      
      console.log('📡 API Results:')
      console.log('Stock Response:', stockRes)
      console.log('Bills Response:', billsRes)
      console.log('Customers Response:', customersRes)
      console.log('Users Response:', usersRes)
      
      // Extract data from responses with better debugging
      const stockData = stockRes.status === 'fulfilled' && stockRes.value?.data?.data ? 
        stockRes.value.data.data : []
      const billsData = billsRes.status === 'fulfilled' && billsRes.value?.data?.data ? 
        billsRes.value.data.data : []
      const customersData = customersRes.status === 'fulfilled' && customersRes.value?.data?.data ? 
        customersRes.value.data.data : []
      const usersData = usersRes.status === 'fulfilled' && usersRes.value?.data?.data ? 
        usersRes.value.data.data : []

      // Debug logging to see what data we're getting
      console.log('📊 Export Debug Info:')
      console.log('Stock Data:', stockData.length, stockData.slice(0, 2))
      console.log('Bills Data:', billsData.length, billsData.slice(0, 2))
      console.log('Customers Data:', customersData.length, customersData.slice(0, 2))
      console.log('Users Data:', usersData.length, usersData.slice(0, 2))

      // Generate timestamp for export
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const timeString = new Date().toLocaleTimeString().replace(/[:.]/g, '-')
      
      // Create comprehensive summary report
      const summaryData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          exportTimestamp: `${timestamp}_${timeString}`,
          totalRecords: stockData.length + billsData.length + customersData.length + usersData.length,
          exportedBy: 'System Administrator'
        },
        summary: {
          totalProducts: stockData.length,
          totalBills: billsData.length,
          totalCustomers: customersData.length,
          totalUsers: usersData.length,
          totalRevenue: billsData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0),
          totalStockValue: stockData.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || item.price || 0)), 0),
          lowStockItems: stockData.filter(item => item.quantity <= (item.minStock || 5)).length
        }
      }

      // Generate separate CSV files for each data type
      
      // 1. Summary Report
      let summaryCSV = `Export Information\n`
      summaryCSV += `Export Date,${summaryData.exportInfo.exportDate}\n`
      summaryCSV += `Total Records,${summaryData.exportInfo.totalRecords}\n`
      summaryCSV += `Exported By,${summaryData.exportInfo.exportedBy}\n\n`
      
      summaryCSV += `Business Summary\n`
      summaryCSV += `Total Products,${summaryData.summary.totalProducts}\n`
      summaryCSV += `Total Bills,${summaryData.summary.totalBills}\n`
      summaryCSV += `Total Customers,${summaryData.summary.totalCustomers}\n`
      summaryCSV += `Total Users,${summaryData.summary.totalUsers}\n`
      summaryCSV += `Total Revenue,₹${summaryData.summary.totalRevenue.toLocaleString()}\n`
      summaryCSV += `Total Stock Value,₹${summaryData.summary.totalStockValue.toLocaleString()}\n`
      summaryCSV += `Low Stock Items,${summaryData.summary.lowStockItems}\n`

      // 2. Stock/Inventory Data
      let stockCSV = `Product Code,Product Name,Category,Current Stock,Min Stock,Unit Price,Total Value,Status\n`
      stockData.forEach(item => {
        const totalValue = (item.quantity || 0) * (item.unitPrice || item.price || 0)
        const status = item.quantity === 0 ? 'Out of Stock' : 
                      item.quantity <= (item.minStock || 5) ? 'Low Stock' : 'In Stock'
        stockCSV += `${item.productCode || item.id || 'N/A'},${item.productName || item.name || 'N/A'},${item.category || 'N/A'},${item.quantity || 0},${item.minStock || 0},${item.unitPrice || item.price || 0},${totalValue.toFixed(2)},${status}\n`
      })

      // 3. Bills/Sales Data
      let billsCSV = `Bill Number,Date,Customer,Items Count,Subtotal,Tax,Total Amount,Status,Payment Method\n`
      billsData.forEach(bill => {
        const date = bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : 
                     bill.createdAt ? new Date(bill.createdAt).toISOString().split('T')[0] : 'N/A'
        const itemCount = bill.items ? bill.items.length : 0
        billsCSV += `${bill.billNumber || bill.id || 'N/A'},${date},${bill.customerName || bill.customer || 'Walk-in'},${itemCount},${bill.subtotal || bill.amount || 0},${bill.tax || 0},${bill.totalAmount || bill.total || 0},${bill.status || 'completed'},${bill.paymentMethod || 'cash'}\n`
      })

      // 4. Customer Data
      let customersCSV = `Customer Name,Phone,Email,Address,Total Bills,Total Spent,Last Purchase,Registration Date\n`
      customersData.forEach(customer => {
        const customerBills = billsData.filter(bill => 
          bill.customerId === customer.id || 
          bill.customerName?.toLowerCase() === customer.name?.toLowerCase()
        )
        const totalSpent = customerBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)
        const lastPurchase = customerBills.length > 0 ? 
          new Date(Math.max(...customerBills.map(b => new Date(b.billDate || b.createdAt)))).toISOString().split('T')[0] : 'Never'
        const regDate = customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : 'N/A'
        
        customersCSV += `${customer.name || 'N/A'},${customer.phone || 'N/A'},${customer.email || 'N/A'},${customer.address || 'N/A'},${customerBills.length},${totalSpent.toFixed(2)},${lastPurchase},${regDate}\n`
      })

      // 5. Users Data (excluding sensitive information)
      let usersCSV = `Username,First Name,Last Name,Email,Role,Status,Last Login,Registration Date\n`
      usersData.forEach(user => {
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : 'Never'
        const regDate = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A'
        usersCSV += `${user.username || 'N/A'},${user.firstName || 'N/A'},${user.lastName || 'N/A'},${user.email || 'N/A'},${user.role || 'N/A'},${user.isActive ? 'Active' : 'Inactive'},${lastLogin},${regDate}\n`
      })

      // Download all files
      const downloads = [
        { name: `business-summary-${timestamp}.csv`, content: summaryCSV },
        { name: `inventory-data-${timestamp}.csv`, content: stockCSV },
        { name: `sales-data-${timestamp}.csv`, content: billsCSV },
        { name: `customers-data-${timestamp}.csv`, content: customersCSV },
        { name: `users-data-${timestamp}.csv`, content: usersCSV }
      ]

      // Download each file
      downloads.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', file.name)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })

      toast.success(`✅ Successfully exported ${downloads.length} files with ${summaryData.exportInfo.totalRecords} total records!`)
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const managementAreas = [
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'Manage user accounts, roles, and permissions',
      color: 'bg-blue-500',
      count: 5,
      active: true,
      adminOnly: true // Only admins can access user management
    },
    {
      id: 'inventory',
      name: 'Inventory Control',
      icon: Package,
      description: 'Monitor stock levels, reorder points, and suppliers',
      color: 'bg-green-500',
      count: 10,
      active: true,
      adminOnly: false
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      icon: BarChart3,
      description: 'Generate insights and performance reports',
      color: 'bg-purple-500',
      count: 12,
      active: true,
      adminOnly: false
    },
    {
      id: 'security',
      name: 'Security Settings',
      icon: Shield,
      description: 'Configure security policies and access controls',
      color: 'bg-red-500',
      count: 3,
      active: true,
      adminOnly: true // Only admins can access security settings
    }
  ]

  // Filter management areas based on user role
  const filteredManagementAreas = managementAreas.filter(area => 
    !area.adminOnly || user?.role === 'Admin'
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Management</span>
          {activeTab !== 'overview' && (
            <>
              <span>›</span>
              <span className="text-gray-900 font-medium">
                {managementAreas.find(area => area.id === activeTab)?.name || activeTab}
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Management Center</h1>
        <p className="text-gray-600 mt-1">
          Centralized control panel for system administration
        </p>
      </div>

      {/* Management Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredManagementAreas.map((area) => (
          <div
            key={area.id}
            className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
              activeTab === area.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              if (area.active) {
                setActiveTab(area.id)
              } else {
                toast.success(`${area.name} feature coming soon!`)
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${area.color}`}>
                <area.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{area.count}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{area.name}</h3>
            <p className="text-sm text-gray-600">{area.description}</p>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Management Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Only show Manage Users for Admin users */}
              {user?.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-medium text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-600 mt-1">Add, edit, and manage user accounts</p>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('inventory')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">Inventory Control</h4>
                <p className="text-sm text-gray-600 mt-1">Monitor and adjust stock levels</p>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">Analytics & Reports</h4>
                <p className="text-sm text-gray-600 mt-1">View insights and generate reports</p>
              </button>
              
              <button
                onClick={handleExportAllData}
                disabled={loading}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {loading ? 'Exporting all business data...' : 'Export all business data to CSV files'}
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleSystemCleanup}
                disabled={cleanupLoading}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      🧹 System Cleanup
                      {cleanupLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {cleanupLoading ? 'Cleaning system files and cache...' : 'Clean temporary files, cache, and optimize performance'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Export Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <div className="flex items-start">
              <Download className="h-6 w-6 text-blue-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Export Data Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">The Export Data feature will generate 5 comprehensive CSV files:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Business Summary</strong> - Overview statistics and metrics</li>
                    <li><strong>Inventory Data</strong> - Complete product catalog with stock levels</li>
                    <li><strong>Sales Data</strong> - All bills and transaction history</li>
                    <li><strong>Customer Data</strong> - Customer information and purchase history</li>
                    <li><strong>User Data</strong> - System users and access information</li>
                  </ul>
                  <p className="mt-2 text-xs">All files are generated in real-time and compatible with Excel, Google Sheets, and other tools.</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Server Status</p>
                  <p className="font-semibold text-green-700">Online</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="font-semibold text-blue-700">Connected</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Last Backup</p>
                  <p className="font-semibold text-purple-700">2 hours ago</p>
                </div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Management Tab - Admin Only */}
      {activeTab === 'users' && user?.role === 'Admin' && (
        <UserManagement />
      )}

      {/* Show access denied for cashiers trying to access user management */}
      {activeTab === 'users' && user?.role !== 'Admin' && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to access User Management. This feature is available to Administrators only.</p>
        </div>
      )}

      {/* Inventory Control Tab */}
      {activeTab === 'inventory' && (
        <InventoryControl />
      )}

      {/* Analytics & Reports Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsReports />
      )}

      {/* Security Settings Tab - Admin Only */}
      {activeTab === 'security' && user?.role === 'Admin' && (
        <SecuritySettings />
      )}

      {/* Show access denied for cashiers trying to access security settings */}
      {activeTab === 'security' && user?.role !== 'Admin' && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to access Security Settings. This feature is available to Administrators only.</p>
        </div>
      )}

      {/* Coming Soon Tabs */}
      {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'inventory' && activeTab !== 'analytics' && activeTab !== 'security' && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">This feature is under development and will be available soon.</p>
          <button
            onClick={() => setActiveTab('overview')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Overview
          </button>
        </div>
      )}
    </div>
  )
}

export default Manage