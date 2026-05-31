// ===== 跃动智体 — 登录首页 =====
import { LandingPage } from "@/components/features/landing-page";
import { getLoginAccounts } from "@/lib/server/data-service";

export default async function RootPage() {
  const accounts = await getLoginAccounts();
  return <LandingPage accounts={accounts} />;
}

export const dynamic = "force-dynamic";
