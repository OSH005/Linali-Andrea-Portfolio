'use client'
import { useState } from 'react'
import styles from './ContactForm.module.css'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm({ endpoint }: { endpoint?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('_gotcha')) return setStatus('sent') // bots fill the hidden field; tell them nothing
    if (!endpoint) {
      setError('The contact form isn’t connected yet.')
      return setStatus('error')
    }
    setStatus('sending')
    try {
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
    } catch {
      setError('Your message didn’t send. Check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') return <p className={styles.thanks}>Thank you. I’ll reply soon.</p>

  return (
    <form className={styles.form} onSubmit={onSubmit} method="post" action={endpoint}>
      <label className={styles.field}>
        <span className="label">Name</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label className={styles.field}>
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className={`${styles.field} ${styles.wide}`}>
        <span className="label">Message</span>
        <textarea name="message" required rows={5} />
      </label>
      <label className={styles.trap} aria-hidden="true">
        Leave empty <input name="_gotcha" tabIndex={-1} autoComplete="off" />
      </label>
      {status === 'error' && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button type="submit" className={`pressable ${styles.send}`} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
