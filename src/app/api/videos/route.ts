import { submitVideoJob } from "@/lib/ai/video";
import { videoRequestSchema } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = videoRequestSchema.parse(await request.json());
    const result = await submitVideoJob(payload);
    return Response.json(result, { status: result.mode === "live" ? 202 : 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "video route failed",
      },
      { status: 400 },
    );
  }
}
