-- Sample Data for HRMS Lite
-- This file contains sample employee and attendance records for testing

-- Insert 10 sample employees
INSERT INTO employees (id, employee_id, full_name, email, department) VALUES
(gen_random_uuid(), 'EMP001', 'Sarah Johnson', 'sarah.johnson@company.com', 'Engineering'),
(gen_random_uuid(), 'EMP002', 'Michael Chen', 'michael.chen@company.com', 'Engineering'),
(gen_random_uuid(), 'EMP003', 'Emily Rodriguez', 'emily.rodriguez@company.com', 'HR'),
(gen_random_uuid(), 'EMP004', 'James Wilson', 'james.wilson@company.com', 'Sales'),
(gen_random_uuid(), 'EMP005', 'Priya Sharma', 'priya.sharma@company.com', 'Marketing'),
(gen_random_uuid(), 'EMP006', 'David Brown', 'david.brown@company.com', 'Engineering'),
(gen_random_uuid(), 'EMP007', 'Lisa Anderson', 'lisa.anderson@company.com', 'Finance'),
(gen_random_uuid(), 'EMP008', 'Robert Taylor', 'robert.taylor@company.com', 'Sales'),
(gen_random_uuid(), 'EMP009', 'Maria Garcia', 'maria.garcia@company.com', 'HR'),
(gen_random_uuid(), 'EMP010', 'Kevin Lee', 'kevin.lee@company.com', 'Engineering');

-- Insert sample attendance records for the past week
-- Note: Using 'present' and 'absent' status values (lowercase as per schema)

-- Attendance for January 31, 2026 (6 days ago)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-01-31', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP005', 'EMP006', 'EMP008', 'EMP009', 'EMP010');

INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-01-31', 'absent'
FROM employees WHERE employee_id IN ('EMP004', 'EMP007');

-- Attendance for February 1, 2026 (5 days ago)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-01', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP010');

INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-01', 'absent'
FROM employees WHERE employee_id IN ('EMP003', 'EMP009');

-- Attendance for February 3, 2026 (3 days ago)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-03', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP009', 'EMP010');

INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-03', 'absent'
FROM employees WHERE employee_id = 'EMP008';

-- Attendance for February 4, 2026 (2 days ago)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-04', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP008', 'EMP009', 'EMP010');

INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-04', 'absent'
FROM employees WHERE employee_id = 'EMP007';

-- Attendance for February 5, 2026 (yesterday)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-05', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010');

-- Attendance for February 6, 2026 (today)
INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-06', 'present'
FROM employees WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010');

INSERT INTO attendance (id, employee_id, attendance_date, status)
SELECT gen_random_uuid(), id, '2026-02-06', 'absent'
FROM employees WHERE employee_id = 'EMP004';

-- Verify the data
SELECT 'Total Employees Inserted:' as info, COUNT(*) as count FROM employees;
SELECT 'Total Attendance Records Inserted:' as info, COUNT(*) as count FROM attendance;
SELECT 
    'Attendance Summary:' as info,
    status,
    COUNT(*) as count
FROM attendance 
GROUP BY status 
ORDER BY status;
