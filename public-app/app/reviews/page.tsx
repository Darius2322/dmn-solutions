import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getApprovedReviews } from "@/lib/actions/reviews";
import { ReviewForm } from "@/components/review-form";

export const metadata: Metadata = { title: "Reviews", description: "What our customers say about DMN Solutions." };

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Feedback from people we've worked with.
      </p>

      <div className="mt-10">
        <ReviewForm />
      </div>

      {reviews.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">No reviews yet — be the first to leave one.</p>
      ) : (
        <div className="mt-10 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(review.user_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{review.user_name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${review.rating >= n ? "fill-secondary text-secondary" : "text-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.service && <p className="mt-0.5 text-xs text-muted-foreground">{review.service}</p>}
                  <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
