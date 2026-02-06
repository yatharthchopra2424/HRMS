from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import date
from models.schemas import (
    AttendanceCreate, AttendanceResponse, AttendanceUpdate,
    AttendanceWithEmployee, SuccessResponse
)
from database.connection import db
import asyncpg

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """
    Mark attendance for an employee
    
    - **employee_id**: Employee's UUID
    - **attendance_date**: Date of attendance (cannot be in future)
    - **status**: 'present' or 'absent'
    
    Note: Only one attendance record per employee per day is allowed
    """
    try:
        # Check if employee exists
        employee_check = "SELECT id FROM employees WHERE id = $1"
        employee_exists = await db.fetchrow(employee_check, attendance.employee_id)
        
        if not employee_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {attendance.employee_id} not found"
            )
        
        # Insert attendance record
        query = """
            INSERT INTO attendance (employee_id, attendance_date, status)
            VALUES ($1, $2, $3)
            RETURNING id, employee_id, attendance_date, status, created_at
        """
        row = await db.fetchrow(
            query,
            attendance.employee_id,
            attendance.attendance_date,
            attendance.status
        )
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create attendance record"
            )
        
        return AttendanceResponse(**dict(row))
    
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for this employee on {attendance.attendance_date}"
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking attendance: {str(e)}"
        )

@router.get("", response_model=List[AttendanceWithEmployee])
async def get_attendance_records(
    employee_id: Optional[UUID] = Query(None, description="Filter by employee UUID")
):
    """
    Get attendance records with employee details
    
    - **employee_id**: Optional - filter by specific employee
    """
    try:
        if employee_id:
            query = """
                SELECT 
                    a.id,
                    a.employee_id,
                    e.full_name as employee_name,
                    e.employee_id as employee_code,
                    e.department,
                    a.attendance_date,
                    a.status,
                    a.created_at
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                WHERE a.employee_id = $1
                ORDER BY a.attendance_date DESC
            """
            rows = await db.fetch(query, employee_id)
        else:
            query = """
                SELECT 
                    a.id,
                    a.employee_id,
                    e.full_name as employee_name,
                    e.employee_id as employee_code,
                    e.department,
                    a.attendance_date,
                    a.status,
                    a.created_at
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                ORDER BY a.attendance_date DESC
            """
            rows = await db.fetch(query)
        
        return [AttendanceWithEmployee(**dict(row)) for row in rows]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance records: {str(e)}"
        )

@router.get("/filter", response_model=List[AttendanceWithEmployee])
async def filter_attendance(
    date: Optional[date] = Query(None, description="Filter by specific date"),
    start_date: Optional[date] = Query(None, description="Filter by date range - start date"),
    end_date: Optional[date] = Query(None, description="Filter by date range - end date"),
    employee_id: Optional[UUID] = Query(None, description="Filter by employee UUID"),
    status: Optional[str] = Query(None, description="Filter by status: 'present' or 'absent'")
):
    """
    Filter attendance records by date, date range, employee, or status
    
    - **date**: Filter by specific date (single date)
    - **start_date & end_date**: Filter by date range
    - **employee_id**: Filter by employee UUID
    - **status**: Filter by attendance status
    
    Note: If both 'date' and date range are provided, 'date' takes precedence
    """
    try:
        conditions = []
        params = []
        param_count = 0
        
        base_query = """
            SELECT 
                a.id,
                a.employee_id,
                e.full_name as employee_name,
                e.employee_id as employee_code,
                e.department,
                a.attendance_date,
                a.status,
                a.created_at
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
        """
        
        # Single date filter (takes precedence)
        if date:
            param_count += 1
            conditions.append(f"a.attendance_date = ${param_count}")
            params.append(date)
        # Date range filter
        elif start_date or end_date:
            if start_date:
                param_count += 1
                conditions.append(f"a.attendance_date >= ${param_count}")
                params.append(start_date)
            if end_date:
                param_count += 1
                conditions.append(f"a.attendance_date <= ${param_count}")
                params.append(end_date)
        
        # Employee filter
        if employee_id:
            param_count += 1
            conditions.append(f"a.employee_id = ${param_count}")
            params.append(employee_id)
        
        # Status filter
        if status:
            if status not in ['present', 'absent']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Status must be 'present' or 'absent'"
                )
            param_count += 1
            conditions.append(f"a.status = ${param_count}")
            params.append(status)
        
        # Build final query
        if conditions:
            query = base_query + " WHERE " + " AND ".join(conditions)
        else:
            query = base_query
        
        query += " ORDER BY a.attendance_date DESC, e.full_name ASC"
        
        rows = await db.fetch(query, *params)
        return [AttendanceWithEmployee(**dict(row)) for row in rows]
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error filtering attendance: {str(e)}"
        )

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(attendance_id: UUID, update_data: AttendanceUpdate):
    """
    Update attendance status
    
    - **attendance_id**: Attendance record UUID
    - **status**: Updated status ('present' or 'absent')
    """
    try:
        # Check if attendance record exists
        check_query = "SELECT id FROM attendance WHERE id = $1"
        exists = await db.fetchrow(check_query, attendance_id)
        
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance record with ID {attendance_id} not found"
            )
        
        # Update attendance
        query = """
            UPDATE attendance
            SET status = $1
            WHERE id = $2
            RETURNING id, employee_id, attendance_date, status, created_at
        """
        row = await db.fetchrow(query, update_data.status, attendance_id)
        
        return AttendanceResponse(**dict(row))
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating attendance: {str(e)}"
        )

@router.delete("/{attendance_id}", response_model=SuccessResponse)
async def delete_attendance(attendance_id: UUID):
    """
    Delete an attendance record
    
    - **attendance_id**: Attendance record UUID
    """
    try:
        # Check if attendance record exists
        check_query = "SELECT id FROM attendance WHERE id = $1"
        exists = await db.fetchrow(check_query, attendance_id)
        
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance record with ID {attendance_id} not found"
            )
        
        # Delete attendance record
        delete_query = "DELETE FROM attendance WHERE id = $1"
        await db.execute(delete_query, attendance_id)
        
        return SuccessResponse(
            success=True,
            message="Attendance record deleted successfully"
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting attendance: {str(e)}"
        )
