import Link from "next/link"
import { Gamepad2, AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-8">
          <Gamepad2 className="w-8 h-8" />
          GamerZone
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Erro de Autenticacao</h1>
          
          <p className="text-muted-foreground mb-6">
            Ocorreu um erro durante a autenticacao. 
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>

          <div className="space-y-3">
            <Link 
              href="/auth/login" 
              className="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </Link>
            <Link 
              href="/" 
              className="block w-full border border-border py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              Voltar para o Inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
