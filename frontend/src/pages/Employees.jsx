import React from 'react'
import UserManagement from '../components/UserManagement'

// Reuse the full UserManagement component for the Employees page so the
// sidebar Employees route shows the complete user list and the Add button
// (with modal) is enabled.
const Employees = () => {
  return (
    <div className="p-0">
      <UserManagement />
    </div>
  )
}

export default Employees