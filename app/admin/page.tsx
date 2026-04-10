"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Users,
  DollarSign,
  AlertTriangle
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

type Order = {
  id: string
  user_id: string
  plan: string
  price: number
  status: string
  created_at: string
  confirmed_at: string | null
  profiles?: {
    nickname: string | null
    email: string | null
  }
}

type Profile = {
  is_admin: boolean
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
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

      // Verificar se e admin
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
      
      if (!profileData?.is_admin) {
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)

      // Carregar todos os pedidos
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:user_id (
            nickname,
            email
          )
        `)
        .order("created_at", { ascending: false })
      
      if (ordersData) {
        setOrders(ordersData)
      }

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleConfirm = async (orderId: string, userId: string, plan: string) => {
    if (!user) return
    setProcessingId(orderId)

    try {
      // Atualizar status do pedido
      await supabase
        .from("orders")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id,
        })
        .eq("id", orderId)

      // Atualizar plano do usuario
      await supabase
        .from("profiles")
        .update({ plan })
        .eq("id", userId)

      // Atualizar lista local
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "confirmed", confirmed_at: new Date().toISOString() }
            : order
        )
      )
    } catch (err) {
      console.error("Erro ao confirmar:", err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (orderId: string) => {
    if (!user) return
    setProcessingId(orderId)

    try {
      await supabase
        .from("orders")
        .update({
          status: "rejected",
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id,
        })
        .eq("id", orderId)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "rejected", confirmed_at: new Date().toISOString() }
            : order
        )
      )
    } catch (err) {
      console.error("Erro ao rejeitar:", err)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente
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

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Voce nao tem permissao para acessar esta pagina.</p>
          <Link 
            href="/dashboard"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>
      </main>
    )
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const confirmedOrders = orders.filter((o) => o.status === "confirmed")
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.price, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-destructive" />
              <span className="text-xl font-bold">Painel Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Estatisticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-muted-foreground">Pendentes</span>
            </div>
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">Confirmados</span>
            </div>
            <div className="text-3xl font-bold">{confirmedOrders.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Receita Total</span>
            </div>
            <div className="text-3xl font-bold">
              R$ {totalRevenue.toFixed(2).replace(".", ",")}
            </div>
          </div>
        </div>

        {/* Pedidos Pendentes */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pedidos Pendentes ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-yellow-500/30 rounded-xl p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {order.profiles?.nickname || order.profiles?.email || "Usuario"}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Plano: <span className="capitalize font-medium">{order.plan}</span>
                        {" • "}
                        R$ {order.price.toFixed(2).replace(".", ",")}
                        {" • "}
                        {new Date(order.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(order.id, order.user_id, order.plan)}
                        disabled={processingId === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        disabled={processingId === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Pedidos */}
        <div>
          <h2 className="text-xl font-bold mb-4">Todos os Pedidos</h2>
          {orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">Usuario</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Plano</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Valor</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {order.profiles?.nickname || "Usuario"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.profiles?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">{order.plan}</td>
                        <td className="px-4 py-3">
                          R$ {order.price.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
