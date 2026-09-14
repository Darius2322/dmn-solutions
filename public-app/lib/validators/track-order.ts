import { z } from "zod";

export const serviceRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().max(20).optional().or(z.literal("")),
  serviceId: z.string().trim().min(1),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(2000),
  budgetRange: z.string().trim().max(100).optional().or(z.literal("")),
  preferredContact: z.string().trim().min(1),
});
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const trackOrderLookupSchema = z.object({
  trackingNumber: z.string().trim().min(1),
  email: z.string().trim().email(),
});
export type TrackOrderLookupInput = z.infer<typeof trackOrderLookupSchema>;

export const referralSchema = z.object({
  referrerName: z.string().trim().min(2).max(120),
  referrerEmail: z.string().trim().email(),
  referrerPhone: z.string().trim().max(20).optional().or(z.literal("")),
  referredName: z.string().trim().min(2).max(120),
  referredContact: z.string().trim().min(1),
  serviceInterested: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ReferralInput = z.infer<typeof referralSchema>;

export const supportSubmissionSchema = z.object({
  type: z.enum(["equipment_donation", "financial_support", "work_with_us", "bug_report"]),
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
