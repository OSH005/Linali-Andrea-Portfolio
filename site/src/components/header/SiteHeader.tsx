'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import { clamp01, lerp, out3, seg } from '@/lib/motion/ease'
import { fabricPath, nextHidden, stitchDash } from './header'
import { useHeader } from './HeaderContext'
import PhoneMenu, { LINKS } from './PhoneMenu'
import styles from './SiteHeader.module.css'

type Mark = { src: string; width: number; height: number }

/** One strip of fabric on every page: monogram · chapter roll · links · Motion. Static and centred without JS. */
export default function SiteHeader({ mark, linkedin }: { mark: Mark; linkedin: string }) {
  const { on, setOn } = useMotion()
  const { state, chapters, active: chosen } = useHeader()
  const path = usePathname() ?? ''
  const active = chosen ?? (path.startsWith('/collections') ? 'Collections' : path.startsWith('/about') ? 'About' : undefined)
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const fillRef = useRef<SVGPathElement>(null)
  const stRef = useRef<SVGPathElement>(null)
  const chapRef = useRef<HTMLDivElement>(null)
  const rollRef = useRef<HTMLDivElement>(null)
  const magnet = useRef(false)
  const t0 = useRef<number | null>(null) // sew-in start; kept so toggling Motion doesn't unsew the pill

  useEffect(() => {
    const nav = navRef.current!, bar = barRef.current!, svg = svgRef.current!, fill = fillRef.current!, st = stRef.current!
    bar.classList.add(styles.live) // the SVG fabric takes over from the CSS pill
    magnet.current = on && matchMedia('(hover: hover) and (pointer: fine)').matches
    t0.current ??= gsap.ticker.time
    const start = t0.current
    const n = { v: 0, py: -1, hid: false, hk: 0, cf: state.current.chapter, dk: +state.current.dark, d: '', dash: '' }
    const to = (a: number, b: number, k: number) => (on ? lerp(a, b, k) : b) // motion off: snap, never ease

    const tick = (time: number, dtMs: number) => {
      const s = state.current, y = window.scrollY, dt = dtMs / 1000
      // reads
      const bw = bar.offsetWidth, bh = bar.offsetHeight, W = nav.clientWidth
      const mid = nav.getBoundingClientRect().top + bh / 2
      const footTop = document.getElementById('contact')?.getBoundingClientRect().top ?? Infinity
      const chap = chapRef.current, roll = rollRef.current
      const spans = roll ? ([...roll.children] as HTMLElement[]) : []
      const widths = spans.map((sp) => sp.offsetWidth)
      // state: other pages sew the pill on over the first second; the home stage drives dock itself
      const dock = on ? Math.min(s.dock, out3(clamp01((time - start - 0.1) / 1))) : 1
      n.v = on && n.py >= 0 && dt ? lerp(n.v, (y - n.py) / dt, 0.12) : 0
      n.py = y
      // never hide a focused link (WCAG 2.4.11)
      n.hid = on && !nav.contains(document.activeElement) && nextHidden(n.hid, { y, v: n.v, docked: dock >= 1, keep: window.innerHeight * 0.5 })
      n.hk = to(n.hk, +n.hid, 0.14)
      n.cf = to(n.cf, Math.min(s.chapter, Math.max(0, spans.length - 1)), 0.14)
      n.dk = to(n.dk, s.dark || footTop < mid ? 1 : 0, 0.08)
      // writes
      bar.style.setProperty('--dock', dock.toFixed(3))
      bar.style.setProperty('--dk', n.dk.toFixed(3))
      if (chap && roll && spans.length) {
        const c0 = Math.floor(n.cf), c1 = Math.min(spans.length - 1, c0 + 1)
        chap.style.width = lerp(widths[c0], widths[c1], n.cf - c0) * dock + 'px'
        roll.style.transform = `translateY(${-n.cf * 18}px)`
        spans.forEach((sp, i) => (sp.style.opacity = String(1 - Math.min(1, Math.abs(i - n.cf) * 1.3))))
      }
      const tx = on && s.x0 != null ? lerp(s.x0 - (W - bw) / 2, 0, dock) : 0
      bar.style.transform = `translate(${tx.toFixed(1)}px, ${(-n.hk * (bh + 44)).toFixed(1)}px)`
      // the fabric breathes a little at rest and ripples with scroll speed
      const amp = on ? (0.35 + Math.min(3.6, Math.abs(n.v) / 450)) * dock : 0, ph = time * 1.5 + y * 0.005
      const d = fabricPath(bw, bh, 0, amp, ph)
      if (d !== n.d) {
        n.d = d
        svg.setAttribute('width', String(bw))
        svg.setAttribute('height', String(bh))
        fill.setAttribute('d', d)
        st.setAttribute('d', fabricPath(bw, bh, 4, amp * 0.85, ph))
      }
      // sewn on one stitch at a time; once sewn, the stitches run with the scroll
      const dash = stitchDash(seg(dock, 0.35, 1))
      if (dash !== n.dash) {
        n.dash = dash
        st.setAttribute('stroke-dasharray', dash)
        st.setAttribute('stroke-dashoffset', '0')
      }
      if (on && dash === stitchDash(1)) st.setAttribute('stroke-dashoffset', (-(y * 0.002) % 0.8333).toFixed(4))
    }
    // keyboard focus arriving in a hidden header reveals it at once
    const reveal = () => void ((n.hid = false), (n.hk = 0))
    nav.addEventListener('focusin', reveal)
    // shortcut: with motion off the ticker still runs every frame (a few style writes) so night and chapter changes apply; switch to scroll/set-driven updates if it shows in profiles
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      nav.removeEventListener('focusin', reveal)
    }
  }, [on, state])

  // magnetic pull toward the cursor, at most 6px (fine pointers, motion on)
  const pull = (e: React.MouseEvent<HTMLElement>) => {
    if (!magnet.current) return
    const el = e.currentTarget, r = el.getBoundingClientRect()
    const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2
    el.style.transform = `translate(${Math.max(-6, Math.min(6, dx * 0.3))}px, ${Math.max(-4, Math.min(4, dy * 0.4))}px)`
  }
  const rest = (e: React.MouseEvent<HTMLElement>) => void (e.currentTarget.style.transform = '')
  const magnetic = { onMouseMove: pull, onMouseLeave: rest }

  return (
    <header ref={navRef} className={styles.nav}>
      {/* the first Tab stop: past the story (the home stage is long) to the contact card */}
      <a href="#contact" className={`label ${styles.skip}`}>
        Skip to contact
      </a>
      <nav ref={barRef} className={styles.bar} aria-label="Main">
        <svg ref={svgRef} className={styles.nb} aria-hidden="true">
          <path ref={fillRef} className={styles.fill} />
          <path ref={stRef} className={styles.stitch} pathLength={100} fill="none" />
        </svg>
        <a href="/" className={styles.mono} aria-label="Linali Andrea, home" {...magnetic}>
          {/* the trimmed monogram as a mask, inked in the pill's colour (brown by day, cream by night) */}
          <span className={styles.mark} style={{ maskImage: `url(${mark.src})`, aspectRatio: `${mark.width} / ${mark.height}` }} />
        </a>
        {chapters.some(Boolean) && (
          <div ref={chapRef} className={styles.chap} aria-hidden="true">
            <div ref={rollRef} className={styles.roll}>
              {chapters.map((c, i) => {
                const [, num, text] = c.match(/^(\d+|—)\s+(.*)$/) ?? [c, '', c]
                return (
                  <span key={i}>
                    {num && <b>{num}</b>}
                    {text}
                  </span>
                )
              })}
            </div>
          </div>
        )}
        <div className={styles.links}>
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} className={styles.lk} aria-current={label === active ? 'page' : undefined} {...magnetic}>
              {label}
            </a>
          ))}
          <button type="button" className={styles.mo} aria-label="Motion" aria-pressed={on} onClick={() => setOn(!on)}>
            Motion {on ? 'on' : 'off'}
          </button>
        </div>
        <PhoneMenu linkedin={linkedin} active={active} on={on} setOn={setOn} />
      </nav>
    </header>
  )
}
