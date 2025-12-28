import { z } from 'zod';

// Validation schema for login requests
export const loginSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username must be less than 50 characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be less than 100 characters" })
});

// Validation schema for user registration
export const registrationSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username must be less than 50 characters" })
    .refine((val) => /^[a-zA-Z0-9_-]+$/.test(val), {
      message: "Username can only contain letters, numbers, underscores, and hyphens"
    }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be less than 100 characters" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter"
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter"
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number"
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character"
    }),
  email: z.string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" })
    .max(255, { message: "Email must be less than 255 characters" })
    .toLowerCase()
    .trim(),
  fullName: z.string()
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .trim(),
  company: z.string()
    .max(100, { message: "Company name must be less than 100 characters" })
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: "Invalid phone number format" })
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional(),
  role: z.enum(["admin", "user", "client"])
    .default("user"),
  isActive: z.boolean().default(true)
});

// Validation schema for password change
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(8, { message: "New password must be at least 8 characters long" })
    .max(100, { message: "New password must be less than 100 characters" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter"
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter"
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number"
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character"
    })
});

// Validation schema for profile updates
export const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .optional(),
  email: z.string()
    .email({ message: "Invalid email address" })
    .optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().min(2).max(10).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional()
  }).optional()
});