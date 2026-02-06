from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from uuid import UUID
from models.schemas import (
    EmployeeCreate, EmployeeResponse, EmployeeUpdate,
    SuccessResponse, EmployeeAttendanceSummary
)
from database.connection import db
import asyncpg

router = APIRouter(prefix="/api/employees", tags=["employees"])

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """
    Create a new employee
    
    - **employee_id**: Unique employee identifier
    - **full_name**: Employee's full name
    - **email**: Valid email address
    - **department**: Department name
    """
    try:
        query = """
            INSERT INTO employees (employee_id, full_name, email, department)
            VALUES ($1, $2, $3, $4)
            RETURNING id, employee_id, full_name, email, department, created_at, updated_at
        """
        row = await db.fetchrow(
            query,
            employee.employee_id,
            employee.full_name,
            employee.email,
            employee.department
        )
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create employee"
            )
        
        return EmployeeResponse(**dict(row))
    
    except asyncpg.UniqueViolationError as e:
        error_msg = str(e)
        if "employee_id" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee ID '{employee.employee_id}' already exists"
            )
        elif "email" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{employee.email}' is already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate entry detected"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )

@router.get("", response_model=List[EmployeeResponse])
async def get_all_employees():
    """
    Get all employees
    
    Returns a list of all employees in the system
    """
    try:
        query = """
            SELECT id, employee_id, full_name, email, department, created_at, updated_at
            FROM employees
            ORDER BY created_at DESC
        """
        rows = await db.fetch(query)
        return [EmployeeResponse(**dict(row)) for row in rows]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employees: {str(e)}"
        )

@router.get("/{employee_uuid}", response_model=EmployeeResponse)
async def get_employee(employee_uuid: UUID):
    """
    Get a single employee by UUID
    
    - **employee_uuid**: Employee's UUID
    """
    try:
        query = """
            SELECT id, employee_id, full_name, email, department, created_at, updated_at
            FROM employees
            WHERE id = $1
        """
        row = await db.fetchrow(query, employee_uuid)
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        return EmployeeResponse(**dict(row))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employee: {str(e)}"
        )

@router.delete("/{employee_uuid}", response_model=SuccessResponse)
async def delete_employee(employee_uuid: UUID):
    """
    Delete an employee
    
    - **employee_uuid**: Employee's UUID
    
    Note: This will also delete all attendance records for this employee (CASCADE)
    """
    try:
        # Check if employee exists
        check_query = "SELECT id FROM employees WHERE id = $1"
        exists = await db.fetchrow(check_query, employee_uuid)
        
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        # Delete employee (attendance records will be deleted via CASCADE)
        delete_query = "DELETE FROM employees WHERE id = $1"
        await db.execute(delete_query, employee_uuid)
        
        return SuccessResponse(
            success=True,
            message="Employee deleted successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employee: {str(e)}"
        )

@router.get("/{employee_uuid}/attendance-summary", response_model=EmployeeAttendanceSummary)
async def get_employee_attendance_summary(employee_uuid: UUID):
    """
    Get attendance summary for a specific employee
    
    - **employee_uuid**: Employee's UUID
    
    Returns total days, present days, absent days, and attendance rate
    """
    try:
        query = """
            SELECT 
                e.id as employee_id,
                e.full_name as employee_name,
                e.employee_id as employee_code,
                e.department,
                COUNT(a.id) as total_days,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
                CASE 
                    WHEN COUNT(a.id) > 0 THEN 
                        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END)::NUMERIC / COUNT(a.id)::NUMERIC * 100), 2)
                    ELSE 0
                END as attendance_rate
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id
            WHERE e.id = $1
            GROUP BY e.id, e.full_name, e.employee_id, e.department
        """
        
        row = await db.fetchrow(query, employee_uuid)
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        return EmployeeAttendanceSummary(**dict(row))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance summary: {str(e)}"
        )
