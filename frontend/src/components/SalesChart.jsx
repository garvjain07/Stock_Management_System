import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const SalesChart = ({ 
  data = [], 
  type = 'line', 
  height = 'h-64', 
  showCurrency = true, 
  currencySymbol = '₹', 
  dataLabel = 'Sales Amount',
  dateRange = '7'
}) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []
  
  // Debug logging
  console.log('SalesChart - Date Range:', dateRange, 'days')
  console.log('SalesChart - Original Data:', safeData)
  console.log('SalesChart - Data length:', safeData.length)
  
  const chartData = {
    labels: safeData.map(item => item.date) || [],
    datasets: [
      {
        label: dataLabel,
        data: safeData.map(item => item.sales || item.value) || [],
        ...(type === 'bar' ? {
          // Bar chart styling
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 101, 101, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(99, 102, 241, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(245, 101, 101)',
            'rgb(251, 191, 36)',
            'rgb(34, 197, 94)',
            'rgb(99, 102, 241)'
          ],
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        } : {
          // Line chart styling
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        })
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return showCurrency 
              ? `${currencySymbol}${context.parsed.y.toLocaleString()}`
              : context.parsed.y.toLocaleString()
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: type === 'bar' ? false : true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: type === 'bar' ? 7 : 12
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          stepSize: showCurrency ? undefined : 1,
          callback: function(value) {
            return showCurrency 
              ? `${currencySymbol}${value.toLocaleString()}`
              : value.toLocaleString()
          }
        }
      }
    },
    interaction: {
      intersect: type === 'bar',
      mode: type === 'bar' ? 'nearest' : 'index'
    },
    ...(type === 'bar' && {
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 1,
          to: 0,
          loop: false
        }
      },
      onHover: (event, activeElements) => {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
      }
    })
  }

  if (!data || data.length === 0) {
    const noDataMessage = showCurrency ? 'No sales data available' : 'No order data available'
    const subMessage = showCurrency 
      ? 'Sales data will appear here once you have transactions'
      : 'Order data will appear here once you have transactions'
    
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>{noDataMessage}</p>
          <p className="text-sm mt-1">{subMessage}</p>
        </div>
      </div>
    )
  }

  const ChartComponent = type === 'bar' ? Bar : Line

  return (
    <div className={height}>
      <ChartComponent data={chartData} options={options} />
    </div>
  )
}

export default SalesChart