'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Filter, Users as UsersIcon, Calendar as CalendarIcon } from 'lucide-react'
import { employeeAPI, attendanceAPI, type Employee, type AttendanceWithEmployee } from '@/lib/api'
import toast from 'react-hot-toast'

// Component imports
import { EnhancedDashboard } from '@/components/dashboard/EnhancedDashboard'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { AttendanceForm } from '@/components/attendance/AttendanceForm'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { AttendanceFilter } from '@/components/attendance/AttendanceFilter'
import { TableSkeleton } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'

export default function DashboardPage() {
  const router = useRouter()
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceWithEmployee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showAttendanceFilter, setShowAttendanceFilter] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  // Active section
  const [activeSection, setActiveSection] = useState<'dashboard' | 'employees' | 'attendance'>('dashboard')

  // Load data on mount
  useEffect(() => {
    loadEmployees()
    loadAttendance()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      setError(null)
      const data = await employeeAPI.getAll()
      setEmployees(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load employees'
      setError(message)
      toast.error('Failed to load employees')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const loadAttendance = async () => {
    try {
      setLoadingAttendance(true)
      const data = await attendanceAPI.getAll()
      setAttendance(data)
    } catch {
      toast.error('Failed to load attendance records')
    } finally {
      setLoadingAttendance(false)
    }
  }

  const handleFilterAttendance = async (params: Record<string, string>) => {
    try {
      setLoadingAttendance(true)
      const data = Object.keys(params).length > 0 
        ? await attendanceAPI.filter(params)
        : await attendanceAPI.getAll()
      setAttendance(data)
      toast.success('Filters applied successfully')
    } catch {
      toast.error('Failed to filter attendance')
    } finally {
      setLoadingAttendance(false)
    }
  }

  const handleViewAttendance = (employee: Employee) => {
    setSelectedEmployee(employee)
    setActiveSection('attendance')
    handleFilterAttendance({ employee_id: employee.id })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                HRMS Lite Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeSection === 'dashboard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveSection('employees')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeSection === 'employees'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Employees
                </button>
                <button
                  onClick={() => setActiveSection('attendance')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeSection === 'attendance'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <EnhancedDashboard />
          </div>
        )}

        {/* Employees Section */}
        {activeSection === 'employees' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {employees.length} total
                </span>
              </div>
              <button
                onClick={() => setShowEmployeeForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingEmployees ? (
                <div className="p-6">
                  <TableSkeleton rows={5} cols={6} />
                </div>
              ) : error ? (
                <ErrorState message={error} onRetry={loadEmployees} />
              ) : employees.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="No employees yet"
                  description="Get started by adding your first employee to the system"
                  action={{
                    label: 'Add Employee',
                    onClick: () => setShowEmployeeForm(true),
                  }}
                />
              ) : (
                <EmployeeTable
                  employees={employees}
                  onUpdate={loadEmployees}
                  onViewAttendance={handleViewAttendance}
                />
              )}
            </div>
          </div>
        )}

        {/* Attendance Section */}
        {activeSection === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {attendance.length} records
                </span>
                {selectedEmployee && (
                  <span className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    Showing: {selectedEmployee.full_name}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAttendanceFilter(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployee(null)
                    setShowAttendanceForm(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Mark Attendance</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingAttendance ? (
                <div className="p-6">
                  <TableSkeleton rows={5} cols={5} />
                </div>
              ) : attendance.length === 0 ? (
                <EmptyState
                  icon="calendar"
                  title="No attendance records"
                  description="Start marking attendance for your employees"
                  action={{
                    label: 'Mark Attendance',
                    onClick: () => setShowAttendanceForm(true),
                  }}
                />
              ) : (
                <AttendanceTable attendance={attendance} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showEmployeeForm && (
        <EmployeeForm
          onSuccess={() => {
            setShowEmployeeForm(false)
            loadEmployees()
          }}
          onCancel={() => setShowEmployeeForm(false)}
        />
      )}

      {showAttendanceForm && (
        <AttendanceForm
          employees={employees}
          selectedEmployee={selectedEmployee}
          onSuccess={() => {
            setShowAttendanceForm(false)
            loadAttendance()
            setSelectedEmployee(null)
          }}
          onCancel={() => {
            setShowAttendanceForm(false)
            setSelectedEmployee(null)
          }}
        />
      )}

      {showAttendanceFilter && (
        <AttendanceFilter
          onFilter={handleFilterAttendance}
          onClose={() => setShowAttendanceFilter(false)}
          employees={employees}
        />
      )}
    </div>
  )
}
