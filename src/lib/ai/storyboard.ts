import { generateObject } from "ai";

        import { getCompatibleProvider, getStoryboardModel, hasCompatibleProvider } from "@/lib/ai/provider";
        import {
          storyboardCoreSchema,
          type StoryboardRequest,
          type StoryboardResponse,
        } from "@/lib/ai/schemas";
        import { buildDemoStoryboard } from "@/lib/demo";

        export async function generateStoryboardPlan(
          input: StoryboardRequest,
        ): Promise<StoryboardResponse> {
          if (!hasCompatibleProvider()) {
            return buildDemoStoryboard(input);
          }

          try {
            const provider = getCompatibleProvider();
            const model = getStoryboardModel();

            const { object } = await generateObject({
              model: provider.chatModel(model),
              schema: storyboardCoreSchema,
              temperature: 0.7,
              system:
                "You are Jingpian's senior commercial storyboard strategist. Output must serve professional B2B review and procurement contexts, emphasizing reviewability, traceability, and execution readiness. Avoid gimmicky AI-demo tone and avoid exaggerated marketing language.",
              prompt: [
                `Brief: ${input.brief}`,
                `Audience: ${input.audience}`,
                `Scenario: ${input.scenario}`,
                `Style: ${input.style}`,
                `Objective: ${input.objective}`,
                `Duration: ${input.durationSeconds} seconds, Aspect ratio: ${input.aspectRatio}`,
                "Return 4 to 6 scenes. Every scene must include commercial intent, key visual direction, voiceover, on-screen text, transition, and review notes.",
                "Keep language realistic, restrained, and proposal-ready. Avoid exaggerated claims.",
              ].join("\n"),
            });

            return {
              mode: "live",
              provider: "openai-compatible",
              model,
              ...object,
            };
          } catch (error) {
            console.error("storyboard generation failed", error);
            return buildDemoStoryboard(input);
          }
        }
