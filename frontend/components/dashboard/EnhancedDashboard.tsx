'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Calendar, TrendingUp, Activity, 
  BarChart3, PieChart, Target, Zap, RefreshCw 
} from 'lucide-react'
import { 
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { type DashboardMetrics, dashboardAPI } from '@/lib/api'
import axios from 'axios'
import { format } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface TrendData {
  date: string
  present: number
  absent: number
}

interface DeptData {
  department: string
  employee_count: number
}

interface MonthlyData {
  month: string
  total_attendance: number
  present: number
  absent: number
}

export const EnhancedDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [attendanceTrends, setAttendanceTrends] = useState<TrendData[]>([])
  const [departmentStats, setDepartmentStats] = useState<DeptData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadAllData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAllData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      const [metricsRes, trendsRes, deptRes, monthlyRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        axios.get(`${apiUrl}/api/analytics/attendance-trends`),
        axios.get(`${apiUrl}/api/analytics/department-stats`),
        axios.get(`${apiUrl}/api/analytics/monthly-attendance`)
      ])
      
      setMetrics(metricsRes)
      setAttendanceTrends(trendsRes.data.map((d: { date: string; present: number; absent: number }) => ({
        ...d,
        date: format(new Date(d.date), 'MMM dd')
      })))
      setDepartmentStats(deptRes.data)
      setMonthlyData(monthlyRes.data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-8 w-8 text-primary-600" />
        </motion.div>
      </div>
    )
  }

  if (!metrics) return null

  const stats = [
    {
      label: 'Total Employees',
      value: metrics.total_employees,
      change: '+12%',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Records',
      value: metrics.total_attendance_records,
      change: '+8%',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Today Present',
      value: metrics.today_present,
      change: `${metrics.today_present > 0 ? ((metrics.today_present / (metrics.today_present + metrics.today_absent)) * 100).toFixed(0) : 0}%`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Absent',
      value: metrics.total_absent,
      change: `${metrics.total_absent > 0 && metrics.total_attendance_records > 0 ? ((metrics.total_absent / metrics.total_attendance_records) * 100).toFixed(0) : 0}%`,
      icon: Activity,
      gradient: 'from-red-500 to-rose-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time HR analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAllData}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Animated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden bg-white rounded-2xl shadow-lg p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary-600" />
                7-Day Attendance Trends
              </h3>
              <p className="text-sm text-gray-600 mt-1">Daily present vs absent tracking</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrends}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary-600" />
                Department Distribution
              </h3>
              <p className="text-sm text-gray-600 mt-1">Employee count by department</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, count }) => `${department}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {departmentStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Attendance Rate Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg p-6 text-white lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8" />
            <Zap className="h-6 w-6 opacity-75" />
          </div>
          <p className="text-primary-100 text-sm font-medium mb-2">Overall Attendance Rate</p>
          <div className="flex items-end space-x-2 mb-4">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-6xl font-bold"
            >
              {metrics.overall_attendance_rate.toFixed(0)}
            </motion.p>
            <span className="text-3xl font-semibold mb-2">%</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.overall_attendance_rate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-white h-full rounded-full"
            />
          </div>
          <p className="text-primary-100 text-xs mt-3">Across all employees and records</p>
        </motion.div>

        {/* Monthly Weekly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                Monthly Attendance Rate
              </h3>
              <p className="text-sm text-gray-600 mt-1">Week-by-week breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="rate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Employees with Animation */}
      {metrics.recent_employees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Recently Added Employees
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.recent_employees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-xl h-14 w-14 rounded-full flex items-center justify-center shadow-lg">
                    {employee.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{employee.full_name}</p>
                    <p className="text-xs text-gray-600 truncate">{employee.employee_id}</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                    {employee.department}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default EnhancedDashboard
