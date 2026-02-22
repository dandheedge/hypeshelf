"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Star, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recommendation } from "@/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDelete?: () => void;
}

export function RecommendationCard({
  recommendation,
  onDelete,
}: RecommendationCardProps) {
  const deleteRecommendation = useMutation(api.recommendations.remove);
  const markAsStaffPick = useMutation(api.recommendations.markAsStaffPick);

  // Use server-provided auth context for security
  const isAdmin = recommendation.currentUserRole === "admin";
  const isOwner = recommendation.isOwner === true;
  const canDelete = isAdmin || isOwner;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this recommendation?")) {
      await deleteRecommendation({
        id: recommendation._id as Id<"recommendations">,
      });
      onDelete?.();
    }
  };

  const handleMarkAsStaffPick = async () => {
    await markAsStaffPick({ id: recommendation._id as Id<"recommendations"> });
    onDelete?.();
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {recommendation.title}
              {recommendation.isStaffPick && (
                <Badge variant="category" className="gap-1">
                  <Star className="h-3 w-3 text-white" />
                  Staff Pick
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={recommendation.userImageUrl} />
                <AvatarFallback>{recommendation.userName[0]}</AvatarFallback>
              </Avatar>
              {recommendation.userName}
            </CardDescription>
          </div>
          {(isAdmin || isOwner) && (
            <div className="flex gap-2">
              {isAdmin && !recommendation.isStaffPick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAsStaffPick}
                  title="Mark as Staff Pick"
                  className="hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title="Delete"
                className="hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="category" className="mb-3">
          {recommendation.genre}
        </Badge>
        <p className="text-sm text-muted-foreground">{recommendation.blurb}</p>
        {recommendation.link && (
          <a
            href={recommendation.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-[var(--brand-primary)] hover:underline"
          >
            View Link →
          </a>
        )}
      </CardContent>
    </Card>
  );
}
