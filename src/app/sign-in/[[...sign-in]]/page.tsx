import { SignIn } from "@clerk/nextjs";
import { PageShell } from "@/components/layout/PageShell";

export default function SignInPage() {
  return (
    <PageShell>
      <div className="flex justify-center pt-12">
        <SignIn />
      </div>
    </PageShell>
  );
}
