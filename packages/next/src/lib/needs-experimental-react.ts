import type { NextConfig } from '../server/config-shared'

export function needsExperimentalReact(config: NextConfig) {
  const { taint, viewTransition, routerBFCache } = config.experimental || {}
  return Boolean(taint || viewTransition || routerBFCache)
}
