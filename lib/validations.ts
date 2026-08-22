import { z } from "zod"

export const bookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service"),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
})

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional().default(""),
  duration_minutes: z.number().int().min(5, "Minimum 5 minutes").max(480, "Max 8 hours"),
  price: z.number().min(0, "Price can't be negative").max(1000000),
})

export const dayRuleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((rule) => !rule.enabled || rule.start_time < rule.end_time, {
  message: "Start time end time se pehle hona chahiye",
  path: ["end_time"],
})

export const availabilitySchema = z.array(dayRuleSchema)

export const bookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled", "completed"]),
})