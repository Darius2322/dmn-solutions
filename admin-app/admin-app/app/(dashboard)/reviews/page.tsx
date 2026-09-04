import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ReviewActions } from "@/components/admin/review-actions";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: reviews } = await supabase
    .from("feedback")
    .select("id, user_name, rating, service, comment, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Reviews</h1>
      <div className="mt-6 space-y-3">
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-border"}`} />
                  ))}
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{r.user_name}</p>
                <p className="text-xs text-muted-foreground">{r.service ?? "General"}</p>
                {r.comment && <p className="mt-2 text-sm text-foreground">{r.comment}</p>}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${r.approved ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {r.approved ? "Visible" : "Hidden"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <ReviewActions reviewId={r.id} approved={r.approved} />
            </div>
          </div>
        ))}
        {(reviews ?? []).length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}
