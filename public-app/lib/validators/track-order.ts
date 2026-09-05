import { z } from "zod";

export const serviceRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().max(20).optional().or(z.literal("")),
  serviceId: z.string().uuid(),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(2000),
  budgetRange: z.string().trim().max(60).optional().or(z.literal("")),
  preferredContact: z.enum(["email", "phone", "whatsapp"]).default("email"),
});
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const trackOrderLookupSchema = z.object({
  trackingNumber: z.string().trim().toUpperCase().regex(/^DMN-\d{2}-\d{6}$/, "Format should be DMN-26-000123"),
  email: z.string().trim().toLowerCase().email(),
});
export type TrackOrderLookupInput = z.infer<typeof trackOrderLookupSchema>;

export const referralSchema = z.object({
  referrerName: z.string().trim().min(2).max(120),
  referrerEmail: z.string().trim().email(),
  referrerPhone: z.string().trim().max(20).optional().or(z.literal("")),
  referredName: z.string().trim().min(2).max(120),
  referredContact: z.string().trim().min(5).max(120),
  serviceInterested: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ReferralInput = z.infer<typeof referralSchema>;

export const supportSubmissionSchema = z.object({
  type: z.enum(["equipment_donation", "financial_support"]),
  donorName: z.string().trim().max(120).optional().or(z.literal("")),
  donorEmail: z.string().trim().email().optional().or(z.literal("")),
  donorPhone: z.string().trim().max(20).optional().or(z.literal("")),
  details: z.string().trim().min(5).max(1000),
});
export type SupportSubmissionInput = z.infer<typeof supportSubmissionSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;
