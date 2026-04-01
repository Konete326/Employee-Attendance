import { Types } from "mongoose";

export type UserRole = "admin" | "employee";
export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "on-leave";
export type LeaveType = "sick" | "casual" | "annual" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type PayrollStatus = "draft" | "finalized";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId?: string;
  department?: Types.ObjectId;
  shift?: Types.ObjectId;
  salary?: number;
  joiningDate?: Date;
  isActive?: boolean;
  leaveBalance?: {
    annual: number;
    sick: number;
    casual: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string;
  checkIn: Date;
  checkOut: Date | null;
  status: AttendanceStatus;
  hoursWorked: number;
  workingMinutes?: number;
  notes: string;
  location?: { lat: number; lng: number };
  overriddenBy?: Types.ObjectId;
  overriddenAt?: Date;
  outOfOffice?: boolean;
}

export interface IDepartment {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  managerId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShift {
  _id: Types.ObjectId;
  name: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  lateThresholdMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeave {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: Types.ObjectId;
  adminComment?: string;
  appliedAt: Date;
}

export interface IPayroll {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  unpaidLeaveDays: number;
  absentDeduction: number;
  lateDeduction: number;
  unpaidLeaveDeduction: number;
  bonuses: number;
  netSalary: number;
  status: PayrollStatus;
  generatedAt: Date;
  finalizedAt?: Date;
}

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface IAuditLog {
  _id: Types.ObjectId;
  performedBy: Types.ObjectId;
  action: string;
  targetModel: string;
  targetId: Types.ObjectId;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Request body types
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CheckInRequestBody {
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface CheckOutRequestBody {
  notes?: string;
}

export interface CreateDepartmentBody {
  name: string;
  description?: string;
  managerId?: string;
}

export interface CreateShiftBody {
  name: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  lateThresholdMinutes?: number;
}

export interface CreateEmployeeBody {
  name: string;
  email: string;
  password: string;
  department?: string;
  shift?: string;
  salary?: number;
  joiningDate?: Date;
}

export interface UpdateEmployeeBody {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  shift?: string;
  salary?: number;
  isActive?: boolean;
}

export interface ApplyLeaveBody {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveLeaveBody {
  adminComment?: string;
}

export interface AttendanceOverrideBody {
  status: AttendanceStatus;
  notes?: string;
}

export interface GeneratePayrollBody {
  month: number;
  year: number;
}

export interface UpdatePayrollBody {
  bonuses?: number;
}

export interface LocationSettingsBody {
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  strictGeofence: boolean;
}
