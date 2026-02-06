from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import date, datetime
from uuid import UUID
import re

# ==================== Employee Models ====================

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=255, description="Employee full name")
    email: EmailStr = Field(..., description="Employee email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")
    
    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v: str) -> str:
        # Remove whitespace
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        # Check for special characters (allow alphanumeric, dash, underscore)
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Employee ID can only contain letters, numbers, dashes, and underscores")
        return v
    
    @field_validator('full_name', 'department')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v

class EmployeeResponse(BaseModel):
    id: UUID
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, min_length=1, max_length=100)

# ==================== Attendance Models ====================

AttendanceStatus = Literal["present", "absent"]

class AttendanceCreate(BaseModel):
    employee_id: UUID = Field(..., description="Employee UUID")
    attendance_date: date = Field(..., description="Date of attendance")
    status: AttendanceStatus = Field(..., description="Attendance status: present or absent")
    
    @field_validator('attendance_date')
    @classmethod
    def validate_date_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Attendance date cannot be in the future")
        return v

class AttendanceUpdate(BaseModel):
    status: AttendanceStatus = Field(..., description="Updated attendance status")

class AttendanceResponse(BaseModel):
    id: UUID
    employee_id: UUID
    attendance_date: date
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttendanceWithEmployee(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: str
    employee_code: str
    department: str
    attendance_date: date
    status: str
    created_at: datetime

# ==================== Filter Models ====================

class AttendanceFilter(BaseModel):
    employee_id: Optional[UUID] = None
    date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[AttendanceStatus] = None

# ==================== Statistics Models ====================

class EmployeeAttendanceSummary(BaseModel):
    employee_id: UUID
    employee_name: str
    employee_code: str
    department: str
    total_days: int
    present_days: int
    absent_days: int
    attendance_rate: float

class DashboardMetrics(BaseModel):
    total_employees: int
    total_attendance_records: int
    today_present: int
    today_absent: int
    total_absent: int
    overall_attendance_rate: float
    recent_employees: list[EmployeeResponse]

# ==================== Response Models ====================

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
