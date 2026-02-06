'use client'

import React, { useState } from 'react'
import { Trash2, TrendingUp } from 'lucide-react'
import { type Employee, employeeAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface EmployeeTableProps {
  employees: Employee[]
  onUpdate: () => void
  onViewAttendance: (employee: Employee) => void
}

export const EmployeeTable = ({ employees, onUpdate, onViewAttendance }: EmployeeTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all attendance records for this employee.`)) {
      return
    }

    setDeletingId(id)
    try {
      await employeeAPI.delete(id)
      toast.success('Employee deleted successfully')
      onUpdate()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete employee'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {employee.employee_id}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{employee.full_name}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{employee.email}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {employee.department}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {format(new Date(employee.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewAttendance(employee)}
                    className="text-primary-600 hover:text-primary-900 transition-colors p-2 hover:bg-primary-50 rounded-lg"
                    title="View Attendance"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id, employee.full_name)}
                    disabled={deletingId === employee.id}
                    className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete Employee"
                  >
                    {deletingId === employee.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeTable
