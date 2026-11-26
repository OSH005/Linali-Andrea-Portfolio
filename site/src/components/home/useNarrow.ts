import { useSyncExternalStore } from 'react'

/** A media query as a hook; false on the server and before hydration. */
const media = (q: string, not = false) => {
  const subscribe = (f: () => void) => {
    const m = matchMedia(q)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }
  return () => useSyncExternalStore(subscribe, () => matchMedia(q).matches !== not, () => false)
}
/** Below 1024 wide (the phone and tablet layouts). False on the server and before hydration, so phone-only parts render on the client only. */
export const useNarrow = media('(min-width: 1024px)', true)
/** A phone turned sideways (below 1024 wide, under 600 tall): spec 5.7 leaves it undesigned, and the home stage needs a portrait screen. */
export const useShortLandscape = media('(max-width: 1023.98px) and (max-height: 599.98px) and (orientation: landscape)')
