"use client";

import { api } from "@convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GenreOptions,
  type RecommendationFormData,
  RecommendationSchema,
} from "@/lib/schemas";

type GenreField = RecommendationFormData["genre"];

export function RecommendationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addRecommendation = useMutation(api.recommendations.add);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RecommendationFormData>({
    resolver: zodResolver(RecommendationSchema),
  });

  const genre = watch("genre");

  const onSubmit = async (data: RecommendationFormData) => {
    setIsSubmitting(true);
    try {
      await addRecommendation({
        title: data.title,
        genre: data.genre,
        link: data.link || undefined,
        blurb: data.blurb,
      });
      toast.success("Your recommendation has been added.");
      // Reset form
      reset();
    } catch {
      toast.error("Failed to add recommendation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Recommendation</CardTitle>
        <CardDescription>
          Share something you're hyped about with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What do you recommend?"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select
              onValueChange={(value) => setValue("genre", value as GenreField)}
              value={genre}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GenreOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.genre && (
              <p className="text-sm text-red-500">{errors.genre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              {...register("link")}
            />
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blurb">Blurb</Label>
            <Textarea
              id="blurb"
              placeholder="Why do you recommend this? (max 280 characters)"
              rows={4}
              {...register("blurb")}
            />
            {errors.blurb && (
              <p className="text-sm text-red-500">{errors.blurb.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Recommendation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
