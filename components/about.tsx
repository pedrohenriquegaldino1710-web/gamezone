import { Users, Award, Globe, Heart } from "lucide-react"

export function About() {
  return (
    <section id="sobre" className="py-20 px-4 bg-card/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sobre o <span className="text-primary">GamerZone</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Somos uma comunidade apaixonada por games, criada por gamers para gamers. 
            Nossa missao e conectar jogadores e proporcionar a melhor experiencia gaming possivel.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <Users className="w-10 h-10 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">10k+</div>
            <div className="text-sm text-muted-foreground">Membros</div>
          </div>
          <div className="text-center">
            <Award className="w-10 h-10 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-muted-foreground">Torneios</div>
          </div>
          <div className="text-center">
            <Globe className="w-10 h-10 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">Paises</div>
          </div>
          <div className="text-center">
            <Heart className="w-10 h-10 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">99%</div>
            <div className="text-sm text-muted-foreground">Satisfacao</div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border">
          <h3 className="text-xl font-bold mb-4 text-center">Nossa Historia</h3>
          <p className="text-muted-foreground text-center text-pretty">
            O GamerZone nasceu em 2024 com um sonho simples: criar um espaco onde gamers 
            pudessem se conectar, aprender e crescer juntos. Hoje, somos uma das maiores 
            comunidades gaming do Brasil, oferecendo conteudo exclusivo, torneios emocionantes 
            e uma comunidade acolhedora para todos os niveis de jogadores.
          </p>
        </div>
      </div>
    </section>
  )
}
