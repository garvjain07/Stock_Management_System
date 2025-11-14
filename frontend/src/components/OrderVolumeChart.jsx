import React, { useState, useEffect } from 'react'
import { ShoppingCart, RefreshCw } from 'lucide-react'
import SalesChart from './SalesChart'
import api from '../utils/api'
import { toast } from 'react-hot-toast'

const OrderVolumeChart = ({ dateRange = '7' }) => {
  const [orderData, setOrderData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dataSource, setDataSource] = useState('unknown')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrderData()
  }, [dateRange])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderData(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [dateRange])

  const fetchOrderData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const response = await api.get(`/api/analytics/orders?period=${dateRange}`)
      
      let processedData = []
      
      // Try orders API first
      if (response.data?.data?.orderData && Array.isArray(response.data.data.orderData)) {
        processedData = response.data.data.orderData.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          orders: item.orders || 0,
          value: item.orders || 0
        }))
        
        setLastUpdated(new Date(response.data.data.lastUpdated || Date.now()))
        setDataSource(response.data.data.dataSource || 'real')
        
      } else {
        // Fallback to sales API for order data
        try {
          const salesResponse = await api.get(`/api/analytics/sales?period=${dateRange}`)
          if (salesResponse.data?.data?.salesData && Array.isArray(salesResponse.data.data.salesData)) {
            processedData = salesResponse.data.data.salesData.map(item => ({
              date: new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              orders: item.orders || 0,
              value: item.orders || 0
            }))
            setDataSource(salesResponse.data.data.dataSource || 'real')
            setLastUpdated(new Date(salesResponse.data.data.lastUpdated || Date.now()))
          } else {
            // No data available - set empty array
            processedData = []
            setDataSource('no-data')
            setLastUpdated(new Date())
          }
        } catch (salesError) {
          console.log('Sales API also failed')
          processedData = []
          setDataSource('no-data')
          setLastUpdated(new Date())
        }
      }

      setOrderData(processedData)
      
      // Calculate total orders
      const total = processedData.reduce((sum, item) => sum + item.orders, 0)
      setTotalOrders(total)
      
      // Show success message only for manual refresh
      if (silent && dataSource === 'real') {
        console.log('Order data refreshed automatically')
      }
      
    } catch (error) {
      console.error('Error fetching order data:', error)
      // Set empty data on error - no mock data
      setOrderData([])
      setTotalOrders(0)
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
    fetchOrderData(false)
    toast.success('Order data refreshed!')
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
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Order Volume</h3>
          {dataSource === 'real' && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              Live Data
            </span>
          )}
          {dataSource === 'no-data' && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              No Data
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
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-700">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-4">
        <SalesChart 
          data={orderData} 
          type="bar" 
          height="h-64"
          showCurrency={false}
          dataLabel="Order Count"
        />
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 flex items-center justify-between">
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

export default OrderVolumeChart