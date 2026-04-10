"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  User, 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Settings,
  CreditCard,
  Shield
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type Profile = {
  id: string
  nickname: string | null
  email: string | null
  plan: string
  is_admin: boolean
}

type Order = {
  id: string
  plan: string
  price: number
  status: string
  created_at: string
  confirmed_at: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }
      
      setUser(user)

      // Carregar perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
      }

      // Carregar pedidos
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      
      if (ordersData) {
        setOrders(ordersData)
      }

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Aguardando
          </span>
        )
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Confirmado
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </span>
        )
      default:
        return null
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            Premium
          </span>
        )
      case "ultimate":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            Ultimate
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
            Gratis
          </span>
        )
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

          {/* Perfil */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.nickname || "Gamer"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              {getPlanBadge(profile?.plan || "free")}
            </div>

            {profile?.is_admin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                Painel Admin
              </Link>
            )}
          </div>

          {/* Acoes rapidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
              href="/#planos"
              className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors flex items-center gap-3"
            >
              <CreditCard className="w-6 h-6 text-primary" />
              <div>
                <div className="font-medium">Upgrade</div>
                <div className="text-sm text-muted-foreground">Mude seu plano</div>
              </div>
            </Link>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 opacity-50 cursor-not-allowed">
              <Settings className="w-6 h-6 text-muted-foreground" />
              <div>
                <div className="font-medium">Configuracoes</div>
                <div className="text-sm text-muted-foreground">Em breve</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 opacity-50 cursor-not-allowed">
              <User className="w-6 h-6 text-muted-foreground" />
              <div>
                <div className="font-medium">Editar Perfil</div>
                <div className="text-sm text-muted-foreground">Em breve</div>
              </div>
            </div>
          </div>

          {/* Historico de pedidos */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Historico de Pedidos</h2>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Voce ainda nao tem pedidos</p>
                <Link 
                  href="/#planos"
                  className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Ver Planos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium capitalize">Plano {order.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        R$ {order.price.toFixed(2).replace(".", ",")}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
