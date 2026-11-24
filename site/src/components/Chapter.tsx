import ShootGallery from './ShootGallery'
import PortfolioReader from './PortfolioReader'
import StudioTable from './StudioTable'
import type { Collection } from '@/lib/collections'
import type { CollectionMedia } from '@/lib/media'
import styles from './Chapter.module.css'

type Props = { collection: Collection; media: CollectionMedia; defaultOpen?: boolean }

function Moment({ collection: c, media }: Props) {
  const label = `${c.title} photographs`
  switch (c.moment) {
    case 'ring':
    case 'orbit':
      return (
        <ShootGallery
          images={media.shoot}
          alt={c.alt}
          preset={c.carousel!.preset === 'orbit' ? 'orbit' : 'cylinder'}
          autoplay={c.carousel!.autoplay}
          speed={c.carousel!.speed}
          fadeColor={c.palette.ground}
          label={label}
        />
      )
    case 'gallery':
      return <ShootGallery images={media.shoot} alt={c.alt} preset="cylinder" autoplay="off" initialView="grid" fadeColor={c.palette.ground} label={label} />
    case 'walk':
      return (
        <ol className={styles.walk} data-lenis-prevent aria-label={label}>
          {media.shoot.map((im) => (
            <li key={im.id}>
              <picture>
                <source type="image/avif" srcSet={im.srcset.avif} sizes="(min-width: 1024px) 34vw, 80vw" />
                <img src={im.src} srcSet={im.srcset.webp} sizes="(min-width: 1024px) 34vw, 80vw" alt={c.alt[im.id] ?? ''} loading="lazy" width={im.width} height={im.height} />
              </picture>
            </li>
          ))}
        </ol>
      )
    case 'studio':
      return (
        <div className={styles.studioWrap}>
          <p className="label">In progress</p>
          <StudioTable folders={c.studio!} pages={media.pages} palette={c.palette} />
        </div>
      )
  }
}

export default function Chapter({ collection: c, media, defaultOpen }: Props) {
  const headingId = `${c.slug}-title`
  return (
    <section
      id={c.slug}
      aria-labelledby={headingId}
      className={styles.chapter}
      style={{ '--ground': c.palette.ground, '--ink': c.palette.ink, '--accent': c.palette.accent } as React.CSSProperties}
    >
      <header className={`wrap ${styles.head}`}>
        <h2 id={headingId} className="display">
          {c.title}
          {c.titleNative && (
            <span lang="si" className={styles.native}>
              {c.titleNative}
            </span>
          )}
        </h2>
        <p className={`label ${styles.season}`}>{c.season}</p>
        <p className={styles.concept}>{c.concept}</p>
      </header>
      <div className={`wrap ${styles.moment}`}>
        <Moment collection={c} media={media} />
      </div>
      <div className={`wrap ${styles.readerRow}`}>
        <PortfolioReader title={c.title} pages={media.pages} pageText={c.pageText} background={c.palette.ground} defaultOpen={defaultOpen} />
      </div>
    </section>
  )
}
