from fastapi import APIRouter, HTTPException, status
from database.connection import db
from datetime import date, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/attendance-trends")
async def get_attendance_trends():
    """Get attendance trends for the last 7 days"""
    try:
        # Get last 7 days of attendance data
        end_date = date.today()
        start_date = end_date - timedelta(days=6)
        
        attendance_response = db.client.table("attendance")\
            .select("attendance_date, status")\
            .gte("attendance_date", str(start_date))\
            .lte("attendance_date", str(end_date))\
            .execute()
        
        # Group by date and status
        trends = {}
        for record in attendance_response.data:
            date_str = record["attendance_date"]
            if date_str not in trends:
                trends[date_str] = {"date": date_str, "present": 0, "absent": 0}
            trends[date_str][record["status"]] += 1
        
        # Fill missing dates with zeros
        current_date = start_date
        while current_date <= end_date:
            date_str = str(current_date)
            if date_str not in trends:
                trends[date_str] = {"date": date_str, "present": 0, "absent": 0}
            current_date += timedelta(days=1)
        
        result = sorted(trends.values(), key=lambda x: x["date"])
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance trends: {str(e)}"
        )

@router.get("/department-stats")
async def get_department_stats():
    """Get employee count by department"""
    try:
        employees_response = db.client.table("employees").select("department").execute()
        
        # Count by department
        dept_count = {}
        for emp in employees_response.data:
            dept = emp["department"]
            dept_count[dept] = dept_count.get(dept, 0) + 1
        
        result = [{"department": k, "count": v} for k, v in dept_count.items()]
        return sorted(result, key=lambda x: x["count"], reverse=True)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching department stats: {str(e)}"
        )

@router.get("/monthly-attendance")
async def get_monthly_attendance():
    """Get attendance rate for the current month by week"""
    try:
        # Get first day of current month
        today = date.today()
        first_day = date(today.year, today.month, 1)
        
        attendance_response = db.client.table("attendance")\
            .select("attendance_date, status")\
            .gte("attendance_date", str(first_day))\
            .lte("attendance_date", str(today))\
            .execute()
        
        # Group by week
        weekly_data = {}
        for record in attendance_response.data:
            att_date = date.fromisoformat(record["attendance_date"])
            week_num = (att_date.day - 1) // 7 + 1
            week_key = f"Week {week_num}"
            
            if week_key not in weekly_data:
                weekly_data[week_key] = {"week": week_key, "present": 0, "absent": 0, "total": 0}
            
            weekly_data[week_key]["total"] += 1
            if record["status"] == "present":
                weekly_data[week_key]["present"] += 1
            else:
                weekly_data[week_key]["absent"] += 1
        
        # Calculate rate
        for week in weekly_data.values():
            if week["total"] > 0:
                week["rate"] = round((week["present"] / week["total"]) * 100, 1)
            else:
                week["rate"] = 0
        
        return sorted(weekly_data.values(), key=lambda x: x["week"])
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching monthly attendance: {str(e)}"
        )
