'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { attendanceAPI, type AttendanceCreate, type Employee } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface AttendanceFormProps {
  employees: Employee[]
  selectedEmployee?: Employee | null
  onSuccess: () => void
  onCancel: () => void
}

export const AttendanceForm = ({ employees, selectedEmployee, onSuccess, onCancel }: AttendanceFormProps) => {
  const [formData, setFormData] = useState<AttendanceCreate>({
    employee_id: selectedEmployee?.id || '',
    attendance_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (selectedEmployee) {
      setFormData(prev => ({ ...prev, employee_id: selectedEmployee.id }))
    }
  }, [selectedEmployee])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee'
    }

    if (!formData.attendance_date) {
      newErrors.attendance_date = 'Date is required'
    } else if (new Date(formData.attendance_date) > new Date()) {
      newErrors.attendance_date = 'Cannot mark attendance for future dates'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await attendanceAPI.create(formData)
      toast.success('Attendance marked successfully!')
      onSuccess()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark attendance'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.employee_id}
              onChange={(e) => {
                setFormData({ ...formData, employee_id: e.target.value })
                setErrors({ ...errors, employee_id: '' })
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || !!selectedEmployee}
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} - {emp.full_name}
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.attendance_date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => {
                setFormData({ ...formData, attendance_date: e.target.value })
                setErrors({ ...errors, attendance_date: '' })
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 ${
                errors.attendance_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.attendance_date && (
              <p className="text-red-500 text-xs mt-1">{errors.attendance_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'present' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === 'present'
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-green-300'
                }`}
                disabled={loading}
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'absent' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === 'absent'
                    ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-red-300'
                }`}
                disabled={loading}
              >
                Absent
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AttendanceForm
