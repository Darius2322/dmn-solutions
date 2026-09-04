"use server";

import { randomBytes } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  serviceRequestSchema,
  trackOrderLookupSchema,
  referralSchema,
  supportSubmissionSchema,
  contactSchema,
  type ServiceRequestInput,
  type TrackOrderLookupInput,
  type ReferralInput,
  type SupportSubmissionInput,
  type ContactInput,
} from "@/lib/validators/track-order";

const TRACK_SESSION_TTL_MINUTES = 30;

export async function submitServiceRequest(input: ServiceRequestInput) {
  const parsed = serviceRequestSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail.toLowerCase(),
      customer_phone: parsed.data.customerPhone || null,
      service_id: parsed.data.serviceId,
      location: parsed.data.location || null,
      description: parsed.data.description,
      budget_range: parsed.data.budgetRange || null,
      preferred_contact: parsed.data.preferredContact,
    })
    .select("tracking_number")
    .single();

  if (error || !data) return { success: false as const, error: "Could not submit your request. Please try again." };

  await supabase.from("analytics_events").insert({ event_type: "request_submitted", metadata: { service_id: parsed.data.serviceId } });

  return { success: true as const, trackingNumber: data.tracking_number as string };
}

export async function lookupTrackOrder(input: TrackOrderLookupInput) {
  const parsed = trackOrderLookupSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseAdminClient();
  const { data: request, error } = await supabase
    .from("service_requests")
    .select("id")
    .eq("tracking_number", parsed.data.trackingNumber)
    .eq("customer_email", parsed.data.email)
    .single();

  if (error || !request) {
    return { success: false as const, error: "We couldn't find a matching order. Check your tracking number and email." };
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + TRACK_SESSION_TTL_MINUTES * 60_000).toISOString();

  const { error: sessionError } = await supabase.from("track_sessions").insert({ token, service_request_id: request.id, expires_at: expiresAt });
  if (sessionError) return { success: false as const, error: "Something went wrong. Please try again." };

  await supabase.from("analytics_events").insert({ event_type: "track_order" });
  return { success: true as const, token };
}

export async function getTrackOrderStatus(token: string) {
  if (!token || typeof token !== "string") return null;
  const supabase = createSupabaseAdminClient();

  const { data: session } = await supabase.from("track_sessions").select("service_request_id, expires_at").eq("token", token).single();
  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: request } = await supabase
    .from("service_requests")
    .select("tracking_number, customer_name, status, payment_status, created_at, updated_at, customer_notes, service_id")
    .eq("id", session.service_request_id)
    .single();

  return request ?? null;
}

export async function submitReferral(input: ReferralInput) {
  const parsed = referralSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_name: parsed.data.referrerName,
      referrer_email: parsed.data.referrerEmail.toLowerCase(),
      referrer_phone: parsed.data.referrerPhone || null,
      referred_name: parsed.data.referredName,
      referred_contact: parsed.data.referredContact,
      service_interested: parsed.data.serviceInterested || null,
      notes: parsed.data.notes || null,
    })
    .select("reference_number")
    .single();

  if (error || !data) return { success: false as const, error: "Could not submit your referral. Please try again." };
  return { success: true as const, referenceNumber: data.reference_number as string };
}

export async function submitSupportSubmission(input: SupportSubmissionInput) {
  const parsed = supportSubmissionSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("support_submissions").insert({
    type: parsed.data.type,
    donor_name: parsed.data.donorName || null,
    donor_email: parsed.data.donorEmail || null,
    donor_phone: parsed.data.donorPhone || null,
    details: parsed.data.details,
  });

  if (error) return { success: false as const, error: "Could not submit. Please try again." };
  return { success: true as const };
}

export async function submitContactMessage(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = createSupabaseAdminClient();
  // Reuses notifications as a simple inbox for now; a dedicated contact_messages
  // table is a reasonable follow-up if volume grows.
  const { error } = await supabase.from("notifications").insert({
    recipient_type: "admin",
    type: "info",
    title: `New contact message from ${parsed.data.name}`,
    message: `${parsed.data.email}: ${parsed.data.message}`,
  });

  if (error) return { success: false as const, error: "Could not send your message. Please try again." };
  return { success: true as const };
}
