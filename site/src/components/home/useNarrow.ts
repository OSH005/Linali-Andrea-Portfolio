import { useSyncExternalStore } from 'react'

const query = () => matchMedia('(min-width: 1024px)')
const subscribe = (f: () => void) => {
  const m = query()
  m.addEventListener('change', f)
  return () => m.removeEventListener('change', f)
}
/** Below 1024 wide (the phone and tablet layouts). False on the server and before hydration, so phone-only parts render on the client only. */
export const useNarrow = () => useSyncExternalStore(subscribe, () => !query().matches, () => false)
