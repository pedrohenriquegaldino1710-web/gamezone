import Link from "next/link"
import { Gamepad2, Zap, Trophy } from "lucide-react"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-4 mb-6">
          <Gamepad2 className="w-12 h-12 text-primary animate-pulse" />
          <Zap className="w-12 h-12 text-accent animate-pulse delay-100" />
          <Trophy className="w-12 h-12 text-primary animate-pulse delay-200" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
          Bem-vindo ao{" "}
          <span className="text-primary">GamerZone</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Sua comunidade gamer definitiva! Acesse conteudo exclusivo, participe de torneios 
          e conecte-se com outros jogadores.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/#planos" 
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Ver Planos
          </Link>
          <Link 
            href="/auth/sign-up" 
            className="border border-primary text-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/10 transition-colors"
          >
            Criar Conta Gratis
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <Gamepad2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Conteudo Exclusivo</h3>
            <p className="text-muted-foreground text-sm">
              Acesse guias, dicas e estrategias dos melhores jogadores
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Trophy className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Torneios</h3>
            <p className="text-muted-foreground text-sm">
              Participe de competicoes e ganhe premios incriveis
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comunidade</h3>
            <p className="text-muted-foreground text-sm">
              Conecte-se com milhares de gamers apaixonados
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
