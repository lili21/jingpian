# Jingpian

Jingpian 是一个面向品牌方、商家、内容团队与代理协作场景的 **storyboard-to-video 产品原型**。

它不是把“文生视频”直接堆到首页，而是把整条链路拆成更适合商业团队判断的工作流：

1. 输入业务简报
2. 生成可评审分镜
3. 生成关键帧验证方向
4. 提交视频任务并轮询回传状态

核心表达仍然是：**先出分镜，再出视频。**

---

## 当前实现

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Motion
- AI SDK
- Better Auth + SQLite
- Stripe billing skeleton
- OpenRouter / OpenAI-compatible provider
- Vercel AI Gateway image path + OpenRouter fallback + demo fallback

---

## 主要页面

### `/`
产品化 landing page，强调中国 B2B / 商业采购语境下的可信感、交付感和评审流程，而不是普通 AI demo 首屏。

### `/workspace`
工作台页，把 brief、分镜、关键帧和视频任务放在一个评审视图里。

当前实现包含：

- 简报输入
- 分镜生成
- 关键帧生成
- 视频任务提交 / 状态轮询
- free / premium 占位状态
- 未配置真实 provider 时的 demo fallback

### `/sign-in` 和 `/sign-up`
Better Auth 邮箱密码登录 / 注册页面。

### `/pricing`
Stripe 套餐页与升级入口。

---

## AI 接入策略

### 1) 分镜生成
通过 AI SDK + `@ai-sdk/openai-compatible` 走结构化 `generateObject()`。

默认配置：

- `AI_COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1`
- `STORYBOARD_MODEL=openai/gpt-4.1-mini`

也可以替换成任何 OpenAI-compatible endpoint。

### 2) 图像生成
当前按下面顺序回退：

1. **Vercel AI Gateway**：当 `AI_GATEWAY_API_KEY` 存在时，优先走 AI SDK 的 `generateImage()` + gateway image model。
2. **OpenRouter**：当未配置 AI Gateway 但存在 `OPENROUTER_API_KEY` 时，走 OpenRouter `responses` + `openrouter:image_generation`。
3. **Demo fallback**：当 live provider 未配置或调用失败时，返回演示关键帧图。

默认模型：

- `AI_GATEWAY_IMAGE_MODEL=openai/gpt-image-1`
- `OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2`

### 3) 视频生成
通过 OpenRouter 的视频任务接口提交与轮询：

- `POST /api/v1/videos`
- `GET /api/v1/videos/{jobId}`

默认模型：

- `OPENROUTER_VIDEO_MODEL=bytedance/seedance-2.0`

如果没有配置 OpenRouter key，视频链路会回退到 demo polling flow。

> 说明：`gpt-image-2` / `Seedance 2` 的最终可用 slug 仍以你账号下真实可见模型为准，因此全部保持环境变量可配置。

---

## Auth 与 Billing

### Better Auth
当前使用：

- `better-auth`
- `better-sqlite3`
- 本地 SQLite 文件：默认 `./data/auth.db`

关键环境变量：

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_DB_PATH`

### Stripe billing skeleton
当前已接入：

- `/api/billing/checkout`
- `/api/billing/portal`
- `/api/stripe/webhook`
- `/pricing`
- workspace 中的升级入口与 free/premium 占位状态

未配置 Stripe 时：

- 未登录保护仍会生效
- 未配置订阅数据时，workspace 默认显示 free 占位状态
- 升级链路可继续在接入真实 price / webhook 后补齐持久化

---

## 环境变量

复制示例文件：

```bash
cp .env.example .env.local
```

最小可运行配置：

```bash
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
BETTER_AUTH_URL=http://127.0.0.1:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-string

AI_COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1
AI_COMPATIBLE_API_KEY=...
STORYBOARD_MODEL=openai/gpt-4.1-mini
```

如果还要接真实图像 / 视频：

```bash
AI_GATEWAY_API_KEY=...
AI_GATEWAY_IMAGE_MODEL=openai/gpt-image-1

OPENROUTER_API_KEY=...
OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2
OPENROUTER_VIDEO_MODEL=bytedance/seedance-2.0
```

如果还要接付费：

```bash
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PREMIUM_PRICE_ID=price_...
```

如果不配任何 AI / Stripe key，应用仍可运行，但会退回 demo / graceful fallback。

---

## 本地运行

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

打开：

```text
http://127.0.0.1:3000
```

---

## 验证命令

```bash
npm test
npm run lint
NODE_OPTIONS=--max-old-space-size=2048 npm run build
```

> 当前环境里，`next build` 默认内存配置有概率不足，因此构建验证建议显式加上 `NODE_OPTIONS=--max-old-space-size=2048`。

---

## 主要目录

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── billing/checkout/route.ts
│   │   ├── billing/portal/route.ts
│   │   ├── images/route.ts
│   │   ├── storyboard/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   ├── videos/route.ts
│   │   └── videos/[jobId]/route.ts
│   ├── pricing/page.tsx
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── workspace/page.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── ui/
│   └── workspace/
└── lib/
    ├── ai/
    ├── billing/
    ├── auth.ts
    ├── auth-client.ts
    ├── session.ts
    └── demo.ts
```

---

## QA 范围

建议每次改动后至少验证：

- `/`
- `/sign-in`
- `/sign-up`
- `/pricing`
- `/workspace`
- `/api/storyboard`
- `/api/images`
- `/api/videos`
- `/api/billing/checkout`
- `/api/billing/portal`

---

## 后续建议

- 把 Stripe webhook 与订阅持久化真正闭环
- 给 workspace 加项目列表 / 历史记录
- 给 image / video live path 增加更细的失败提示与重试策略
- 接真实品牌资产、案例素材和交付导出

---

## License

当前仓库未单独声明开源许可证。若后续需要公开开源，建议补充 LICENSE 文件。
