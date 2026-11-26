import type { Pic } from '@/components/home/data'
import type { Site } from '@/lib/site'
import InspirationFrames from './InspirationFrames'
import s from './AboutMe.module.css'

/** About me (mockup `a-about`): label, her paragraph, LinkedIn, three facts as a hairline list; then my inspiration. Still text. */
export default function AboutMe({ bio, facts, linkedin, inspiration }: { bio: string; facts: Site['facts']; linkedin: string; inspiration: Pic[] }) {
  return (
    <section id="about-me" data-chapter="About me" className={s.about} aria-labelledby="about-me-title">
      <div className={s.grid}>
        <div className={s.c1}>
          <h2 id="about-me-title" className="label">About me</h2>
        </div>
        <div className={s.c2}>
          <p className="lead">{bio}</p>
          <a className={s.link} href={linkedin} target="_blank" rel="noopener">
            LinkedIn →
          </a>
        </div>
        <dl className={s.c3}>
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="label">{f.label}</dt>
              <dd>
                <b>{f.title}</b>
                <span>{f.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <InspirationFrames images={inspiration} />
    </section>
  )
}
