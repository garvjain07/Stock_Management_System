import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Truck, 
  Phone,
  Mail,
  MapPin,
  Package
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import SupplierModal from '../components/SupplierModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Suppliers = () => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/suppliers')
      setSuppliers(response.data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSupplier = () => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can add suppliers')
      return
    }
    setSelectedSupplier(null)
    setShowModal(true)
  }

  const handleEditSupplier = (supplier) => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can edit suppliers')
      return
    }
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  const handleDeleteSupplier = (supplier) => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can delete suppliers')
      return
    }
    setSupplierToDelete(supplier)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/suppliers/${supplierToDelete.id}`)
      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id))
      toast.success('Supplier deleted successfully')
      setShowDeleteDialog(false)
      setSupplierToDelete(null)
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    }
  }

  const handleSupplierSave = async (supplierData) => {
    try {
      if (selectedSupplier) {
        // Update existing supplier
        const response = await api.put(`/api/suppliers/${selectedSupplier.id}`, supplierData)
        setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? response.data : s))
        toast.success('Supplier updated successfully')
      } else {
        // Add new supplier
        const response = await api.post('/api/suppliers', supplierData)
        setSuppliers([response.data, ...suppliers])
        toast.success('Supplier added successfully')
      }
      setShowModal(false)
      setSelectedSupplier(null)
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Failed to save supplier')
    }
  }

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your supplier database and contact information
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={handleAddSupplier}
            className="btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
            <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact person, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No suppliers found' : 'No suppliers added yet'}
              </p>
              {!searchTerm && user?.role === 'admin' && (
                <button
                  onClick={handleAddSupplier}
                  className="btn-primary mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Supplier
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Contact: {supplier.contactPerson}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {supplier.phone}
                      </div>
                      
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {supplier.email}
                        </div>
                      )}
                      
                      {supplier.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                          <span className="line-clamp-2">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Supplier Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400 mr-1" />
                        <p className="text-lg font-bold text-gray-900">
                          {supplier.Stock?.length || 0}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">Products Supplied</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                {user?.role === 'admin' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSupplier(supplier)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Modal */}
      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onSave={handleSupplierSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Supplier"
          message={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone and will remove the supplier reference from all associated products.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}
    </div>
  )
}

export default Suppliers