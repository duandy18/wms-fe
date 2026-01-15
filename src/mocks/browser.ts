import { setupWorker } from 'msw/browser'
import { outboundHandlers } from './handlers/outbound'
import { taskHandlers } from './handlers/tasks'
import { batchHandlers } from './handlers/batches'
import { moveHandlers } from './handlers/moves'

// Phase 2：Snapshot 已切为真实后端事实视图（warehouse+item+batch 分行）
// 禁止使用旧 snapshot mock，避免隐性汇总结构复活

export const worker = setupWorker(
  ...outboundHandlers,
  ...taskHandlers,
  ...batchHandlers,
  ...moveHandlers,
)
