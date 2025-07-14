import type { WorkStore } from '../app-render/work-async-storage.external'

import {
  workUnitAsyncStorage,
  type PrerenderStore,
} from '../app-render/work-unit-async-storage.external'
import { makeHangingPromise } from '../dynamic-rendering-utils'
import { InvariantError } from '../../shared/lib/invariant-error'

export function createServerPathnameForMetadata(
  underlyingPathname: string,
  workStore: WorkStore
): Promise<string> {
  const workUnitStore = workUnitAsyncStorage.getStore()
  if (!workUnitStore) {
    return createRenderPathname(underlyingPathname)
  }

  switch (workUnitStore.type) {
    case 'prerender':
    case 'prerender-client':
    case 'prerender-legacy': {
      return createPrerenderPathname(
        underlyingPathname,
        workStore,
        workUnitStore
      )
    }
    default:
      return createRenderPathname(underlyingPathname)
  }
}

function createPrerenderPathname(
  underlyingPathname: string,
  workStore: WorkStore,
  prerenderStore: PrerenderStore
): Promise<string> {
  const fallbackParams = workStore.fallbackRouteParams
  if (fallbackParams && fallbackParams.size > 0) {
    switch (prerenderStore.type) {
      case 'prerender':
        return makeHangingPromise<string>(
          prerenderStore.renderSignal,
          '`pathname`'
        )
      case 'prerender-client':
        throw new InvariantError(
          'createPrerenderPathname was called inside a client component scope.'
        )
      default:
        throw new InvariantError(
          'createPrerenderPathname cannot be called with the prerender-legacy work unit type.'
        )
    }
  }

  // We don't have any fallback params so we have an entirely static safe params object
  return Promise.resolve(underlyingPathname)
}

function createRenderPathname(underlyingPathname: string): Promise<string> {
  return Promise.resolve(underlyingPathname)
}
