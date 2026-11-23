import site from '../../../content/site.json'
import ContactForm from '../ContactForm'
import styles from './sections.module.css'

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`wrap ${styles.footerInner}`}>
        <h2 className="display">{site.contact.closing}</h2>
        <ContactForm endpoint={process.env.NEXT_PUBLIC_CONTACT_ENDPOINT} />
        <p className={styles.fine}>
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
