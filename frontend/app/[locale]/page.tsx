import Hero from '@/components/sections/Hero/Hero'
import About from '@/components/sections/About/About'
import Projects from '@/components/sections/Projects/Projects'
import Skills from '@/components/sections/Skills/Skills'
import Experience from '@/components/sections/Experience/Experience'
import Thinking from '@/components/sections/Thinking/Thinking'
import AIAssistant from '@/components/sections/AIAssistant/AIAssistant'
import BackToTop from '@/components/widgets/BackToTop'

export default function Home() {
  return (
    <>
      <BackToTop />
      <main data-portfolio-page className="min-h-screen">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Thinking />
        <AIAssistant />
      </main>
    </>
  )
}
