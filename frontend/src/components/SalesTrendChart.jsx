import React, { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import SalesChart from './SalesChart'
import api from '../utils/api'
import { toast } from 'react-hot-toast'

const SalesTrendChart = ({ dateRange = '7' }) => {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalSales, setTotalSales] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dataSource, setDataSource] = useState('unknown')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchSalesData()
  }, [dateRange])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSalesData(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [dateRange])

  const fetchSalesData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const response = await api.get(`/api/analytics/sales?period=${dateRange}`)
      
      let processedData = []
      if (response.data?.data?.salesData && Array.isArray(response.data.data.salesData)) {
        processedData = response.data.data.salesData.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          sales: item.sales || item.amount || 0,
          value: item.sales || item.amount || 0
        }))
        
        // Update metadata
        setLastUpdated(new Date(response.data.data.lastUpdated || Date.now()))
        setDataSource(response.data.data.dataSource || 'real')
        
      } else {
        // No data available - set empty array
        processedData = []
        setDataSource('no-data')
        setLastUpdated(new Date())
      }

      setSalesData(processedData)
      
      // Calculate total sales
      const total = processedData.reduce((sum, item) => sum + item.sales, 0)
      setTotalSales(total)
      
      // Show success message only for manual refresh
      if (silent && dataSource === 'real') {
        console.log('Sales data refreshed automatically')
      }
      
    } catch (error) {
      console.error('Error fetching sales data:', error)
      // Set empty data on error - no mock data
      setSalesData([])
      setTotalSales(0)
      setDataSource('no-data')
      setLastUpdated(new Date())
      
      if (!silent) {
        toast.error('No data available - check connection to data source')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchSalesData(false)
    toast.success('Sales data refreshed!')
  }





  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          {dataSource === 'real' && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              Live Data
            </span>
          )}
          {dataSource === 'mock' && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
              Sample Data
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-colors ${
              refreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* Sales Summary */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{totalSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-4">
        <SalesChart 
          data={salesData} 
          type="bar" 
          height="h-64"
        />
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
          <span>
            Last updated: {lastUpdated.toLocaleTimeString()} 
            {dataSource === 'real' && ' • Auto-refreshes every 30s'}
          </span>
          {refreshing && (
            <span className="flex items-center">
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              Updating...
            </span>
          )}
        </div>
      )}


    </div>
  )
}

export default SalesTrendChart