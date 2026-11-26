import Photo from '@/components/home/Photo'
import type { CollectionData } from './data'
import s from './NextCollection.module.css'

/** The next collection in the journey (after the last: back to the start), name + photo, one link. */
export default function NextCollection({ next }: { next: CollectionData['next'] }) {
  return (
    <section id="next" className={s.next} aria-labelledby="next-label">
      <p id="next-label" className="label">
        {next.label}
      </p>
      <a href={`/collections/${next.slug}/`} className={s.nx}>
        <div>
          <h2 className={s.t}>{next.title}</h2>
          <span className={`label ${s.meta}`}>{next.meta}</span>
        </div>
        <Photo p={next.pic} className={s.pic} sizes="(min-width: 1024px) 10vw, 84px" />
      </a>
    </section>
  )
}
