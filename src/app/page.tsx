"use client";

import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <PageShell>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">HypeShelf</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Collect and share the stuff you're hyped about
        </p>
        <SignedOut>
          <Link href="/sign-in">
            <Button size="lg">Sign in to add yours</Button>
          </Link>
        </SignedOut>
      </div>

      <RecommendationList />
    </PageShell>
  );
}
