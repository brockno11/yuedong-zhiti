// ===== 跃动智体 — 首次引导页 =====
import { OnboardingSteps } from "@/components/features/onboarding-steps";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      <OnboardingSteps />
    </div>
  );
}
