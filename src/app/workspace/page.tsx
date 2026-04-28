import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getSubscriptionState } from "@/lib/billing/subscription";

export default async function WorkspacePage() {
  const subscription = await getSubscriptionState();
  return <WorkspaceShell subscription={subscription} />;
}
