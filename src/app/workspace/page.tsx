import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getSubscriptionState } from "@/lib/billing/subscription";

export default async function WorkspacePage() {
  const subscription = await getSubscriptionState().catch(() => ({
    isSignedIn: false,
    isPremium: false,
    plan: "free" as const,
    source: "fallback" as const,
  }));

  return <WorkspaceShell subscription={subscription} />;
}
