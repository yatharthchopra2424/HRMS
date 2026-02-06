from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import UUID
from models.schemas import (
    EmployeeCreate, EmployeeResponse,
    SuccessResponse, EmployeeAttendanceSummary
)
from database.connection import db

router = APIRouter(prefix="/api/employees", tags=["employees"])

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Create a new employee"""
    try:
        response = db.client.table("employees").insert({
            "employee_id": employee.employee_id,
            "full_name": employee.full_name,
            "email": employee.email,
            "department": employee.department
        }).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create employee"
            )
        
        return EmployeeResponse(**response.data[0])
    
    except Exception as e:
        error_msg = str(e)
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )

@router.get("", response_model=List[EmployeeResponse])
async def get_all_employees():
    """Get all employees"""
    try:
        response = db.client.table("employees").select("*").order("created_at", desc=True).execute()
        return [EmployeeResponse(**emp) for emp in response.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employees: {str(e)}"
        )

@router.get("/{employee_uuid}", response_model=EmployeeResponse)
async def get_employee(employee_uuid: UUID):
    """Get a single employee by UUID"""
    try:
        response = db.client.table("employees").select("*").eq("id", str(employee_uuid)).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        return EmployeeResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employee: {str(e)}"
        )

@router.delete("/{employee_uuid}", response_model=SuccessResponse)
async def delete_employee(employee_uuid: UUID):
    """Delete an employee"""
    try:
        # Check if exists
        check_response = db.client.table("employees").select("id").eq("id", str(employee_uuid)).execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        # Delete employee
        db.client.table("employees").delete().eq("id", str(employee_uuid)).execute()
        
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
    """Get attendance summary for a specific employee"""
    try:
        # Get employee
        emp_response = db.client.table("employees").select("*").eq("id", str(employee_uuid)).execute()
        
        if not emp_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_uuid} not found"
            )
        
        employee = emp_response.data[0]
        
        # Get attendance records
        att_response = db.client.table("attendance").select("*").eq("employee_id", str(employee_uuid)).execute()
        
        total_days = len(att_response.data)
        present_days = sum(1 for record in att_response.data if record["status"] == "present")
        absent_days = sum(1 for record in att_response.data if record["status"] == "absent")
        attendance_rate = round((present_days / total_days * 100), 2) if total_days > 0 else 0.0
        
        return EmployeeAttendanceSummary(
            employee_id=employee["id"],
            employee_name=employee["full_name"],
            employee_code=employee["employee_id"],
            department=employee["department"],
            total_days=total_days,
            present_days=present_days,
            absent_days=absent_days,
            attendance_rate=attendance_rate
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance summary: {str(e)}"
        )
