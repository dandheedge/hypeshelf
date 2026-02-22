import { z } from "zod";

export const RecommendationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  genre: z.enum(
    [
      "horror",
      "action",
      "comedy",
      "thriller",
      "sci-fi",
      "drama",
      "romance",
      "documentary",
    ],
    {
      message: "Please select a genre",
    },
  ),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  blurb: z
    .string()
    .min(1, "Blurb is required")
    .max(280, "Blurb must be less than 280 characters"),
});

export type RecommendationFormData = z.infer<typeof RecommendationSchema>;

export const GenreOptions = [
  { value: "horror", label: "Horror" },
  { value: "action", label: "Action" },
  { value: "comedy", label: "Comedy" },
  { value: "thriller", label: "Thriller" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "drama", label: "Drama" },
  { value: "romance", label: "Romance" },
  { value: "documentary", label: "Documentary" },
] as const;
