import { generateStoryboardPlan } from "@/lib/ai/storyboard";
import { storyboardRequestSchema } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = storyboardRequestSchema.parse(await request.json());
    const result = await generateStoryboardPlan(payload);
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "storyboard route failed",
      },
      { status: 400 },
    );
  }
}
