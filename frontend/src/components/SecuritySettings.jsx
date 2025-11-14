import React, { useState, useEffect } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

const STORAGE_KEY = 'security_settings_v1'

const defaultSettings = {
  requireStrongPassword: true,
  minPasswordLength: 8,
  enableMfa: false,
  sessionTimeoutMinutes: 60
}

const SecuritySettings = () => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved security settings', e)
      }
    }
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setLoading(true)
    try {
      // In absence of a backend endpoint, persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      toast.success('Security settings saved')
    } catch (e) {
      console.error('Failed to save settings', e)
      toast.error('Failed to save security settings')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    toast.success('Settings reset to defaults')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-gray-600 mt-1">Configure password policy, session timeout, and multi-factor options.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Require strong passwords</h3>
              <p className="text-sm text-gray-500">Enforce uppercase, lowercase, and numeric characters.</p>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" checked={settings.requireStrongPassword} onChange={e => handleChange('requireStrongPassword', e.target.checked)} className="mr-2" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Minimum password length</h3>
              <p className="text-sm text-gray-500">Users must choose a password at least this many characters long.</p>
            </div>
            <div>
              <input type="number" min={6} max={128} value={settings.minPasswordLength} onChange={e => handleChange('minPasswordLength', Math.max(6, Number(e.target.value || 6)))} className="w-20 px-2 py-1 border rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Multi-Factor Authentication (MFA)</h3>
              <p className="text-sm text-gray-500">Require users to set up MFA during login.</p>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" checked={settings.enableMfa} onChange={e => handleChange('enableMfa', e.target.checked)} className="mr-2" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Session timeout (minutes)</h3>
              <p className="text-sm text-gray-500">Automatically log out inactive sessions after this period.</p>
            </div>
            <div>
              <input type="number" min={5} max={1440} value={settings.sessionTimeoutMinutes} onChange={e => handleChange('sessionTimeoutMinutes', Math.max(5, Number(e.target.value || 5)))} className="w-28 px-2 py-1 border rounded" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={handleReset} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Reset</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{loading ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings
