'use client'

import React, { useState } from 'react'
import { X, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface AttendanceFilterProps {
  onFilter: (params: {
    date?: string
    start_date?: string
    end_date?: string
    employee_id?: string
    status?: 'present' | 'absent'
  }) => void
  onClose: () => void
  employees?: Array<{ id: string; employee_id: string; full_name: string }>
}

export const AttendanceFilter = ({ onFilter, onClose, employees = [] }: AttendanceFilterProps) => {
  const [filterType, setFilterType] = useState<'single' | 'range'>('single')
  const [filters, setFilters] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start_date: '',
    end_date: '',
    employee_id: '',
    status: '' as '' | 'present' | 'absent',
  })

  const handleApply = () => {
    const params: {
      date?: string
      start_date?: string
      end_date?: string
      employee_id?: string
      status?: 'present' | 'absent'
    } = {}

    if (filterType === 'single' && filters.date) {
      params.date = filters.date
    } else if (filterType === 'range') {
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
    }

    if (filters.employee_id) params.employee_id = filters.employee_id
    if (filters.status) params.status = filters.status

    onFilter(params)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      date: format(new Date(), 'yyyy-MM-dd'),
      start_date: '',
      end_date: '',
      employee_id: '',
      status: '',
    })
    onFilter({})
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filter Attendance</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Date Filter Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFilterType('single')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  filterType === 'single'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setFilterType('range')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  filterType === 'range'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                Date Range
              </button>
            </div>
          </div>

          {/* Single Date */}
          {filterType === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>
          )}

          {/* Date Range */}
          {filterType === 'range' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  min={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
            </>
          )}

          {/* Employee Filter */}
          {employees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee (Optional)
              </label>
              <select
                value={filters.employee_id}
                onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status (Optional)
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as '' | 'present' | 'absent' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceFilter
