'use client'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

export type Active = 'Collections' | 'About'
export interface HeaderState {
  chapter: number
  chapters: string[]
  dock: number
  dark: boolean
  x0: number | null
  active?: Active
}
interface Header {
  /** Scenes may call this every frame: it writes a ref the header's ticker reads; only `chapters`/`active` re-render. */
  set(partial: Partial<HeaderState>): void
  state: RefObject<HeaderState>
  chapters: string[]
  active?: Active
}

const initial = (): HeaderState => ({ chapter: 0, chapters: [''], dock: 1, dark: false, x0: null })
const loose = { current: initial() }
const HeaderContext = createContext<Header>({ set: (p) => void Object.assign(loose.current, p), state: loose, chapters: loose.current.chapters })

export function HeaderProvider({ children }: { children: ReactNode }) {
  const state = useRef(initial())
  const [shape, setShape] = useState<Pick<HeaderState, 'chapters' | 'active'>>({ chapters: state.current.chapters })
  const set = useCallback((p: Partial<HeaderState>) => {
    Object.assign(state.current, p)
    if (!p.chapters && !('active' in p)) return
    const { chapters, active } = state.current
    setShape((s) => (s.chapters.join('\n') === chapters.join('\n') && s.active === active ? s : { chapters, active }))
  }, [])
  const value = useMemo(() => ({ set, state, ...shape }), [set, shape])
  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
}

export const useHeader = () => useContext(HeaderContext)
