import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Plans } from "@/components/plans"
import { About } from "@/components/about"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Plans />
      <About />
      <Footer />
    </main>
  )
}
