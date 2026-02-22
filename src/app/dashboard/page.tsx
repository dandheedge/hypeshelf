"use client";

import { Authenticated } from "convex/react";
import { PageShell } from "@/components/layout/PageShell";
import { RecommendationForm } from "@/components/recommendations/RecommendationForm";
import { RecommendationList } from "@/components/recommendations/RecommendationList";

export default function DashboardPage() {
  return (
    <PageShell>
      <Authenticated>
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          <div>
            <RecommendationForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Shelf</h2>
            <RecommendationList editable />
          </div>
        </div>
      </Authenticated>
    </PageShell>
  );
}
