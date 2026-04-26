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
                "你是 Jingpian 的资深商业分镜策划。输出必须服务于中国 B2B 短视频采购与评审场景，强调可审阅、可留档、可执行。不要写成炫技 AI demo，也不要夸张营销。",
              prompt: [
                `项目简报：${input.brief}`,
                `受众：${input.audience}`,
                `场景：${input.scenario}`,
                `风格：${input.style}`,
                `目标：${input.objective}`,
                `时长：${input.durationSeconds} 秒，画幅：${input.aspectRatio}`,
                "请输出 4 到 6 个镜头，镜头需要具备：商业意图、关键画面描述、口播、屏幕文案、转场和评审备注。",
                "所有描述都要真实、克制、偏专业提案，不要使用夸张的营销词。",
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
