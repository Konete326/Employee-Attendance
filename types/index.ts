import { Types } from "mongoose";

export type UserRole = "admin" | "employee";
export type AttendanceStatus = "present" | "absent" | "late";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  createdAt: Date;
}

export interface IAttendance {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD format for easy querying
  checkIn: Date;
  checkOut: Date | null;
  status: AttendanceStatus;
  hoursWorked: number;
  notes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
}

export interface CheckOutRequestBody {
  notes?: string;
}
