import HomeStory from '@/components/home/HomeStory'
import { homeData } from '@/components/home/data'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <main>
        <HomeStory data={homeData()} />
      </main>
      <Footer />
    </>
  )
}
