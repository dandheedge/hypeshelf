"use client";

import { api } from "@convex/_generated/api";
import { AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Recommendation } from "@/types";
import { FilterBar } from "./FilterBar";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationListProps {
  editable?: boolean;
}

export function RecommendationList({
  editable = false,
}: RecommendationListProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const recommendations = useQuery(
    editable ? api.recommendations.listByUser : api.recommendations.list,
    selectedGenre ? { genre: selectedGenre } : {},
  );

  return (
    <div>
      <FilterBar
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
      />

      <AuthLoading>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="text-center py-12 text-muted-foreground">
          Sign in to view recommendations
        </div>
      </Unauthenticated>

      {recommendations && recommendations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No recommendations yet. {editable && "Be the first to add one!"}
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec: Recommendation) => (
            <RecommendationCard key={rec._id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
