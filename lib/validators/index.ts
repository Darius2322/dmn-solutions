// lib/validators/index.ts
import { z } from 'zod';

// ── Service ──────────────────────────────────────────────────────────────────
export const ServiceSchema = z.object({
  title:       z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  icon:        z.string().max(60).optional(),
  price_label: z.string().max(50).optional(),
  features:    z.array(z.string().max(100)).max(10).default([]),
  category:    z.enum(['web','mobile','ecommerce','marketing','design','cloud','general']),
  is_active:   z.boolean().default(true),
  sort_order:  z.number().int().min(0).max(999).default(0),
});
export type ServiceInput = z.infer<typeof ServiceSchema>;

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const PortfolioSchema = z.object({
  title:       z.string().min(2).max(120),
  description: z.string().max(800).optional(),
  url:         z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image:       z.string().url().optional().or(z.literal('')),
  tags:        z.string().max(200).optional(),
  category:    z.string().max(50).default('business'),
  featured:    z.boolean().default(false),
  hidden:      z.boolean().default(false),
  sort_order:  z.number().int().min(0).default(0),
});
export type PortfolioInput = z.infer<typeof PortfolioSchema>;

// ── Feedback / Review ─────────────────────────────────────────────────────────
export const FeedbackSchema = z.object({
  user_name: z.string().min(1).max(80).optional(),
  user_email: z.string().email().optional().or(z.literal('')),
  rating:  z.number().int().min(1, 'Rating required').max(5),
  service: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});
export type FeedbackInput = z.infer<typeof FeedbackSchema>;

// ── Comment / Complaint ───────────────────────────────────────────────────────
export const CommentSchema = z.object({
  type:    z.enum(['feedback', 'complaint', 'comment', 'suggestion']),
  message: z.string().min(5, 'Message too short').max(2000),
});
export type CommentInput = z.infer<typeof CommentSchema>;

// ── Service Request ───────────────────────────────────────────────────────────
export const RequestSchema = z.object({
  title:       z.string().min(4).max(200),
  description: z.string().max(2000).optional(),
  service:     z.string().max(100).optional(),
});
export type RequestInput = z.infer<typeof RequestSchema>;

// ── Admin: Request Status Update ──────────────────────────────────────────────
export const RequestStatusSchema = z.object({
  id:          z.string().uuid(),
  status:      z.enum(['open', 'in_progress', 'resolved', 'closed']),
  admin_reply: z.string().max(2000).optional(),
});

// ── Admin: Badge Award ────────────────────────────────────────────────────────
export const BadgeSchema = z.object({
  user_email:  z.string().email(),
  badge_key:   z.enum(['star','vip','early','premium','verified','power','loyal','founder']),
  badge_label: z.string().max(40),
  badge_icon:  z.string().max(10),
});
export type BadgeInput = z.infer<typeof BadgeSchema>;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const SignupSchema = LoginSchema.extend({
  full_name: z.string().min(2).max(80),
  confirm:   z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});
