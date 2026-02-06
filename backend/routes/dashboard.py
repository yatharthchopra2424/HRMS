from fastapi import APIRouter, HTTPException, status
from models.schemas import DashboardMetrics, EmployeeResponse
from database.connection import db
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get dashboard metrics and statistics"""
    try:
        # Total employees
        emp_response = db.client.table("employees").select("*", count="exact").execute()
        total_employees = emp_response.count or 0
        
        # Total attendance records
        att_response = db.client.table("attendance").select("*", count="exact").execute()
        total_attendance_records = att_response.count or 0
        
        # Today's attendance
        today = str(date.today())
        today_present = db.client.table("attendance")\
            .select("*", count="exact")\
            .eq("attendance_date", today)\
            .eq("status", "present")\
            .execute()
        today_present_count = today_present.count or 0
        
        today_absent = db.client.table("attendance")\
            .select("*", count="exact")\
            .eq("attendance_date", today)\
            .eq("status", "absent")\
            .execute()
        today_absent_count = today_absent.count or 0
        
        # Total absent (all time)
        total_absent = db.client.table("attendance")\
            .select("*", count="exact")\
            .eq("status", "absent")\
            .execute()
        total_absent_count = total_absent.count or 0
        
        # Overall attendance rate
        if total_attendance_records > 0:
            present_response = db.client.table("attendance")\
                .select("*", count="exact")\
                .eq("status", "present")\
                .execute()
            present_count = present_response.count or 0
            overall_attendance_rate = round((present_count / total_attendance_records) * 100, 2)
        else:
            overall_attendance_rate = 0.0
        
        # Recent employees (last 5)
        recent_response = db.client.table("employees")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(5)\
            .execute()
        recent_employees = [EmployeeResponse(**emp) for emp in recent_response.data]
        
        return DashboardMetrics(
            total_employees=total_employees,
            total_attendance_records=total_attendance_records,
            today_present=today_present_count,
            today_absent=today_absent_count,
            total_absent=total_absent_count,
            overall_attendance_rate=float(overall_attendance_rate),
            recent_employees=recent_employees
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard metrics: {str(e)}"
        )
