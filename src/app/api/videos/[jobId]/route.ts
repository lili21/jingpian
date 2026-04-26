import { pollVideoJob } from "@/lib/ai/video";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  const result = await pollVideoJob(jobId);
  return Response.json(result);
}
