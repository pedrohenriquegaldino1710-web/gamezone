import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Confirme seu Email</h1>
        
        <p className="text-muted-foreground mb-6">
          Enviamos um link de confirmacao para seu email. 
          Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
        </p>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Nao recebeu o email? Verifique sua pasta de spam ou lixo eletronico.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Ja confirmei, fazer login
            <ArrowRight size={18} />
          </Link>
          
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Voltar para a pagina inicial
          </Link>
        </div>
      </div>
    </main>
  )
}
