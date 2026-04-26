import { generateStoryboardImages } from "@/lib/ai/image";
import { imageRequestSchema } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = imageRequestSchema.parse(await request.json());
    const result = await generateStoryboardImages(payload);
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "image route failed",
      },
      { status: 400 },
    );
  }
}
