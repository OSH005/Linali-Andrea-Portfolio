import ContactForm from './ContactForm'
import { getSite } from '@/lib/site'
import styles from './Footer.module.css'

/** The contact card. 'flow' is the next block after <main>, so it never covers content; 'rise' is animated by the home stage. */
export default function Footer({ variant }: { variant: 'flow' | 'rise' }) {
  return (
    <footer id="contact" className={styles.foot} data-variant={variant}>
      <h2 className={styles.title}>{getSite().contact.closing}</h2>
      <ContactForm endpoint={process.env.NEXT_PUBLIC_CONTACT_ENDPOINT} />
    </footer>
  )
}
