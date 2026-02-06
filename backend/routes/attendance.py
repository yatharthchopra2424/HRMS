from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import date as dt_date
from models.schemas import (
    AttendanceCreate, AttendanceResponse,
    AttendanceWithEmployee, SuccessResponse
)
from database.connection import db

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee"""
    try:
        # Check if employee exists
        emp_response = db.client.table("employees").select("id").eq("id", str(attendance.employee_id)).execute()
        
        if not emp_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {attendance.employee_id} not found"
            )
        
        # Upsert attendance (insert or update if exists)
        response = db.client.table("attendance").upsert({
            "employee_id": str(attendance.employee_id),
            "attendance_date": str(attendance.attendance_date),
            "status": attendance.status
        }, on_conflict="employee_id,attendance_date").execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to mark attendance"
            )
        
        return AttendanceResponse(**response.data[0])
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking attendance: {str(e)}"
        )

@router.get("", response_model=List[AttendanceWithEmployee])
async def get_attendance_records(employee_id: Optional[UUID] = Query(None)):
    """Get attendance records with employee details"""
    try:
        query = db.client.table("attendance").select("*, employees(full_name, employee_id, department)")
        
        if employee_id:
            query = query.eq("employee_id", str(employee_id))
        
        response = query.order("attendance_date", desc=True).execute()
        
        result = []
        for record in response.data:
            emp_data = record.get("employees", {})
            result.append(AttendanceWithEmployee(
                id=record["id"],
                employee_id=record["employee_id"],
                employee_name=emp_data.get("full_name", ""),
                employee_code=emp_data.get("employee_id", ""),
                department=emp_data.get("department", ""),
                attendance_date=record["attendance_date"],
                status=record["status"],
                created_at=record["created_at"]
            ))
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance: {str(e)}"
        )

@router.get("/filter", response_model=List[AttendanceWithEmployee])
async def filter_attendance(
    date: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    employee_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None)
):
    """Filter attendance records"""
    try:
        query = db.client.table("attendance").select("*, employees(full_name, employee_id, department)")
        
        if date:
            query = query.eq("attendance_date", date)
        if start_date and end_date:
            query = query.gte("attendance_date", start_date).lte("attendance_date", end_date)
        if employee_id:
            query = query.eq("employee_id", str(employee_id))
        if status:
            query = query.eq("status", status)
        
        response = query.order("attendance_date", desc=True).execute()
        
        result = []
        for record in response.data:
            emp_data = record.get("employees", {})
            result.append(AttendanceWithEmployee(
                id=record["id"],
                employee_id=record["employee_id"],
                employee_name=emp_data.get("full_name", ""),
                employee_code=emp_data.get("employee_id", ""),
                department=emp_data.get("department", ""),
                attendance_date=record["attendance_date"],
                status=record["status"],
                created_at=record["created_at"]
            ))
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error filtering attendance: {str(e)}"
        )

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(attendance_id: UUID, status: str):
    """Update attendance status"""
    try:
        response = db.client.table("attendance").update({"status": status}).eq("id", str(attendance_id)).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance record {attendance_id} not found"
            )
        
        return AttendanceResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating attendance: {str(e)}"
        )

@router.delete("/{attendance_id}", response_model=SuccessResponse)
async def delete_attendance(attendance_id: UUID):
    """Delete attendance record"""
    try:
        check_response = db.client.table("attendance").select("id").eq("id", str(attendance_id)).execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance record {attendance_id} not found"
            )
        
        db.client.table("attendance").delete().eq("id", str(attendance_id)).execute()
        
        return SuccessResponse(success=True, message="Attendance deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting attendance: {str(e)}"
        )
