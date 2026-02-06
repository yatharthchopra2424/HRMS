-- HRMS Lite Database Schema
-- PostgreSQL Schema for Supabase

-- ==================== EXTENSIONS ====================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================
-- Create attendance status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('present', 'absent');
    END IF;
END $$;

-- ==================== TABLES ====================

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT employee_id_not_empty CHECK (length(trim(employee_id)) > 0),
    CONSTRAINT full_name_not_empty CHECK (length(trim(full_name)) > 0),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT department_not_empty CHECK (length(trim(department)) > 0)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    status attendance_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key
    CONSTRAINT fk_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,
    
    -- Unique constraint: one attendance record per employee per day
    CONSTRAINT unique_employee_date UNIQUE (employee_id, attendance_date),
    
    -- Check constraint: attendance date cannot be in future
    CONSTRAINT attendance_date_not_future CHECK (attendance_date <= CURRENT_DATE)
);

-- ==================== INDEXES ====================

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date DESC);

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on employees" ON employees;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON attendance;

-- Create permissive policies for admin access (no authentication required as per requirements)
-- These policies allow all operations since there's a single admin user with no auth

-- Employees policies
CREATE POLICY "Allow all operations on employees"
    ON employees
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Attendance policies
CREATE POLICY "Allow all operations on attendance"
    ON attendance
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ==================== SAMPLE DATA (Optional - Remove in production) ====================

-- Uncomment below to insert sample data for testing

/*
-- Insert sample employees
INSERT INTO employees (employee_id, full_name, email, department) VALUES
    ('EMP001', 'John Doe', 'john.doe@company.com', 'Engineering'),
    ('EMP002', 'Jane Smith', 'jane.smith@company.com', 'Human Resources'),
    ('EMP003', 'Mike Johnson', 'mike.johnson@company.com', 'Marketing'),
    ('EMP004', 'Sarah Williams', 'sarah.williams@company.com', 'Engineering'),
    ('EMP005', 'David Brown', 'david.brown@company.com', 'Finance')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample attendance records
INSERT INTO attendance (employee_id, attendance_date, status)
SELECT 
    e.id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    CASE WHEN random() > 0.2 THEN 'present'::attendance_status ELSE 'absent'::attendance_status END
FROM employees e
CROSS JOIN generate_series(0, 30) AS n
ON CONFLICT (employee_id, attendance_date) DO NOTHING;
*/

-- ==================== VERIFICATION QUERIES ====================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employees', 'attendance');

-- Verify indexes created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('employees', 'attendance');

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('employees', 'attendance');

-- Display table structures
\d employees
\d attendance
