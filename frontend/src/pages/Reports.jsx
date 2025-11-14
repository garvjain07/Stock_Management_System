import React, { useState, useEffect } from 'react'
import { 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalBills: 0,
    todaysRevenue: 0,
    lowStockCount: 0
  })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago (3 months)
    to: new Date().toISOString().split('T')[0] // Today
  })

  useEffect(() => {
    fetchRealTimeData()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRealTimeData()
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchRealTimeData = async () => {
    try {
      setReportsLoading(true)
      
      // Fetch real-time data from multiple endpoints
      const [dashboardRes, stockRes, customersRes, billsRes] = await Promise.all([
        api.get('/api/reports/dashboard').catch(() => ({ data: { data: {} } })),
        api.get('/api/stock').catch(() => ({ data: { data: [] } })),
        api.get('/api/customers').catch(() => ({ data: { data: [] } })),
        api.get('/api/bills').catch(() => ({ data: { data: [] } }))
      ])
      
      // Extract data from responses
      const dashboardData = dashboardRes.data.data || {}
      const stockData = stockRes.data.data || stockRes.data || []
      const customersData = customersRes.data.data || customersRes.data || []
      const billsData = billsRes.data.data || billsRes.data || []
      
      // Calculate real-time metrics
      const totalRevenue = billsData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)
      const todaysRevenue = dashboardData.overview?.todaysRevenue || 0
      const lowStockCount = stockData.filter(item => item.quantity <= (item.minStock || 5)).length
      
      setRealTimeData({
        totalRevenue: totalRevenue,
        totalProducts: stockData.length,
        totalCustomers: customersData.length,
        totalBills: billsData.length,
        todaysRevenue: todaysRevenue,
        lowStockCount: lowStockCount
      })
      
      setLastUpdated(new Date())
      toast.success('Reports data updated successfully!')
    } catch (error) {
      console.error('Error fetching real-time data:', error)
      toast.error('Failed to fetch real-time data')
    } finally {
      setReportsLoading(false)
    }
  }

  const reports = [
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'Detailed sales analysis with revenue breakdown',
      icon: DollarSign,
      color: 'bg-green-500',
      features: ['Revenue analysis', 'Product performance', 'Time-based trends']
    },
    {
      id: 'stock-report',
      title: 'Stock Report',
      description: 'Current inventory levels and stock movements',
      icon: Package,
      color: 'bg-blue-500',
      features: ['Current stock levels', 'Low stock alerts', 'Stock valuation']
    },
    {
      id: 'customer-report',
      title: 'Customer Report',
      description: 'Customer analysis and purchase history',
      icon: Users,
      color: 'bg-purple-500',
      features: ['Customer list', 'Purchase history', 'Customer statistics']
    },
    {
      id: 'bill-report',
      title: 'Bills Report',
      description: 'Complete billing history and invoice details',
      icon: ShoppingCart,
      color: 'bg-orange-500',
      features: ['Bill summaries', 'Payment status', 'Invoice details']
    }
  ]

  const handleGenerateReport = async (reportId) => {
    try {
      setLoading(true)
      
      // Fetch real-time data for report generation
      let csvContent = ''
      let filename = ''
      
      switch (reportId) {
        case 'sales-report':
          const billsRes = await api.get('/api/bills')
          const billsData = billsRes.data.data || billsRes.data || []
          
          // Filter bills by date range with better date handling
          const filteredBills = billsData.filter(bill => {
            try {
              const billDate = new Date(bill.billDate || bill.createdAt)
              const fromDate = new Date(dateRange.from + 'T00:00:00') // Start of day
              const toDate = new Date(dateRange.to + 'T23:59:59')     // End of day
              
              // Check if dates are valid
              if (isNaN(billDate.getTime()) || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                console.warn('Invalid date found in bill:', bill)
                return false
              }
              
              return billDate >= fromDate && billDate <= toDate
            } catch (error) {
              console.error('Error filtering bill by date:', bill, error)
              return false
            }
          })
          
          console.log(`Sales Report: Found ${billsData.length} total bills, ${filteredBills.length} in date range (${dateRange.from} to ${dateRange.to})`)
          
          csvContent = `Date,Bill Number,Customer,Amount,Tax,Total\n`
          filteredBills.forEach(bill => {
            const date = new Date(bill.billDate || bill.createdAt).toISOString().split('T')[0]
            csvContent += `${date},${bill.billNumber || bill.id || 'N/A'},${bill.customerName || bill.customer || 'Walk-in'},${bill.subtotal || bill.amount || 0},${bill.tax || 0},${bill.totalAmount || bill.total || 0}\n`
          })
          
          if (filteredBills.length === 0) {
            csvContent += `No bills found in the selected date range\n`
            console.warn('No bills found in date range. Check your date filters.')
          }
          filename = `sales-report-${dateRange.from}-to-${dateRange.to}.csv`
          break
          
        case 'stock-report':
          const stockRes = await api.get('/api/stock')
          const stockData = stockRes.data.data || stockRes.data || []
          
          csvContent = `Product Code,Product Name,Category,Current Stock,Min Stock,Unit Price,Total Value\n`
          stockData.forEach(item => {
            const totalValue = (item.quantity || 0) * (item.unitPrice || item.price || 0)
            csvContent += `${item.productCode || item.id},${item.productName || item.name},${item.category || 'N/A'},${item.quantity || 0},${item.minStock || 0},${item.unitPrice || item.price || 0},${totalValue.toFixed(2)}\n`
          })
          filename = `stock-report-${new Date().toISOString().split('T')[0]}.csv`
          break
          
        case 'customer-report':
          const customersRes = await api.get('/api/customers')
          const customersData = customersRes.data.data || customersRes.data || []
          
          csvContent = `Customer Name,Phone,Email,Total Bills,Total Amount\n`
          customersData.forEach(customer => {
            csvContent += `${customer.name || 'N/A'},${customer.phone || 'N/A'},${customer.email || 'N/A'},${customer.billCount || 0},${customer.totalSpent || 0}\n`
          })
          filename = `customer-report-${new Date().toISOString().split('T')[0]}.csv`
          break
          
        case 'bill-report':
          const allBillsRes = await api.get('/api/bills')
          const allBillsData = allBillsRes.data.data || allBillsRes.data || []
          
          // Filter bills by date range with better date handling
          const filteredAllBills = allBillsData.filter(bill => {
            try {
              const billDate = new Date(bill.billDate || bill.createdAt)
              const fromDate = new Date(dateRange.from + 'T00:00:00') // Start of day
              const toDate = new Date(dateRange.to + 'T23:59:59')     // End of day
              
              // Check if dates are valid
              if (isNaN(billDate.getTime()) || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                console.warn('Invalid date found in bill:', bill)
                return false
              }
              
              return billDate >= fromDate && billDate <= toDate
            } catch (error) {
              console.error('Error filtering bill by date:', bill, error)
              return false
            }
          })
          
          console.log(`Bill Report: Found ${allBillsData.length} total bills, ${filteredAllBills.length} in date range (${dateRange.from} to ${dateRange.to})`)
          
          csvContent = `Bill Number,Date,Customer,Items,Subtotal,Tax,Total,Status\n`
          filteredAllBills.forEach(bill => {
            const date = new Date(bill.billDate || bill.createdAt).toISOString().split('T')[0]
            const itemCount = bill.items ? bill.items.length : 0
            csvContent += `${bill.billNumber || bill.id || 'N/A'},${date},${bill.customerName || bill.customer || 'Walk-in'},${itemCount},${bill.subtotal || bill.amount || 0},${bill.tax || 0},${bill.totalAmount || bill.total || 0},${bill.status || 'paid'}\n`
          })
          
          if (filteredAllBills.length === 0) {
            csvContent += `No bills found in the selected date range\n`
            console.warn('No bills found in date range. Check your date filters.')
          }
          filename = `bill-report-${dateRange.from}-to-${dateRange.to}.csv`
          break
          
        default:
          throw new Error('Unknown report type')
      }
      
      // Download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Report generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Generate detailed reports and analyze your business data
        </p>
      </div>

      {/* Real-time Quick Stats - MOVED TO TOP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  `₹${realTimeData.totalRevenue.toLocaleString()}`
                )}
              </p>
              <p className="text-xs text-green-600">Today: ₹{realTimeData.todaysRevenue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reportsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  realTimeData.totalProducts
                )}
              </p>
              <p className="text-xs text-orange-600">Low stock: {realTimeData.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  realTimeData.totalCustomers
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  realTimeData.totalBills
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Controls - MOVED AFTER SUMMARY CARDS */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={fetchRealTimeData}
              disabled={reportsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${reportsLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-refresh (30s)</span>
            </label>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Date Range Selector - MOVED AFTER REFRESH CONTROLS */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>
        
        {/* Quick Date Range Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setDateRange({
              from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              to: new Date().toISOString().split('T')[0]
            })}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 7 days
          </button>
          <button
            onClick={() => setDateRange({
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              to: new Date().toISOString().split('T')[0]
            })}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 30 days
          </button>
          <button
            onClick={() => setDateRange({
              from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              to: new Date().toISOString().split('T')[0]
            })}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 3 months
          </button>
          <button
            onClick={() => setDateRange({
              from: '2025-01-01', // Start of year to capture all data
              to: new Date().toISOString().split('T')[0]
            })}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
          >
            All Data
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Current range: {dateRange.from} to {dateRange.to}
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${report.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Real-time Report Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Reports use real-time data from your live database</p>
              <p>• Statistics auto-refresh every 30 seconds when enabled</p>
              <p>• Generated reports include data from the selected date range</p>
              <p>• CSV format is compatible with Excel, Google Sheets, and other tools</p>
              <p>• All data is fetched securely from authenticated API endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports