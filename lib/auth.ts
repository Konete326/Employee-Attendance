import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env.local"
  );
}

/**
 * Hash a password using bcrypt with 12 rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token with 7 days expiry
 */
export function generateToken(userId: string, role: string): string {
  const payload: JWTPayload = { userId, email: "", role: role as JWTPayload["role"] };
  return jwt.sign({ userId, role }, JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
