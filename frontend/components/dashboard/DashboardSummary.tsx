'use client'

import React, { useEffect, useState } from 'react'
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react'
import { type DashboardMetrics, dashboardAPI } from '@/lib/api'
import { LoadingState } from '../ui/LoadingState'
import { ErrorState } from '../ui/ErrorState'

export const DashboardSummary = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardAPI.getMetrics()
      setMetrics(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard metrics'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading dashboard metrics..." />
  }

  if (error || !metrics) {
    return <ErrorState message={error || 'No data available'} onRetry={loadMetrics} />
  }

  const stats = [
    {
      label: 'Total Employees',
      value: metrics.total_employees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Attendance Records',
      value: metrics.total_attendance_records,
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Today Present',
      value: metrics.today_present,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Today Absent',
      value: metrics.today_absent,
      icon: Clock,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Attendance Rate */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">
              Overall Attendance Rate
            </p>
            <p className="text-4xl font-bold">
              {metrics.overall_attendance_rate.toFixed(1)}%
            </p>
            <p className="text-primary-100 text-sm mt-2">
              Across all employees and records
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <TrendingUp className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      {metrics.recent_employees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Added Employees
          </h3>
          <div className="space-y-3">
            {metrics.recent_employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 text-primary-700 font-semibold text-sm h-10 w-10 rounded-full flex items-center justify-center">
                    {employee.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.full_name}</p>
                    <p className="text-sm text-gray-600">{employee.employee_id}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {employee.department}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardSummary
