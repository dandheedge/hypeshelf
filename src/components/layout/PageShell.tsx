import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
}
