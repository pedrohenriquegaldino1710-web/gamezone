"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Gamepad2, Copy, Check, QrCode, Loader2, AlertCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

// Dados dos planos
const plansData: Record<string, { name: string; price: number; priceFormatted: string }> = {
  premium: {
    name: "Premium",
    price: 19.90,
    priceFormatted: "R$ 19,90",
  },
  ultimate: {
    name: "Ultimate",
    price: 39.90,
    priceFormatted: "R$ 39,90",
  },
}

// Seu código Pix (coloque seu Pix copia e cola aqui)
const PIX_CODE = "00020126580014br.gov.bcb.pix0136seu-email@email.com5204000053039865802BR5913SEU NOME6008CIDADE62070503***6304XXXX"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "premium"
  const plan = plansData[planId] || plansData.premium

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [error, setError] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirect=/checkout?plan=${planId}`)
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase.auth, router, planId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Erro ao copiar. Selecione e copie manualmente.")
    }
  }

  const handleConfirmPayment = async () => {
    if (!user) return
    
    setSubmitting(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("orders").insert({
        user_id: user.id,
        plan: planId,
        price: plan.price,
        status: "pending",
        pix_code: PIX_CODE,
      })

      if (insertError) {
        setError("Erro ao criar pedido. Tente novamente.")
        return
      }

      setOrderCreated(true)
    } catch {
      setError("Erro ao processar. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (orderCreated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-8">
            <Gamepad2 className="w-8 h-8" />
            GamerZone
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Pedido Enviado!</h1>
            
            <p className="text-muted-foreground mb-6">
              Seu pedido do plano <span className="text-primary font-semibold">{plan.name}</span> foi 
              registrado. Aguarde a confirmacao do pagamento em ate 24 horas.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Voce recebera uma notificacao quando seu plano for ativado.
            </p>

            <div className="space-y-3">
              <Link 
                href="/dashboard" 
                className="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Ver Meus Pedidos
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

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Gamepad2 className="w-8 h-8" />
            GamerZone
          </Link>
          <h1 className="text-2xl font-bold">Assinar {plan.name}</h1>
          <p className="text-muted-foreground mt-2">
            Complete o pagamento via Pix
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Resumo do pedido */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plano {plan.name}</span>
              <span className="text-xl font-bold text-primary">{plan.priceFormatted}/mes</span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-xl mb-4">
              <QrCode className="w-32 h-32 text-gray-800" />
            </div>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code com o app do seu banco
            </p>
          </div>

          {/* Pix Copia e Cola */}
          <div>
            <label className="block text-sm font-medium mb-2">Pix Copia e Cola</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={PIX_CODE}
                readOnly
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-sm font-mono truncate"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Instrucoes */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-3">Como pagar:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                Abra o app do seu banco (Nubank, etc.)
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                Escaneie o QR Code ou use o Pix Copia e Cola
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                Confirme o pagamento de {plan.priceFormatted}
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">4.</span>
                Clique em &quot;Ja Paguei&quot; abaixo
              </li>
            </ol>
          </div>

          {/* Botao de confirmacao */}
          <button
            onClick={handleConfirmPayment}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Ja Paguei
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Apos clicar em &quot;Ja Paguei&quot;, seu pedido sera analisado e confirmado em ate 24 horas.
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Cancelar e voltar
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
