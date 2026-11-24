import { renderToStaticMarkup } from 'react-dom/server'
import { getCollections } from '@/lib/collections'
import CollectionPage from './page'

// the hero (the View Transition target) is the lead photo; the shoot gallery below must not show it a second time
test.each(getCollections().filter((c) => c.lead.from === 'shoot').map((c) => c.slug))('%s: the hero photo appears once', async (slug) => {
  const html = renderToStaticMarkup(await CollectionPage({ params: Promise.resolve({ slug }) } as never))
  const hero = /class="[^"]*vt-photo[^"]*"[\s\S]*?<img[^>]*src="([^"]+)"/.exec(html)![1]
  const file = hero.split('/').pop()!.replace(/-\d+\.\w+$/, '')
  const srcs = [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1].split('/').pop()!.replace(/-\d+\.\w+$/, ''))
  expect(srcs.filter((s) => s === file)).toHaveLength(1)
})
