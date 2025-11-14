import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import CustomerModal from '../components/CustomerModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Customers = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/customers')
      // Backend returns { success: true, data: customers[] }
      const customersData = response.data?.data || response.data || []
      // Ensure customersData is an array
      const safeCustomersData = Array.isArray(customersData) ? customersData : []
      setCustomers(safeCustomersData)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
      setCustomers([]) // Ensure customers is always an array
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setShowModal(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowModal(true)
  }

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/customers/${customerToDelete.id}`)
      toast.success('Customer deleted successfully')
      // Refresh the entire customer list to ensure data consistency
      await fetchCustomers()
      setShowDeleteDialog(false)
      setCustomerToDelete(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
      setShowDeleteDialog(false)
      setCustomerToDelete(null)
    }
  }

  const handleCustomerSave = async (customerData) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        await api.put(`/api/customers/${selectedCustomer.id}`, customerData)
        toast.success('Customer updated successfully')
        // Refresh the entire customer list to get updated bills data
        await fetchCustomers()
      } else {
        // Add new customer
        await api.post('/api/customers', customerData)
        toast.success('Customer added successfully')
        // Refresh the entire customer list to get the new customer with bills data
        await fetchCustomers()
      }
      setShowModal(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Failed to save customer')
    }
  }

  // Filter customers based on search term
  const safeCustomers = Array.isArray(customers) ? customers : []
  const filteredCustomers = safeCustomers.filter(customer =>
    customer && customer.name && 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer database and contact information
          </p>
        </div>
        
        <button
          onClick={handleAddCustomer}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No customers found' : 'No customers added yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddCustomer}
                  className="btn-primary mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Customer
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {customer.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {customer.phone}
                      </div>
                      
                      {customer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {customer.email}
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                          <span className="line-clamp-2">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Customer Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {customer.Bills?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Bills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(customer.Bills?.reduce((sum, bill) => sum + bill.totalAmount, 0) || 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit Customer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {/* Only show delete button for Admin users */}
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDeleteCustomer(customer)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onSave={handleCustomerSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog - Only for Admin users */}
      {user?.role === 'Admin' && showDeleteDialog && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone. All bills associated with this customer will be converted to "Walk-in Customer" to preserve sales records.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}
    </div>
  )
}

export default Customers