import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../utils/api'

const StockModal = ({ stock, suppliers, onSave, onClose }) => {
  console.log('StockModal props:', { stock, suppliers: suppliers?.length, onSave: typeof onSave, onClose: typeof onClose })
  const isEditing = Boolean(stock)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  
  const [showCustomUnit, setShowCustomUnit] = useState(false)
  const [customUnit, setCustomUnit] = useState('')
  const [units, setUnits] = useState([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [editingUnit, setEditingUnit] = useState(null)
  const [editUnitName, setEditUnitName] = useState('')
  
  const [showCustomSupplier, setShowCustomSupplier] = useState(false)
  const [customSupplier, setCustomSupplier] = useState('')
  const [customSuppliers, setCustomSuppliers] = useState(() => {
    // Load custom suppliers from localStorage
    const saved = localStorage.getItem('customSuppliers')
    return saved ? JSON.parse(saved) : []
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: stock || {
      productCode: '',
      productName: '',
      category: '',
      description: '',
      quantity: 0,
      unit: 'pcs',
      unitPrice: 0,
      minStock: 1,
      supplierId: ''
    }
  })

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await api.get('/api/categories')
        const categoriesData = response.data.data || response.data || []
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch units from API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoadingUnits(true)
        const response = await api.get('/api/units')
        const unitsData = response.data.data || response.data || []
        setUnits(unitsData)
      } catch (error) {
        console.error('Error fetching units:', error)
        setUnits([])
      } finally {
        setLoadingUnits(false)
      }
    }
    fetchUnits()
  }, [])

  // Reset form with stock data after categories and units are loaded
  useEffect(() => {
    if (stock && !loadingCategories && !loadingUnits) {
      reset(stock)
    }
  }, [stock, reset, loadingCategories, loadingUnits])

  const onSubmit = async (data) => {
    console.log('StockModal onSubmit called with data:', data)
    console.log('Form errors:', errors)
    console.log('onSave function:', onSave)
    try {
      const stockData = {
        ...data,
        quantity: parseInt(data.quantity) || 0,
        unitPrice: parseFloat(data.unitPrice) || 0,
        minStock: Math.max(1, parseInt(data.minStock) || 1),
        supplierId: data.supplierId || null
      }
      console.log('Processed stock data:', stockData)
      console.log('Calling onSave function...')
      await onSave(stockData)
      console.log('onSave completed successfully')
    } catch (error) {
      console.error('Error submitting form:', error)
      console.error('Error details:', error.message, error.response?.data)
      // Re-throw the error so it can be handled by the parent component
      throw error
    }
  }

  const allCategories = categories.map(cat => cat.name)

  const handleCategoryChange = (e) => {
    const value = e.target.value
    if (value === '__CREATE_NEW__') {
      setShowCustomCategory(true)
    } else {
      setShowCustomCategory(false)
    }
  }

  const handleAddCustomCategory = async () => {
    const trimmedCategory = customCategory.trim()
    if (!trimmedCategory) {
      return
    }
    
    // Check if category already exists (case-insensitive)
    const categoryExists = allCategories.some(cat => 
      cat.toLowerCase() === trimmedCategory.toLowerCase()
    )
    
    if (categoryExists) {
      alert('This category already exists!')
      return
    }
    
    try {
      // Create category in database via API
      const response = await api.post('/api/categories', {
        name: trimmedCategory
      })
      
      if (response.data.success) {
        const newCategory = response.data.data
        // Add to categories list for immediate display
        setCategories([...categories, newCategory])
        // Set the form value to the new category name
        setValue('category', newCategory.name)
        setCustomCategory('')
        setShowCustomCategory(false)
        alert('Category created successfully!')
      } else {
        alert('Error creating category: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error creating category: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCancelCustomCategory = () => {
    setCustomCategory('')
    setShowCustomCategory(false)
    setValue('category', '')
  }

  const handleEditCategory = async (category) => {
    const newName = prompt(`Edit category name:`, category.name)
    
    if (newName === null) {
      return // User cancelled
    }
    
    if (!newName.trim()) {
      alert('Category name cannot be empty')
      return
    }

    if (newName.trim() === category.name) {
      return // No change
    }

    try {
      const response = await api.put(`/api/categories/${category.id}`, {
        name: newName.trim()
      })

      if (response.data.success) {
        // Update categories list
        setCategories(categories.map(cat => 
          cat.id === category.id ? { ...cat, name: newName.trim() } : cat
        ))
        // Update form value if this was the selected category
        const currentCategory = watch('category')
        if (currentCategory === category.name) {
          setValue('category', newName.trim())
        }
        alert('Category updated successfully!')
      } else {
        alert('Error updating category: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteCategory = async (category) => {
    if (category.name.toLowerCase() === 'other') {
      alert('Cannot delete the "Other" category as it is used as a fallback')
      return
    }

    const confirmMsg = `Are you sure you want to delete "${category.name}"? All products using this category will be moved to "Other".`
    if (!window.confirm(confirmMsg)) {
      return
    }

    try {
      const response = await api.delete(`/api/categories/${category.id}`)

      if (response.data.success) {
        // Remove from categories list
        setCategories(categories.filter(cat => cat.id !== category.id))
        // If this was the selected category, change to Other
        const currentCategory = watch('category')
        if (currentCategory === category.name) {
          setValue('category', 'Other')
        }
        alert(response.data.message)
      } else {
        alert('Error deleting category: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category: ' + (error.response?.data?.message || error.message))
    }
  }

  const allUnits = units.map(u => u.name)
  const allSuppliers = [...(suppliers || []), ...customSuppliers]

  const handleUnitChange = (e) => {
    const value = e.target.value
    if (value === '__CREATE_NEW_UNIT__') {
      setShowCustomUnit(true)
    } else {
      setShowCustomUnit(false)
    }
  }

  const handleAddCustomUnit = async () => {
    const trimmedUnit = customUnit.trim()
    if (!trimmedUnit) {
      return
    }
    
    // Check if unit already exists (case-insensitive)
    const unitExists = allUnits.some(unit => 
      unit.toLowerCase() === trimmedUnit.toLowerCase()
    )
    
    if (unitExists) {
      alert('This unit already exists!')
      return
    }
    
    try {
      // Create unit in database via API
      const response = await api.post('/api/units', {
        name: trimmedUnit
      })
      
      if (response.data.success) {
        const newUnit = response.data.data
        // Add to units list for immediate display
        setUnits([...units, newUnit])
        // Set the form value to the new unit name
        setValue('unit', newUnit.name)
        setCustomUnit('')
        setShowCustomUnit(false)
        alert('Unit created successfully!')
      } else {
        alert('Error creating unit: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error creating unit:', error)
      alert('Error creating unit: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCancelCustomUnit = () => {
    setCustomUnit('')
    setShowCustomUnit(false)
    setValue('unit', 'pcs')
  }

  const handleEditUnit = async (unit) => {
    const newName = prompt(`Edit unit name:`, unit.name)
    
    if (newName === null) {
      return // User cancelled
    }
    
    if (!newName.trim()) {
      alert('Unit name cannot be empty')
      return
    }

    if (newName.trim() === unit.name) {
      return // No change
    }

    try {
      const response = await api.put(`/api/units/${unit.id}`, {
        name: newName.trim()
      })

      if (response.data.success) {
        // Update units list
        setUnits(units.map(u => 
          u.id === unit.id ? { ...u, name: newName.trim() } : u
        ))
        // Update form value if this was the selected unit
        const currentUnit = watch('unit')
        if (currentUnit === unit.name) {
          setValue('unit', newName.trim())
        }
        alert('Unit updated successfully!')
      } else {
        alert('Error updating unit: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error updating unit:', error)
      alert('Error updating unit: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteUnit = async (unit) => {
    if (unit.name.toLowerCase() === 'pcs') {
      alert('Cannot delete the "pcs" unit as it is used as a fallback')
      return
    }

    const confirmMsg = `Are you sure you want to delete "${unit.name}"? All products using this unit will be changed to "pcs".`
    if (!window.confirm(confirmMsg)) {
      return
    }

    try {
      const response = await api.delete(`/api/units/${unit.id}`)

      if (response.data.success) {
        // Remove from units list
        setUnits(units.filter(u => u.id !== unit.id))
        // If this was the selected unit, change to pcs
        const currentUnit = watch('unit')
        if (currentUnit === unit.name) {
          setValue('unit', 'pcs')
        }
        alert(response.data.message)
      } else {
        alert('Error deleting unit: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error deleting unit:', error)
      alert('Error deleting unit: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleSupplierChange = (e) => {
    const value = e.target.value
    if (value === '__CREATE_NEW_SUPPLIER__') {
      setShowCustomSupplier(true)
    } else {
      setShowCustomSupplier(false)
    }
  }

  const handleAddCustomSupplier = async () => {
    const trimmedSupplier = customSupplier.trim()
    if (!trimmedSupplier) {
      return
    }
    
    // Check if supplier already exists (case-insensitive)
    const supplierExists = allSuppliers.some(supplier => 
      supplier.name.toLowerCase() === trimmedSupplier.toLowerCase()
    )
    
    if (supplierExists) {
      alert('This supplier already exists!')
      return
    }
    
    try {
      // Create supplier in database via API
      const response = await api.post('/api/suppliers', {
        name: trimmedSupplier,
        phone: '',
        email: '',
        address: '',
        contactPerson: ''
      })
      
      if (response.data.success) {
        const newSupplier = response.data.data
        // Add to custom suppliers list for immediate display
        const updatedSuppliers = [...customSuppliers, newSupplier]
        setCustomSuppliers(updatedSuppliers)
        // Save to localStorage
        localStorage.setItem('customSuppliers', JSON.stringify(updatedSuppliers))
        // Set the form value to the new supplier's database ID
        setValue('supplierId', newSupplier.id)
        setCustomSupplier('')
        setShowCustomSupplier(false)
        alert('Supplier created successfully!')
      } else {
        alert('Error creating supplier: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      alert('Error creating supplier. Please try again.')
    }
  }

  const handleCancelCustomSupplier = () => {
    setCustomSupplier('')
    setShowCustomSupplier(false)
    setValue('supplierId', '')
  }

  const handleEditSupplier = async (supplier) => {
    const newName = prompt(`Edit supplier name:`, supplier.name)
    
    if (newName === null) {
      return // User cancelled
    }
    
    if (!newName.trim()) {
      alert('Supplier name cannot be empty')
      return
    }

    if (newName.trim() === supplier.name) {
      return // No change
    }

    try {
      const response = await api.put(`/api/suppliers/${supplier.id}`, {
        name: newName.trim(),
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || ''
      })

      if (response.data.success) {
        // Update custom suppliers in state
        setCustomSuppliers(customSuppliers.map(s => 
          s.id === supplier.id ? { ...s, name: newName.trim() } : s
        ))
        // Update localStorage
        const updatedCustomSuppliers = customSuppliers.map(s => 
          s.id === supplier.id ? { ...s, name: newName.trim() } : s
        )
        localStorage.setItem('customSuppliers', JSON.stringify(updatedCustomSuppliers))
        alert('Supplier updated successfully!')
      } else {
        alert('Error updating supplier: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      alert('Error updating supplier: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteSupplier = async (supplier) => {
    const confirmMsg = `Are you sure you want to delete "${supplier.name}"? This will clear the supplier field from all products using it.`
    if (!window.confirm(confirmMsg)) {
      return
    }

    try {
      const response = await api.delete(`/api/suppliers/${supplier.id}`)

      if (response.data.success) {
        // Remove from custom suppliers list
        const updatedCustomSuppliers = customSuppliers.filter(s => s.id !== supplier.id)
        setCustomSuppliers(updatedCustomSuppliers)
        // Update localStorage
        localStorage.setItem('customSuppliers', JSON.stringify(updatedCustomSuppliers))
        // If this was the selected supplier, clear selection
        const currentSupplierId = watch('supplierId')
        if (currentSupplierId === supplier.id) {
          setValue('supplierId', '')
        }
        alert(response.data.message || 'Supplier deleted successfully!')
      } else {
        alert('Error deleting supplier: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Error deleting supplier: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Stock Item' : 'Add New Stock Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => {
          console.log('Form submit event triggered')
          handleSubmit(onSubmit)(e)
        }} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Code */}
            <div>
              <label className="form-label">Product Code *</label>
              <input
                type="text"
                className={`form-input ${errors.productCode ? 'border-red-300' : ''}`}
                placeholder="Enter product code"
                {...register('productCode', {
                  required: 'Product code is required',
                  minLength: {
                    value: 2,
                    message: 'Product code must be at least 2 characters'
                  }
                })}
              />
              {errors.productCode && (
                <p className="form-error">{errors.productCode.message}</p>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className={`form-input ${errors.productName ? 'border-red-300' : ''}`}
                placeholder="Enter product name"
                {...register('productName', {
                  required: 'Product name is required',
                  minLength: {
                    value: 2,
                    message: 'Product name must be at least 2 characters'
                  }
                })}
              />
              {errors.productName && (
                <p className="form-error">{errors.productName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              {showCustomCategory ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="form-input flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomCategory()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!customCategory.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCustomCategory}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    className={`form-input flex-1 ${errors.category ? 'border-red-300' : ''}`}
                    {...register('category', {
                      required: 'Category is required'
                    })}
                    onChange={(e) => {
                      handleCategoryChange(e)
                      register('category').onChange(e)
                    }}
                  >
                    <option value="">Select category</option>
                    {loadingCategories ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      <>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__CREATE_NEW__" className="text-blue-600 bg-blue-50">
                          ➕ Create New Category
                        </option>
                      </>
                    )}
                  </select>
                  {!loadingCategories && categories.find(c => c.name === watch('category')) && watch('category') && watch('category') !== '__CREATE_NEW__' && watch('category').toLowerCase() !== 'other' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditCategory(categories.find(c => c.name === watch('category')))}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-300 rounded-md"
                        title="Edit Category"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(categories.find(c => c.name === watch('category')))}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-md"
                        title="Delete Category"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              )}
              {errors.category && (
                <p className="form-error">{errors.category.message}</p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <label className="form-label">Supplier</label>
              {showCustomSupplier ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSupplier}
                      onChange={(e) => setCustomSupplier(e.target.value)}
                      placeholder="Enter new supplier name"
                      className="form-input flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomSupplier()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSupplier}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!customSupplier.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCustomSupplier}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    className="form-input flex-1"
                    {...register('supplierId')}
                    onChange={(e) => {
                      handleSupplierChange(e)
                      register('supplierId').onChange(e)
                    }}
                  >
                    <option value="">Select supplier (optional)</option>
                    {allSuppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                    {customSuppliers.length > 0 && (
                      <optgroup label="Custom Suppliers">
                        {customSuppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="__CREATE_NEW_SUPPLIER__" className="text-blue-600 bg-blue-50">
                      ➕ Create New Supplier
                    </option>
                  </select>
                  {watch('supplierId') && watch('supplierId') !== '__CREATE_NEW_SUPPLIER__' && watch('supplierId') !== '' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const supplier = allSuppliers.find(s => s.id === watch('supplierId'))
                          if (supplier) handleEditSupplier(supplier)
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-300 rounded-md"
                        title="Edit Supplier"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const supplier = allSuppliers.find(s => s.id === watch('supplierId'))
                          if (supplier) handleDeleteSupplier(supplier)
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-md"
                        title="Delete Supplier"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              rows="3"
              className="form-input"
              placeholder="Enter product description"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="0"
                step="1"
                className={`form-input ${errors.quantity ? 'border-red-300' : ''}`}
                placeholder="0"
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: {
                    value: 0,
                    message: 'Quantity must be 0 or greater'
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Quantity must be a whole number'
                  }
                })}
              />
              {errors.quantity && (
                <p className="form-error">{errors.quantity.message}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="form-label">Unit *</label>
              {showCustomUnit ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      placeholder="Enter new unit name"
                      className="form-input flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomUnit()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomUnit}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!customUnit.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCustomUnit}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    className={`form-input flex-1 ${errors.unit ? 'border-red-300' : ''}`}
                    {...register('unit', {
                      required: 'Unit is required'
                    })}
                    onChange={(e) => {
                      handleUnitChange(e)
                      register('unit').onChange(e)
                    }}
                  >
                    <option value="">Select unit</option>
                    {loadingUnits ? (
                      <option disabled>Loading units...</option>
                    ) : (
                      <>
                        {allUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                        <option value="__CREATE_NEW_UNIT__" className="text-blue-600 bg-blue-50">
                          ➕ Create New Unit
                        </option>
                      </>
                    )}
                  </select>
                  {!loadingUnits && units.find(u => u.name === watch('unit')) && watch('unit') && watch('unit') !== '__CREATE_NEW_UNIT__' && watch('unit').toLowerCase() !== 'pcs' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditUnit(units.find(u => u.name === watch('unit')))}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-300 rounded-md"
                        title="Edit Unit"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(units.find(u => u.name === watch('unit')))}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-md"
                        title="Delete Unit"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              )}
              {errors.unit && (
                <p className="form-error">{errors.unit.message}</p>
              )}
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="form-label">Minimum Stock *</label>
              <input
                type="number"
                min="1"
                step="1"
                className={`form-input ${errors.minStock ? 'border-red-300' : ''}`}
                placeholder="1"
                {...register('minStock', {
                  required: 'Minimum stock is required',
                  min: {
                    value: 1,
                    message: 'Minimum stock must be at least 1'
                  },
                  pattern: {
                    value: /^[1-9][0-9]*$/,
                    message: 'Minimum stock must be a positive whole number'
                  }
                })}
              />
              {errors.minStock && (
                <p className="form-error">{errors.minStock.message}</p>
              )}
            </div>
          </div>

          {/* Unit Price */}
          <div>
            <label className="form-label">Unit Price (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`form-input ${errors.unitPrice ? 'border-red-300' : ''}`}
              placeholder="0.00"
              {...register('unitPrice', {
                required: 'Unit price is required',
                min: {
                  value: 0,
                  message: 'Unit price must be 0 or greater'
                }
              })}
            />
            {errors.unitPrice && (
              <p className="form-error">{errors.unitPrice.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Stock' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockModal