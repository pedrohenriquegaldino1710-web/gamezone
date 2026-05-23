"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface Server {
  id: string
  name: string
  icon_url: string | null
}

interface ServerSidebarProps {
  userId: string
  selectedServer: string | null
  onServerSelect: (serverId: string | null) => void
}

export function ServerSidebar({ userId, selectedServer, onServerSelect }: ServerSidebarProps) {
  const [servers, setServers] = useState<Server[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newServerName, setNewServerName] = useState("")
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    // Buscar servidores que o usuario e membro ou dono
    const { data: memberServers } = await supabase
      .from("server_members")
      .select("server_id")
      .eq("user_id", userId)

    const { data: ownedServers } = await supabase
      .from("servers")
      .select("id, name, icon_url")
      .eq("owner_id", userId)

    const memberServerIds = memberServers?.map(m => m.server_id) || []
    
    if (memberServerIds.length > 0) {
      const { data: joinedServers } = await supabase
        .from("servers")
        .select("id, name, icon_url")
        .in("id", memberServerIds)

      const allServers = [...(ownedServers || []), ...(joinedServers || [])]
      const uniqueServers = allServers.filter((server, index, self) =>
        index === self.findIndex(s => s.id === server.id)
      )
      setServers(uniqueServers)
    } else {
      setServers(ownedServers || [])
    }
  }

  const createServer = async () => {
    if (!newServerName.trim()) return
    setCreating(true)

    const { data, error } = await supabase
      .from("servers")
      .insert({
        name: newServerName.trim(),
        owner_id: userId
      })
      .select()
      .single()

    if (!error && data) {
      // Criar canal geral automaticamente
      await supabase.from("channels").insert({
        server_id: data.id,
        name: "geral",
        type: "text"
      })

      setServers([...servers, data])
      setNewServerName("")
      setShowCreateModal(false)
      onServerSelect(data.id)
    }

    setCreating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <div className="w-[72px] bg-muted flex flex-col items-center py-3 gap-2">
      {/* Botao Home/Amigos */}
      <button
        onClick={() => onServerSelect(null)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
          selectedServer === null
            ? "bg-primary text-primary-foreground rounded-xl"
            : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
        }`}
        title="Mensagens Diretas"
      >
        <Users size={24} />
      </button>

      <div className="w-8 h-0.5 bg-border rounded-full my-1" />

      {/* Lista de Servidores */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto">
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => onServerSelect(server.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
              selectedServer === server.id
                ? "bg-primary text-primary-foreground rounded-xl"
                : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            title={server.name}
          >
            {server.icon_url ? (
              <img
                src={server.icon_url}
                alt={server.name}
                className="w-full h-full object-cover rounded-inherit"
              />
            ) : (
              <span className="font-bold text-lg">
                {server.name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        ))}

        {/* Botao Criar Servidor */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-2xl bg-card text-green-500 flex items-center justify-center transition-all hover:rounded-xl hover:bg-green-500 hover:text-white"
          title="Criar Servidor"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Botoes inferiores */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
        <Link
          href="/dashboard"
          className="w-12 h-12 rounded-2xl bg-card text-foreground flex items-center justify-center transition-all hover:rounded-xl hover:bg-muted-foreground/20"
          title="Configuracoes"
        >
          <Settings size={20} />
        </Link>
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-2xl bg-card text-destructive flex items-center justify-center transition-all hover:rounded-xl hover:bg-destructive hover:text-destructive-foreground"
          title="Trocar de Conta"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Modal Criar Servidor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Criar Servidor</h2>
            <input
              type="text"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              placeholder="Nome do servidor"
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createServer}
                disabled={creating || !newServerName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
