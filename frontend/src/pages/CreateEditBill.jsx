import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Minus, 
  X, 
  Save, 
  Search, 
  ShoppingCart,
  User,
  Calculator
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import LoadingSpinner from '../components/LoadingSpinner'
import CustomerModal from '../components/CustomerModal'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const CreateEditBill = () => {
  console.log('CreateEditBill component is loading...')
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id)
  
  console.log('CreateEditBill - id:', id, 'isEditing:', isEditing, 'user:', user)
  
  // Helper function to check if user can edit existing bills
  const canEditExistingBills = () => {
    return user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'Manager'
  }
  
  // Helper function to check if user can create new bills (cashiers can create)
  const canCreateBills = () => {
    return user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'Manager' || user?.role === 'cashier' || user?.role === 'Cashier'
  }
  
  // Helper function to check if current operation is allowed
  const canPerformCurrentAction = () => {
    if (isEditing) {
      return canEditExistingBills() // Only admins/managers can edit existing bills
    } else {
      return canCreateBills() // Cashiers can create new bills
    }
  }
  
  // Check permissions - only redirect cashiers if they cannot create bills
  useEffect(() => {
    if (isEditing) {
      // For editing existing bills, allow cashiers to view but show warning
      if (!canEditExistingBills()) {
        toast.success('Viewing bill in read-only mode')
      }
    } else {
      // For creating new bills, redirect if no permission
      if (!canCreateBills()) {
        toast.error('You do not have permission to create bills')
        navigate('/bills')
        return
      }
    }
  }, [isEditing, user, navigate])
  
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState([])
  const [customers, setCustomers] = useState([])
  const [billItems, setBillItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      customerId: '',
      billDate: new Date().toISOString().split('T')[0],
      notes: '',
      discount: 0,
      tax: 0
    },
    mode: 'onChange'
  })

  // Watch tax and discount for real-time updates
  const taxValue = watch('tax')
  const discountValue = watch('discount')

  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData()
      if (isEditing) {
        await fetchBillData()
      }
    }
    loadData()
  }, [id])

  const fetchInitialData = async () => {
    try {
      console.log('CreateEditBill: Fetching initial data...')
      const [stocksRes, customersRes] = await Promise.all([
        api.get('/api/stock'),
        api.get('/api/customers')
      ])
      
      console.log('CreateEditBill: Stock API response:', stocksRes.data)
      console.log('CreateEditBill: Customer API response:', customersRes.data)
      
      // The backend might return {success: true, data: [...]} format
      let stockData = stocksRes.data
      let customerData = customersRes.data
      
      // Check if response has nested data property
      if (stockData && typeof stockData === 'object' && stockData.data) {
        stockData = stockData.data
      }
      if (customerData && typeof customerData === 'object' && customerData.data) {
        customerData = customerData.data
      }
      
      // Ensure data is always an array
      const processedStocks = Array.isArray(stockData) ? stockData : []
      const processedCustomers = Array.isArray(customerData) ? customerData : []
      
      console.log('CreateEditBill: Final processed stocks:', processedStocks)
      console.log('CreateEditBill: Final processed customers:', processedCustomers)
      
      setStocks(processedStocks)
      setCustomers(processedCustomers)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      // Set safe defaults on error
      setStocks([])
      setCustomers([])
      toast.error('Failed to load data')
    }
  }

  const handleCreateCustomer = async (customerData) => {
    try {
      console.log('Creating new customer:', customerData)
      const response = await api.post('/api/customers', customerData)
      
      let newCustomer
      if (response.data && response.data.data) {
        newCustomer = response.data.data
      } else if (response.data) {
        newCustomer = response.data
      }
      
      // Update customers list
      setCustomers(prevCustomers => [...prevCustomers, newCustomer])
      
      // Auto-select the newly created customer
      if (newCustomer && newCustomer.id) {
        setValue('customerId', newCustomer.id)
        setSelectedCustomer(newCustomer)
      }
      
      setShowCustomerModal(false)
      toast.success('Customer created successfully!')
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer')
    }
  }

  const fetchBillData = async () => {
    try {
      setLoading(true)
      
      // Fetch both bill data and fresh stock data to ensure accurate calculations
      const [billResponse, stockResponse] = await Promise.all([
        api.get(`/api/bills/${id}`),
        api.get('/api/stock')
      ])
      
      console.log('CreateEditBill: Bill API response:', billResponse.data)
      console.log('CreateEditBill: Fresh stock data:', stockResponse.data)
      
      // Handle backend response format {success: true, data: bill}
      const bill = billResponse.data.data || billResponse.data
      const freshStocks = stockResponse.data.data || stockResponse.data
      
      // Format date safely
      let formattedDate = new Date().toISOString().split('T')[0] // default to today
      if (bill.billDate) {
        try {
          const dateObj = new Date(bill.billDate)
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0]
          }
        } catch (dateError) {
          console.warn('Error parsing bill date:', bill.billDate, dateError)
        }
      }
      
      // Set form values
      reset({
        customerId: bill.customerId || '',
        billDate: formattedDate,
        notes: bill.notes || '',
        discount: bill.discount || 0,
        tax: bill.tax || 0
      })
      
      // Set bill items - backend stores in bill.items, not bill.BillItems
      const originalBillItems = bill.items || bill.BillItems || []
      
      // Add current stock information to bill items for proper quantity controls
      console.log('CreateEditBill: Fresh stocks for bill items:', freshStocks)
      console.log('CreateEditBill: Original bill items:', originalBillItems)
      
      const enhancedBillItems = originalBillItems.map(item => {
        const stockItem = Array.isArray(freshStocks) ? freshStocks.find(s => s.id === item.stockId) : null
        // Available stock = current stock + quantity already in this bill
        const availableStock = stockItem ? (stockItem.quantity + item.quantity) : item.quantity
        
        console.log(`Item ${item.stockId}: stockItem=${stockItem?.productName}, stockQuantity=${stockItem?.quantity}, itemQuantity=${item.quantity}, availableStock=${availableStock}`)
        
        return {
          ...item,
          id: item.id || item.stockId,
          stockId: item.stockId, // Ensure stockId is preserved
          availableStock: availableStock,
          productName: item.productName || stockItem?.productName || 'Unknown Product',
          unitPrice: item.unitPrice || stockItem?.price || 0
        }
      })
      
      setBillItems(enhancedBillItems)
      
      // Set selected customer - find from customers list if customerId exists
      if (bill.customerId && Array.isArray(customers)) {
        const customer = customers.find(c => c.id === bill.customerId)
        if (customer) {
          setSelectedCustomer(customer)
        }
      }
    } catch (error) {
      console.error('Error fetching bill:', error)
      toast.error('Failed to load bill')
      navigate('/bills')
    } finally {
      setLoading(false)
    }
  }

  const addProductToBill = (stock) => {
    const safeBillItems = Array.isArray(billItems) ? billItems : []
    const existingItem = safeBillItems.find(item => item.stockId === stock.id)
    
    if (existingItem) {
      // Increase quantity if product already exists
      setBillItems(safeBillItems.map(item => 
        item.stockId === stock.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Add new product
      const newItem = {
        id: Date.now(), // Temporary ID for new items
        stockId: stock.id,
        productName: stock.productName,
        unitPrice: stock.unitPrice,
        quantity: 1,
        availableStock: stock.quantity
      }
      setBillItems([...billItems, newItem])
    }
    
    setShowProductSearch(false)
    setSearchTerm('')
  }

  const updateItemQuantity = (itemId, newQuantity) => {
    console.log(`UpdateItemQuantity called: itemId=${itemId}, newQuantity=${newQuantity}`)
    
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    
    const safeBillItems = Array.isArray(billItems) ? billItems : []
    const targetItem = safeBillItems.find(item => item.id === itemId || item.stockId === itemId)
    
    console.log('Target item found:', targetItem)
    console.log('Available stock:', targetItem?.availableStock)
    
    // Check stock availability
    if (targetItem && targetItem.availableStock && newQuantity > targetItem.availableStock) {
      toast.error(`Cannot exceed available stock. Maximum available: ${targetItem.availableStock}`)
      return
    }
    
    setBillItems(safeBillItems.map(item => 
      item.id === itemId || item.stockId === itemId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeItem = (itemId) => {
    const safeBillItems = Array.isArray(billItems) ? billItems : []
    setBillItems(safeBillItems.filter(item => 
      item.id !== itemId && item.stockId !== itemId
    ))
  }

  const calculateSubtotal = () => {
    if (!Array.isArray(billItems)) return 0
    return billItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = parseFloat(discountValue || 0)
    const tax = parseFloat(taxValue || 0)
    
    const discountAmount = (subtotal * discount) / 100
    const taxAmount = ((subtotal - discountAmount) * tax) / 100
    
    return subtotal - discountAmount + taxAmount
  }

  const onSubmit = async (data) => {
    try {
      // Check if user has permission to save bills
      if (!canPerformCurrentAction()) {
        toast.error(isEditing ? 'You do not have permission to edit bills' : 'You do not have permission to create bills')
        return
      }
      
      if (billItems.length === 0) {
        toast.error('Please add at least one item to the bill')
        return
      }

      setLoading(true)

      const totalAmount = calculateTotal()
      
      // Get customer name if customer is selected
      const customer = customers.find(c => c.id === data.customerId)
      const customerName = customer ? customer.name : 'Walk-in Customer'
      
      const billData = {
        ...data,
        customerId: data.customerId || null,
        customerName: customerName,
        items: billItems.map(item => ({
          stockId: item.stockId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        subtotal: calculateSubtotal(),
        totalAmount: totalAmount,
        paymentMethod: 'cash',
        amountPaid: totalAmount,
        createdBy: user.id
      }

      console.log('CreateEditBill: Submitting bill data:', billData)
      console.log('CreateEditBill: Bill items with stock IDs:', billData.items)

      if (isEditing) {
        console.log('CreateEditBill: Updating bill with ID:', id)
        const response = await api.put(`/api/bills/${id}`, billData)
        console.log('CreateEditBill: Update response:', response.data)
        toast.success('Bill updated successfully')
      } else {
        console.log('CreateEditBill: Creating new bill')
        const response = await api.post('/api/bills', billData)
        console.log('CreateEditBill: Create response:', response.data)
        toast.success('Bill created successfully! Stock quantities updated.')
      }

      navigate('/bills')
    } catch (error) {
      console.error('Error saving bill:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      const errorMessage = error.response?.data?.message || 'Failed to save bill'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Safely filter stocks, ensuring it's an array
  const safeStocks = Array.isArray(stocks) ? stocks : []
  
  const filteredStocks = safeStocks.filter(stock => {
    if (!stock) return false
    
    const nameMatch = stock.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    const codeMatch = stock.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const hasStock = stock.quantity > 0
    
    return (nameMatch || codeMatch) && hasStock
  })
  
  // Debug when search term exists and no results found
  if (searchTerm && filteredStocks.length === 0 && safeStocks.length > 0) {
    console.log('CreateEditBill: Search failed!')
    console.log('Search term:', searchTerm)
    console.log('Available products:', safeStocks.map(s => ({
      name: s.productName, 
      code: s.productCode, 
      qty: s.quantity
    })))
  }

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing 
              ? (canEditExistingBills() ? 'Edit Bill' : 'View Bill')
              : 'Create New Bill'
            }
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing 
              ? (canEditExistingBills() ? 'Update bill details and items' : 'View bill details and items')
              : 'Add products and generate a new bill'
            }
          </p>
        </div>
        
        <button
          onClick={() => navigate('/bills')}
          className="btn-secondary"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Read-only warning for cashiers when editing existing bills */}
        {isEditing && !canEditExistingBills() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>View Only Mode:</strong> You can view all bill details, products, and totals but cannot make changes. Only administrators can edit existing bills.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Bill Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div>
              <label className="form-label">Customer</label>
              <div className="relative">
                <select
                  {...register('customerId')}
                  className="form-input"
                  disabled={isEditing && !canEditExistingBills()}
                  onChange={(e) => {
                    if (e.target.value === 'CREATE_NEW') {
                      setShowCustomerModal(true)
                      e.target.value = '' // Reset select to Walk-in
                      return
                    }
                    const customer = customers.find(c => c.id === parseInt(e.target.value))
                    setSelectedCustomer(customer)
                  }}
                >
                  <option value="">Walk-in Customer</option>
                  <option value="CREATE_NEW" className="text-blue-600 font-medium">
                    + Create New Customer
                  </option>
                  {Array.isArray(customers) && customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bill Date */}
            <div>
              <label className="form-label">Bill Date</label>
              <input
                type="date"
                {...register('billDate', { 
                  required: 'Bill date is required',
                  validate: {
                    notFuture: (value) => {
                      const selectedDate = new Date(value)
                      const today = new Date()
                      today.setHours(23, 59, 59, 999) // End of today
                      return selectedDate <= today || 'Bill date cannot be in the future'
                    }
                  }
                })}
                className={`form-input ${errors.billDate ? 'border-red-300' : ''}`}
                max={new Date().toISOString().split('T')[0]}
                readOnly={isEditing && !canEditExistingBills()}
              />
              {errors.billDate && (
                <p className="form-error">{errors.billDate.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Bills cannot be created for future dates
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows="2"
              className="form-input"
              placeholder="Add any notes or comments..."
              readOnly={isEditing && !canEditExistingBills()}
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <button
              type="button"
              onClick={() => setShowProductSearch(true)}
              disabled={isEditing && !canEditExistingBills()}
              className={`btn-primary ${isEditing && !canEditExistingBills() ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isEditing && !canEditExistingBills() ? 'You can only view this bill' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Bill Items */}
          {(!Array.isArray(billItems) || billItems.length === 0) ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items added yet</p>
              <p className="text-sm text-gray-400">Click "Add Product" to start adding items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.isArray(billItems) && billItems.map((item) => (
                <div
                  key={item.id || item.stockId}
                  className="flex items-center space-x-4 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">₹{item.unitPrice} per unit</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id || item.stockId, item.quantity - 1)}
                      disabled={isEditing && !canEditExistingBills()}
                      className={`p-1 ${isEditing && !canEditExistingBills() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600'}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        console.log(`Plus button clicked for item: ${item.id || item.stockId}, current quantity: ${item.quantity}, availableStock: ${item.availableStock}`)
                        updateItemQuantity(item.id || item.stockId, item.quantity + 1)
                      }}
                      className={`p-1 ${(isEditing && !canEditExistingBills()) || item.quantity >= (item.availableStock || 0) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-green-600'}`}
                      disabled={(isEditing && !canEditExistingBills()) || item.quantity >= (item.availableStock || 0)}
                      title={`Available: ${item.availableStock || 0}, Current: ${item.quantity}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeItem(item.id || item.stockId)}
                    disabled={isEditing && !canEditExistingBills()}
                    className={`${isEditing && !canEditExistingBills() ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bill Summary */}
        {billItems.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Discount */}
              <div>
                <label className="form-label">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register('discount')}
                  className="form-input"
                  placeholder="0.00"
                  readOnly={isEditing && !canEditExistingBills()}
                />
              </div>

              {/* Tax */}
              <div>
                <label className="form-label">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register('tax')}
                  className="form-input"
                  placeholder="0.00"
                  readOnly={isEditing && !canEditExistingBills()}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discountValue}%):</span>
                  <span>-₹{((calculateSubtotal() * parseFloat(discountValue || 0)) / 100).toFixed(2)}</span>
                </div>
              )}
              
              {taxValue > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax ({taxValue}%):</span>
                  <span>₹{(((calculateSubtotal() - (calculateSubtotal() * parseFloat(discountValue || 0)) / 100) * parseFloat(taxValue || 0)) / 100).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/bills')}
            className="btn-secondary"
          >
            {isEditing && !canEditExistingBills() ? 'Back to Bills' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={loading || billItems.length === 0 || !canPerformCurrentAction()}
            className={`btn-primary ${!canPerformCurrentAction() ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!canPerformCurrentAction() ? (isEditing ? 'You do not have permission to edit bills' : 'You do not have permission to create bills') : ''}
          >
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {!canPerformCurrentAction() ? 'View Only' : (isEditing ? 'Update Bill' : 'Create Bill')}
          </button>
        </div>
      </form>

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {filteredStocks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => addProductToBill(stock)}
                      className="w-full p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{stock.productName}</p>
                          <p className="text-sm text-gray-500">
                            {stock.productCode} • Stock: {stock.quantity} {stock.unit}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ₹{stock.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          customer={null}
          onSave={handleCreateCustomer}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </div>
  )
}

export default CreateEditBill