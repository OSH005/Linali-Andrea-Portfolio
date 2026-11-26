import ContactForm from './ContactForm'
import { getSite } from '@/lib/site'
import styles from './Footer.module.css'

/** The contact card: the next block in the flow after the page's content, so it never covers it (home: after the stage). */
export default function Footer() {
  return (
    <footer id="contact" className={styles.foot}>
      <h2 className={styles.title}>{getSite().contact.closing}</h2>
      <ContactForm endpoint={process.env.NEXT_PUBLIC_CONTACT_ENDPOINT} />
    </footer>
  )
}
