import axios, { AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as { detail?: string; error?: string }
      throw new Error(data?.detail || data?.error || 'An error occurred')
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// ==================== TYPES ====================

export interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  department: string
  created_at: string
  updated_at: string
}

export interface EmployeeCreate {
  employee_id: string
  full_name: string
  email: string
  department: string
}

export interface Attendance {
  id: string
  employee_id: string
  attendance_date: string
  status: 'present' | 'absent'
  created_at: string
}

export interface AttendanceWithEmployee extends Attendance {
  employee_name: string
  employee_code: string
  department: string
}

export interface AttendanceCreate {
  employee_id: string
  attendance_date: string
  status: 'present' | 'absent'
}

export interface AttendanceSummary {
  employee_id: string
  employee_name: string
  employee_code: string
  department: string
  total_days: number
  present_days: number
  absent_days: number
  attendance_rate: number
}

export interface DashboardMetrics {
  total_employees: number
  total_attendance_records: number
  today_present: number
  today_absent: number
  total_absent: number
  overall_attendance_rate: number
  recent_employees: Employee[]
}

// ==================== API FUNCTIONS ====================

// Employee APIs
export const employeeAPI = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/api/employees')
    return response.data
  },

  // Get single employee
  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/api/employees/${id}`)
    return response.data
  },

  // Create employee
  create: async (data: EmployeeCreate): Promise<Employee> => {
    const response = await apiClient.post('/api/employees', data)
    return response.data
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/employees/${id}`)
  },

  // Get attendance summary for employee
  getAttendanceSummary: async (id: string): Promise<AttendanceSummary> => {
    const response = await apiClient.get(`/api/employees/${id}/attendance-summary`)
    return response.data
  },
}

// Attendance APIs
export const attendanceAPI = {
  // Get all attendance records
  getAll: async (employeeId?: string): Promise<AttendanceWithEmployee[]> => {
    const params = employeeId ? { employee_id: employeeId } : {}
    const response = await apiClient.get('/api/attendance', { params })
    return response.data
  },

  // Mark attendance
  create: async (data: AttendanceCreate): Promise<Attendance> => {
    const response = await apiClient.post('/api/attendance', data)
    return response.data
  },

  // Update attendance
  update: async (id: string, status: 'present' | 'absent'): Promise<Attendance> => {
    const response = await apiClient.put(`/api/attendance/${id}`, { status })
    return response.data
  },

  // Delete attendance
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/attendance/${id}`)
  },

  // Filter attendance
  filter: async (params: {
    date?: string
    start_date?: string
    end_date?: string
    employee_id?: string
    status?: 'present' | 'absent'
  }): Promise<AttendanceWithEmployee[]> => {
    const response = await apiClient.get('/api/attendance/filter', { params })
    return response.data
  },
}

// Dashboard API
export const dashboardAPI = {
  // Get dashboard metrics
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/api/dashboard')
    return response.data
  },
}

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health')
    return response.data.status === 'healthy'
  } catch {
    return false
  }
}

export default apiClient
