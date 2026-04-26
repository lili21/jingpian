# Jingpian

Jingpian 是一个面向品牌方、商家、内容团队与代理协作场景的 **storyboard-to-video 产品原型**。

它不是把“文生视频”直接摆到首页，而是把整条链路拆成更适合商业团队判断的流程：

1. 输入业务简报
2. 生成可评审分镜
3. 生成关键帧验证方向
4. 提交视频任务并轮询回传状态

核心表达仍然是：**先出分镜，再出视频。**

---

## 当前技术栈

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Motion
- AI SDK
- Zod
- OpenRouter（图像 / 视频）
- OpenAI-compatible provider（分镜结构化生成）

---

## 页面结构

### `/`
首页已经从静态 landing page 升级成更完整的产品化页面：

- 专业版 hero
- 工作方式说明
- 交付证明 / review board 示意
- 适用场景
- FAQ
- 指向 `/workspace` 的主 CTA

设计目标是：

- 中国 B2B / 商业采购语境
- premium 但不夸张
- 尽量降低 “AI demo 感”
- 让首页更像产品说明页，而不是把生成器直接堆在首屏

### `/workspace`
产品工作台，包含：

- 简报输入
- 分镜生成
- 关键帧生成
- 视频任务提交
- 异步轮询状态

当没有接入真实 API key 时，工作台会自动退回 **demo fallback**：

- 演示分镜 JSON
- 演示关键帧 SVG
- 演示视频任务轮询与样片返回

这样可以先演示完整产品流程，再切换到真实调用。

---

## AI 接入说明

### 1) 分镜生成

通过 AI SDK + `@ai-sdk/openai-compatible` 实现。

当前逻辑：

- 读取 `AI_COMPATIBLE_BASE_URL`
- 读取 `AI_COMPATIBLE_API_KEY`
- 使用 `STORYBOARD_MODEL`
- 走结构化 `generateObject()` 输出

默认可直接指向 OpenRouter：

- `AI_COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1`
- `STORYBOARD_MODEL=openai/gpt-4.1-mini`

如果你想换成别的 OpenAI-compatible provider 或 AI Gateway，也可以只改 base URL 和 key。

### 2) 图像生成

通过 OpenRouter `responses` 接口 + `openrouter:image_generation` tool 实现。

默认模型：

- `OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2`

> 用户口中的 “gpt-image-2” 在当前可用生态里，更稳妥的实际 slug 是环境变量里这个可配置值。请以你自己账户下可见模型为准。

### 3) 视频生成

通过 OpenRouter `POST /api/v1/videos` 提交任务，
再通过 `GET /api/v1/videos/{jobId}` 轮询状态。

默认模型：

- `OPENROUTER_VIDEO_MODEL=bytedance/seedance-2.0`

> `Seedance 2.0` 的具体 slug 依赖你账户实际可见模型列表，当前实现已经把它改成环境变量，不把 slug 硬编码死在界面逻辑里。

---

## 环境变量

复制 `.env.example`：

```bash
cp .env.example .env.local
```

最少建议配置：

```bash
AI_COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1
AI_COMPATIBLE_API_KEY=...
STORYBOARD_MODEL=openai/gpt-4.1-mini

OPENROUTER_API_KEY=...
OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2
OPENROUTER_VIDEO_MODEL=bytedance/seedance-2.0
```

如果只想先演示产品流程，不配 key 也能跑，只是会进入 demo fallback。

---

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

生产构建：

```bash
npm run lint
npm run build
npm run start
```

---

## 目录说明

```
src/
├── app/
│   ├── api/
│   │   ├── storyboard/route.ts
│   │   ├── images/route.ts
│   │   ├── videos/route.ts
│   │   └── videos/[jobId]/route.ts
│   ├── workspace/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   └── workspace/
└── lib/
    ├── ai/
    │   ├── provider.ts
    │   ├── storyboard.ts
    │   ├── image.ts
    │   ├── video.ts
    │   └── schemas.ts
    └── demo.ts
```

旧的静态 landing page 文件已移动到：

```
legacy-static/
```

方便后续对比历史版本或回看早期文案。

---

## 后续可继续做的方向

- 接真实案例素材与品牌资产
- 给视频任务补版本复核 / 导出交付单
- 接表单 / CRM / webhook 线索收集
- 做登录态与项目列表
- 接入 Vercel 部署和自定义域名

---

## License

当前仓库未单独声明开源许可证。若后续需要公开开源，建议补充 LICENSE 文件。
