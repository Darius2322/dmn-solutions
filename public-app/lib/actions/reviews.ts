"use server";

import { z } from "zod";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  userName: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  service: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(10).max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export async function getApprovedReviews() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("feedback")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function submitReview(input: ReviewInput) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Please check your review details and try again." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("feedback").insert({
    user_name: parsed.data.userName,
    rating: parsed.data.rating,
    service: parsed.data.service || null,
    comment: parsed.data.comment,
    approved: false,
  });

  if (error) {
    return { success: false as const, error: "We couldn't submit your review. Please try again." };
  }

  return { success: true as const };
}
