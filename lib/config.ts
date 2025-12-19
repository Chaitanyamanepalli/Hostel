import { z } from "zod"

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  APP_URL: z.string().min(1).optional(),
})

export type AppConfig = z.infer<typeof EnvSchema>

export const config: AppConfig = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL,
})
