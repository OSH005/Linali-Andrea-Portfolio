'use client'
import GlassFolder from './glass-folder/GlassFolder'
import type { MediaImage } from '@/lib/media'
import styles from './Chapter.module.css'

type Props = {
  folders: { label: string; pages: string[] }[]
  pages: MediaImage[]
  palette: { ground: string; ink: string; accent: string }
}

export default function StudioTable({ folders, pages, palette }: Props) {
  return (
    <div className={styles.studio}>
      {folders.map((f, i) => {
        const files = f.pages
          .map((id) => pages.find((p) => p.id === id))
          .filter((p): p is MediaImage => Boolean(p))
          .map((p) => ({ name: `Pages ${p.id}–${String(Number(p.id) + 1).padStart(2, '0')}`, image: p.src, href: p.zoom }))
        return (
          <GlassFolder
            key={f.label}
            label={f.label}
            tone="light"
            action="none"
            appear={false}
            seed={i + 1}
            art={{ style: 'marble', colors: [palette.ground, palette.ink, palette.accent], scale: 1.2, gloss: 0.3 }}
            files={files}
            width={300}
          />
        )
      })}
    </div>
  )
}
