---
title: 'AI 管家：Ollama + Home Assistant 本地部署'
description: '数据不出家的智能家居对话助手'
pubDate: '2026-08-25'
---

给智能家居加一个能对话的"管家"，其实很简单：**本地大模型 + Home Assistant**，数据全程不出家门。

## 方案

- **Ollama**：本地跑大模型（qwen2.5:3b，中文友好）
- **Home Assistant**：设备中枢 + 对话入口（Assist）
- 一条 Docker Compose 搞定

## 效果

- 「把客厅灯关了」→ AI 理解 → 关灯 → 回复"已关客厅灯"
- 「我出门了」→ 执行离家场景（关灯、布防）
- 门忘了关 → 主动提醒

## 关键点

1. Ollama 开放局域网访问（`OLLAMA_HOST=0.0.0.0`）
2. HA 配置里把 `openai_conversation` 指向本地 Ollama，key 随便填
3. 提示词写清楚你家有哪些设备、能做什么

## 为什么不用云端大模型

隐私。家里设备状态、生活习惯都是敏感数据，本地模型虽然聪明程度差点，但数据 100% 在自己手里。qwen2.5:3b 日常控制指令足够用了。
