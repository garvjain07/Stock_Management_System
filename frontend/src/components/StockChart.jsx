import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const StockChart = ({ data = [] }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []
  
  const chartData = {
    labels: safeData.map(item => item.productName) || [],
    datasets: [
      {
        label: 'Current Stock',
        data: safeData.map(item => item.currentStock) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Minimum Stock',
        data: safeData.map(item => item.minStock) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  // Calculate dynamic width based on number of categories (minimum 5 visible)
  const minVisibleCategories = 5
  const totalCategories = safeData.length
  const categoryWidth = 80 // Width per category in pixels
  const chartWidth = Math.max(minVisibleCategories * categoryWidth, totalCategories * categoryWidth)
  
  // Chart height configuration for vertical scrolling
  const chartHeight = 400 // Increased height to enable vertical scrolling
  
  // Calculate dynamic scale range based on maximum stock value
  const maxCurrentStock = Math.max(...safeData.map(item => item.currentStock || 0), 0)
  const maxMinStock = Math.max(...safeData.map(item => item.minStock || 0), 0)
  const maxStockValue = Math.max(maxCurrentStock, maxMinStock)
  
  // Set dynamic scale range with uniform 20-unit intervals
  const bufferValue = Math.ceil(maxStockValue * 1.2) // Add 20% padding
  const scaleRange = Math.max(Math.ceil(bufferValue / 20) * 20, 120) // Round up to nearest 20, minimum 120

  const options = {
    responsive: false, // Disable responsive to control width manually
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20, // Add bottom padding to ensure X-axis labels are visible
        left: 10,
        right: 10,
        top: 10
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#6b7280',
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} units`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 0,
          maxTicksLimit: totalCategories, // Show all categories
          autoSkip: false, // Prevent skipping labels during scroll
          padding: 5 // Add padding to prevent label cutoff
        },
        position: 'bottom', // Keep X-axis at bottom during vertical scroll
        offset: true // Offset labels from axis line
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: scaleRange, // Set maximum scale dynamically based on data
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          stepSize: 20, // Fixed 20-unit intervals for uniform spacing
          maxTicksLimit: Math.floor(scaleRange / 20) + 1, // Limit ticks to 20-unit multiples only
          callback: function(value) {
            return value + ' units'
          }
        },
        position: 'left' // Ensure Y-axis stays on the left during scrolling
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No stock data available</p>
          <p className="text-sm mt-1">Stock levels will appear here once you add products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 relative">
      {/* Scrollable container for the chart */}
      <div 
        className="w-full h-full overflow-x-auto overflow-y-auto chart-scrollbar"
      >
        <div 
          style={{ 
            width: `${chartWidth}px`, 
            height: `${chartHeight}px`,
            minWidth: '400px',
            minHeight: '320px'
          }}
          className="relative"
        >
          <Bar data={chartData} options={options} width={chartWidth} height={chartHeight} />
        </div>
      </div>
    </div>
  )
}

export default StockChart