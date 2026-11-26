'use client'
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import { clamp01, out3, spring } from '@/lib/motion/ease'
import type { Site } from '@/lib/site'
import { fitFontSize } from './fit'
import { OFFSET, PIECES, TILT } from './pieces'
import s from './PatternMat.module.css'

const TAPE = 'M6 96 C60 106 120 96 150 70 C175 48 160 18 130 22 C108 25 112 52 138 52'

/**
 * Skills (spec 8.3, mockup `a-skills`): her skills as paper pattern pieces on her cutting mat. Laid out (tilted, offset,
 * seam allowance sewn) in CSS, so it reads the same without JS. With motion, the pieces drop onto the mat in turn when it
 * comes into view and their seam allowances sew in. The skills' type steps down until it clears the cut marking.
 */
export default function PatternMat({ skills }: { skills: Site['skills'] }) {
  const { on } = useMotion()
  const mat = useRef<HTMLDivElement>(null)
  const total = skills.reduce((n, g) => n + g.skills.length, 0)

  // fit the type: measured on mount, when fonts arrive and on resize; never per frame
  useEffect(() => {
    let live = true
    const figs = [...mat.current!.querySelectorAll('figure')]
    const fit = () =>
      live &&
      figs.forEach((f) => {
        const ul = f.querySelector('ul')!, cut = f.querySelector<HTMLElement>('[data-cut]')!, lis = [...ul.children] as HTMLElement[]
        const lim = cut.offsetTop > ul.offsetTop ? cut.offsetTop - 6 : f.clientHeight * 0.9
        // too tall for the piece, or a skill no longer fits on one line
        const over = (px: number) => {
          ul.style.fontSize = `${px}px`
          return ul.offsetTop + ul.offsetHeight > lim || lis.some((li) => li.offsetHeight > px * 1.45 * 1.5 + 2)
        }
        over(fitFontSize(over))
      })
    // a resize burst (dragging a window edge, rotating) fits once, on the next frame
    let raf = 0
    const onResize = () => void (raf ||= requestAnimationFrame(() => ((raf = 0), fit())))
    fit()
    document.fonts?.ready.then(fit)
    addEventListener('resize', onResize)
    return () => {
      live = false
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
    }
  }, [])

  // the drop and the seam: a few seconds on the ticker once the mat is in view, then the CSS layout takes over again.
  // A layout effect: the pieces are hidden before the browser paints, so the laid-out mat never flashes first.
  useLayoutEffect(() => {
    if (!on) return
    const figs = [...mat.current!.querySelectorAll<HTMLElement>('figure')]
    const seams = figs.map((f) => f.querySelector<SVGPathElement>('[data-seam]')!)
    const clear = () => {
      figs.forEach((f) => ((f.style.transform = ''), (f.style.opacity = ''), (f.style.willChange = '')))
      seams.forEach((p) => (p.style.strokeDasharray = ''))
    }
    figs.forEach((f) => (f.style.opacity = '0'))
    seams.forEach((p) => (p.style.strokeDasharray = '0 1'))
    let t0 = -1
    const stop = () => {
      gsap.ticker.remove(paint)
      clear()
    }
    const paint = (now: number) => {
      if (t0 < 0) t0 = now
      const t = now - t0
      figs.forEach((f, i) => {
        const k = clamp01((t - i * 0.16) / 1), sp = spring(k), kd = out3(clamp01((t - 0.5 - i * 0.16) / 1.2))
        f.style.transform = `translate3d(0,${((1 - sp) * -40).toFixed(1)}px,0) rotate(${((1 - sp) * 6).toFixed(2)}deg)`
        f.style.opacity = String(clamp01(k * 3))
        seams[i].style.strokeDasharray = kd < 1 ? `${kd.toFixed(3)} 1` : ''
      })
      if (t > 0.5 + 0.16 * 3 + 1.2) stop()
    }
    // when its top is 80% down the screen (or already passed, e.g. a reload further down)
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return
        io.disconnect()
        figs.forEach((f) => (f.style.willChange = 'transform')) // a layer only for the drop
        gsap.ticker.add(paint)
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(mat.current!)
    return () => {
      io.disconnect()
      stop()
    }
  }, [on])

  return (
    <section id="skills" data-chapter="Skills" className={s.skills} aria-labelledby="skills-title">
      <div className={s.sg}>
        <div className={s.s1}>
          <p className="label">Skills</p>
          <h2 id="skills-title" className={`title-section ${s.h2}`}>What I work with</h2>
          <p className={s.hint}>Laid out like pattern pieces on my cutting mat.</p>
        </div>
        <div ref={mat} className={s.mat}>
          <div className={s.ruler} aria-hidden="true" />
          {skills.map((g, i) => {
            const p = PIECES[g.piece]
            const vars = { '--ph': `${p.height}px`, '--cy': `${p.cap[1]}%`, '--bl': `${p.box[0]}%`, '--br': `${p.box[1]}%`, '--rot': `${TILT[i]}deg`, '--oy': `${OFFSET[i]}px` } as CSSProperties
            return (
              <figure key={g.name} className={s.pc} style={vars}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className={s.f} d={p.d} />
                  <path className={s.sa} data-seam="" pathLength={1} d={p.d} transform="translate(5 5) scale(.9)" />
                  {p.fold && <path className={s.fold} d={p.fold} />}
                </svg>
                <figcaption className={`label ${s.cap}`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.g} aria-hidden="true" />
                </figcaption>
                <h3 className={s.name}>{g.name}</h3>
                <ul className={s.list}>
                  {g.skills.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <span className={`label ${s.cut}`} style={p.cutAt} data-cut="">
                  {g.cut}
                </span>
              </figure>
            )
          })}
          <svg className={s.tape} viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true">
            <path className={s.tb} d={TAPE} />
            <path className={s.tk} d={TAPE} />
            <text x="20" y="88">
              {total} SKILLS
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
