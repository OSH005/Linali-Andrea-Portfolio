import type { CSSProperties } from 'react'
import type { HomeData, Pic } from '../data'
import type { Paint } from '../timeline'
import { DESK_STRIP, FOAM, LABELS, LOOK_SHOTS, PHONE_STRIP, SP, type Ref } from '../story'
import { clamp01, inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { driftCardH, leadFrame, penMask, skew, stripItems, stripX } from '../geometry'
import { Words, rise } from '../words'
import { useNarrow } from '../useNarrow'
import Photo from '../Photo'
import s from '../HomeStory.module.css'
import d from './Drift.module.css'

const pad2 = (n: number) => String(n).padStart(2, '0')
/** Panel widths in screen heights (mockup `data-w`). */
const PANEL_W = { sp0: 1.05, sp3: 0.95, look: 0.66, end: 0.85 }

/** Ref registry (see Opening.tsx). The phone track, captions and look index register themselves (they mount on the client only). */
export const dom = {} as {
  root: HTMLElement | null; layer: HTMLElement; intro: HTMLElement; logo: HTMLElement; dlabel: HTMLElement; track: HTMLElement
  stitch: SVGElement; line: SVGElement; prog: HTMLElement; foam: HTMLElement; foamImg: HTMLElement
  ptrack: HTMLElement | null; caps: HTMLElement | null; idx: HTMLElement | null
}
const grab = (n: HTMLElement | null) => {
  dom.root = n
  if (!n) return
  const q = (c: string) => n.querySelector<HTMLElement>(`.${c}`)!
  const stitch = n.querySelector<SVGElement>(`.${d.stitch}`)!
  Object.assign(dom, {
    layer: q(d.layer), intro: q(d.intro), logo: n.querySelector('h2')!, dlabel: q(d.dtitle).querySelector('p')!, track: q(d.track),
    stitch, line: stitch.firstElementChild, prog: q(d.prog), foam: q(d.foam), foamImg: q(d.foam).querySelector('img')!,
  })
}
const reg = (k: 'ptrack' | 'caps' | 'idx') => (n: HTMLElement | null) => void (dom[k] = n)

const ar = (p: Pic) => ({ '--ar': p.width / p.height }) as CSSProperties
const pw = (w: number) => ({ '--w': w }) as CSSProperties

/** Drift: the logo, then the strip in order (photos, her four sentences, the six looks, the end panel). On a phone stage: a photo-only strip with captions under it and a six-look index. */
export default function Drift({ data, stage }: { data: HomeData; stage: boolean }) {
  const narrow = useNarrow()
  const photo = (ref: Ref): Pic => (typeof ref === 'number' ? data.dr.shots[ref] : data.inspiration[+ref.slice(4)])
  const href = `/collections/${data.dr.slug}/`
  const logo = { ...data.dr.logoBrown, alt: '' }
  const look = (i: number) => (
    <>
      <span className={`${s.bignum} ${d.bignum}`} aria-hidden="true">{pad2(i + 1)}</span>
      <p className={`label ${d.lookLabel}`}>Look {pad2(i + 1)} / 06</p>
      <h3 className={`title-section ${d.lookname}`}><Words text={`Look ${pad2(i + 1)}`} on={stage} /></h3>
      <p className={`narr ${d.lookdesc}`}><Words text={data.dr.looks[i]} on={stage} /></p>
    </>
  )
  const end = (
    <>
      <h3 className={`title-section ${d.endTitle}`}><Words text="Six looks, six models." on={stage} /></h3>
      <a className={`${s.cta} ${d.cta}`} href={href}>Explore the collection →</a>
    </>
  )
  const phone = stage && narrow

  return (
    <section id="drift" ref={grab} className={`${s.scene} ${d.dr}`} aria-labelledby="home-dr">
      <div className={`wrap ${d.layer}`}>
        <div className={d.intro}>
          <div className={d.veil} aria-hidden="true" />
          <div className={d.dtitle}>
            <h2 id="home-dr" className={`${s.logoTitle} ${d.logo}`}>
              <Photo p={data.dr.logoBrown} sizes="(min-width: 1024px) 24vw, 240px" className={d.brown} />
              <Photo p={data.dr.logoCream} sizes="290px" className={d.cream} />
            </h2>
            <p className="label">{LABELS.dr}</p>
          </div>
        </div>
        <ol className={`${s.strip} ${d.track}`}>
          {DESK_STRIP.map((it, i) => {
            if (it.kind === 'img') {
              const p = photo(it.ref)
              return (
                <li key={i} className={`${s.card} ${d.card}`} style={ar(p)} data-ar={p.width / p.height} data-id={it.id}>
                  <Photo p={p} sizes="(min-width: 1024px) 150vh, 90vw" />
                  {it.overlay != null && (
                    <>
                      <span className={d.shade} aria-hidden="true" />
                      <p className={`narr ${d.overlay}`}><Words text={SP[it.overlay]} on={stage} /></p>
                    </>
                  )}
                </li>
              )
            }
            if (it.kind === 'text')
              return (
                <li key={i} className={`${s.panel} ${d.panel}`} style={pw(it.sp ? PANEL_W.sp3 : PANEL_W.sp0)} data-w={it.sp ? PANEL_W.sp3 : PANEL_W.sp0} data-id={it.id}>
                  {it.sp === 0 && <Photo p={logo} sizes="330px" className={d.plogo} />}
                  <p className={`narr ${d.ptext}`}><Words text={SP[it.sp]} on={stage} /></p>
                </li>
              )
            if (it.kind === 'look')
              return (
                <li key={i} className={`${s.panel} ${d.panel}`} style={pw(PANEL_W.look)} data-w={PANEL_W.look} data-id={it.id}>
                  {look(it.look)}
                </li>
              )
            return (
              <li key={i} className={`${s.panel} ${d.panel}`} style={pw(PANEL_W.end)} data-w={PANEL_W.end} data-id="end">
                <p className="label">{LABELS.drift} · {LABELS.dr}</p>
                {end}
              </li>
            )
          })}
        </ol>
        {/* phone stage (client only): photos only, the caption of the photo in focus under the strip, the six-look index */}
        {phone && (
          <>
            <div ref={reg('ptrack')} className={d.ptrack}>
              {PHONE_STRIP.map(([ref, cap], i) => {
                const p = photo(ref)
                return (
                  <div key={i} className={d.card} style={ar(p)} data-ar={p.width / p.height} data-id={cap}>
                    <Photo p={p} sizes="70vw" />
                  </div>
                )
              })}
            </div>
            <div ref={reg('caps')} className={d.caps}>
              <div className={d.cap} data-k="lead">
                <p className="label">{LABELS.drift}</p>
                <h3 className={`title-section ${d.endTitle}`}><Words text="My graduate collection" on /></h3>
              </div>
              {SP.map((t, i) => (
                <div key={t} className={d.cap} data-k={`sp${i}`}>
                  {i === 0 && <Photo p={logo} sizes="132px" className={d.plogo} />}
                  <p className={`narr ${d.ptext}`}><Words text={t} on /></p>
                </div>
              ))}
              {LOOK_SHOTS.map((_, i) => <div key={i} className={d.cap} data-k={`look${i}`}>{look(i)}</div>)}
              <div className={d.cap} data-k="end">{end}</div>
            </div>
            <div ref={reg('idx')} className={d.idx} aria-hidden="true">
              {LOOK_SHOTS.map(([a], i) => (
                <span key={a}>
                  <Photo p={{ ...photo(a), alt: '' }} sizes="90px" />
                  <b>{pad2(i + 1)}</b>
                  <i />
                </span>
              ))}
            </div>
          </>
        )}
        <svg className={d.stitch} preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="1" x2="100%" y2="1" />
        </svg>
        <p className={`label ${d.prog}`} aria-hidden="true" />
      </div>
      <div className={d.foam} aria-hidden="true">
        <Photo p={data.inspiration[FOAM]} sizes="100vw" />
      </div>
    </section>
  )
}

type Item = { start: number; size: number; id?: string; out?: boolean; c: HTMLElement; img: HTMLElement | null; ov: HTMLElement | null; texts: HTMLElement[]; bn: HTMLElement | null }
let laid = '', items: Item[] = [], len = 0, ch = 0, vel = 0, px = 0, capKey: string | null = null, capT = 0, idxK = 0
const vis = (el: Element, on: boolean) => void ((el as HTMLElement).style.visibility = on ? '' : 'hidden')

/** Lays the strip out from its items' shapes (data attributes, not layout reads): cards are the card height × their photo's ratio, panels a share of the screen height. */
function layout(track: HTMLElement, W: number, H: number, phone: boolean) {
  const key = `${W}x${H}x${+phone}`
  if (key === laid && items[0]?.c.parentElement === track) return
  laid = key
  ch = driftCardH(H, phone)
  const cs = [...track.children] as HTMLElement[]
  const q = (c: HTMLElement, k: string) => c.querySelector<HTMLElement>(`.${k}`)
  items = stripItems(cs.map((c) => c.dataset.id), cs.map((c) => (c.dataset.ar ? ch * +c.dataset.ar : H * +c.dataset.w!)), phone ? 10 : 14).map((it, i) => {
    const c = cs[i]
    return { ...it, c, img: c.querySelector('img'), ov: q(c, d.overlay), texts: [...c.querySelectorAll<HTMLElement>(`.${d.ptext}, .${d.lookname}, .${d.lookdesc}, .${d.endTitle}`)], bn: q(c, d.bignum) }
  })
  len = items.at(-1)!.start + items.at(-1)!.size
}

/** Foam washes over Lunelle and away; Drift's six models fill the screen while the script logo is written on, shrink into the first card, and the strip runs sideways with the scroll (mockup "FOAM" + "DRIFT"). */
export const paint: Paint = (y, r, { phone, W, H, dt, now }) => {
  const { layer, intro, logo, dlabel, track, stitch, line, prog, foam, foamImg, caps, idx } = dom
  const fo = seg(y, ...r.at.foam), up = inOut(seg(fo, 0, 0.5)), off = inOut(seg(fo, 0.5, 1))
  vis(foam, fo > 0 && fo < 1)
  foam.style.clipPath = off > 0 ? `ellipse(170% ${lerp(130, 0, off)}% at 50% -30%)` : `ellipse(170% ${up * 130}% at 50% 135%)`
  foamImg.style.transform = `translateY(${lerp(8, -8, fo)}%) scale(1.1)`
  vis(layer, fo > 0.5 || y > r.at.foam[1])

  const strip = phone ? dom.ptrack : track
  if (!strip?.isConnected) return // the phone strip mounts a frame after a resize to phone
  layout(strip, W, H, phone)

  // the opening: the six models full screen, shrinking into the first card
  const din = seg(y, ...r.at.dIn), shrink = inOut(seg(din, 0.62, 1)), lead = items[0]
  const f = leadFrame(W, H, lead.size, ch, phone ? 64 : 0, shrink)
  lead.c.style.clipPath = f.clip
  lead.img!.style.transform = `translate(${f.dx}px, ${f.dy}px) scale(${f.scale * lerp(1.16, 1.04, out3(seg(din, 0, 0.5)))})`
  vis(intro, din < 1)
  intro.style.opacity = String(1 - seg(din, 0.62, 0.85))
  logo.style.maskImage = logo.style.webkitMaskImage = penMask(din)
  logo.style.transform = `translateY(${(1 - out3(seg(din, 0.04, 0.5))) * 18}px) scale(${lerp(1.04, 1, out3(seg(din, 0.04, 0.6)))})`
  dlabel.style.opacity = String(seg(din, 0.36, 0.5))

  // the strip: sideways with the scroll, leaning with its speed; the cards after the lead wait for it to shrink
  const x = stripX(seg(y, ...r.at.strip), len, W), shift = lerp(W, lead.size, shrink) - lead.size
  strip.style.transform = `translateX(${-x}px)`
  vel = lerp(vel, dt ? (x - px) / W : 0, 0.25)
  px = x
  const sk = skew(vel)
  let best = lead, bestD = Infinity
  items.forEach((it, i) => {
    const size = i ? it.size : lead.size + shift, start = i ? it.start + shift : 0
    const rel = (start + size / 2 - x - W / 2) / W
    if (Math.abs(rel) < Math.abs(bestD)) [bestD, best] = [rel, it]
    // off screen: not focusable (tabbing to a link there would scroll the hidden-overflow layer out of step with the strip)
    const out = start + size - x <= 0 || start - x >= W
    if (out !== it.out) vis(it.c, !(it.out = out))
    if (Math.abs(rel) > 1.6) return
    if (it.c.dataset.ar) {
      if (i) it.img!.style.transform = `translateX(${rel * (phone ? -3.5 : -4.5)}%) scale(1.08)`
      it.c.style.transform = `${i ? `translateX(${shift}px) ` : ''}skewX(${-sk}deg)`
      if (it.ov) rise(it.ov, clamp01((0.55 - Math.abs(rel)) / 0.3), 0.02)
    } else {
      it.c.style.transform = shift ? `translateX(${shift}px)` : ''
      const k = clamp01((0.6 - Math.abs(rel)) / 0.3)
      it.texts.forEach((el) => rise(el, k, 0.02))
      if (it.bn) it.bn.style.transform = `translateX(${rel * 30}%)`
    }
  })

  if (phone && caps && idx) {
    // the caption of the photo in focus rises under the strip
    const key = din < 0.9 ? null : (best.id ?? null)
    if (key !== capKey) [capKey, capT] = [key, now]
    const kk = clamp01((now - capT) / 0.75)
    ;[...caps.children].forEach((c) => {
      const on = (c as HTMLElement).dataset.k === capKey
      vis(c, on)
      if (!on) return
      rise(c, kk, 0.025)
      const bn = c.querySelector<HTMLElement>(`.${d.bignum}`)
      if (bn) bn.style.transform = `translateX(${bestD * -100}px)`
    })
    // the six-look index: hidden under the logo caption, the current look lifted with a stitch under its number
    const cur = capKey?.startsWith('look') ? +capKey.slice(4) : -1
    idxK = lerp(idxK, din >= 0.9 && capKey !== 'sp0' ? 1 : 0, 0.15)
    idx.style.opacity = String(idxK)
    idx.style.transform = `translateY(${(1 - idxK) * 14}px)`
    ;[...idx.children].forEach((t, i) => {
      const [im, b, st] = [t.querySelector('img')!, t.querySelector('b')!, t.querySelector('i')!]
      im.style.opacity = String(cur < 0 ? 0.8 : i === cur ? 1 : 0.42)
      ;(t as HTMLElement).style.transform = `translateY(${i === cur ? -6 : 0}px)`
      st.style.opacity = i === cur ? '1' : '0'
      b.style.opacity = i === cur ? '1' : '0.55'
    })
  }

  // the running stitch moves with the strip (an SVG paint property, no layout)
  line.style.strokeDashoffset = String(-x * 0.6)
  stitch.style.opacity = String(seg(din, 0.8, 1))
  const li = best.id?.startsWith('look') ? +best.id.slice(4) : -1
  const t = !phone && din >= 1 && li >= 0 ? `Look ${pad2(li + 1)} / 06` : ''
  if (prog.textContent !== t) prog.textContent = t
}
