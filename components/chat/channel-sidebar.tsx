"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Hash, Volume2, Plus, Settings, UserPlus, ChevronDown } from "lucide-react"

interface Channel {
  id: string
  name: string
  type: "text" | "voice"
}

interface Server {
  id: string
  name: string
  owner_id: string
}

interface ChannelSidebarProps {
  serverId: string
  selectedChannel: string | null
  onChannelSelect: (channelId: string) => void
}

export function ChannelSidebar({ serverId, selectedChannel, onChannelSelect }: ChannelSidebarProps) {
  const [server, setServer] = useState<Server | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [inviteNickname, setInviteNickname] = useState("")
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadServerAndChannels()
  }, [serverId])

  const loadServerAndChannels = async () => {
    // Carregar servidor
    const { data: serverData } = await supabase
      .from("servers")
      .select("*")
      .eq("id", serverId)
      .single()

    if (serverData) {
      setServer(serverData)
    }

    // Carregar canais
    const { data: channelsData } = await supabase
      .from("channels")
      .select("*")
      .eq("server_id", serverId)
      .order("created_at", { ascending: true })

    if (channelsData) {
      setChannels(channelsData)
      // Selecionar primeiro canal se nenhum selecionado
      if (!selectedChannel && channelsData.length > 0) {
        onChannelSelect(channelsData[0].id)
      }
    }
  }

  const createChannel = async () => {
    if (!newChannelName.trim()) return
    setCreating(true)

    const { data, error } = await supabase
      .from("channels")
      .insert({
        server_id: serverId,
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
        type: "text"
      })
      .select()
      .single()

    if (!error && data) {
      setChannels([...channels, data])
      setNewChannelName("")
      setShowCreateModal(false)
      onChannelSelect(data.id)
    }

    setCreating(false)
  }

  const inviteUser = async () => {
    if (!inviteNickname.trim()) return
    setInviting(true)
    setInviteMessage("")

    // Buscar usuario pelo nickname
    const { data: userData } = await supabase
      .from("profiles")
      .select("id, nickname")
      .ilike("nickname", inviteNickname.trim())
      .single()

    if (!userData) {
      setInviteMessage("Usuario nao encontrado")
      setInviting(false)
      return
    }

    // Verificar se ja e membro
    const { data: existingMember } = await supabase
      .from("server_members")
      .select("id")
      .eq("server_id", serverId)
      .eq("user_id", userData.id)
      .single()

    if (existingMember) {
      setInviteMessage("Usuario ja e membro do servidor")
      setInviting(false)
      return
    }

    // Adicionar como membro
    const { error } = await supabase
      .from("server_members")
      .insert({
        server_id: serverId,
        user_id: userData.id
      })

    if (!error) {
      setInviteMessage(`${userData.nickname} foi adicionado ao servidor!`)
      setInviteNickname("")
    } else {
      setInviteMessage("Erro ao adicionar usuario")
    }

    setInviting(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header do Servidor */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{server?.name || "Servidor"}</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Acoes do Servidor */}
      <div className="px-2 py-2 flex gap-1">
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserPlus size={14} />
          Convidar
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={14} />
          Canal
        </button>
      </div>

      {/* Lista de Canais */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Canais de Texto
          </span>
        </div>
        {channels.filter(c => c.type === "text").map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
              selectedChannel === channel.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Hash size={18} />
            <span className="truncate">{channel.name}</span>
          </button>
        ))}

        {channels.filter(c => c.type === "voice").length > 0 && (
          <>
            <div className="mb-2 mt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Canais de Voz
              </span>
            </div>
            {channels.filter(c => c.type === "voice").map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
                  selectedChannel === channel.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Volume2 size={18} />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Modal Criar Canal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Criar Canal</h2>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Nome do canal"
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
                onClick={createChannel}
                disabled={creating || !newChannelName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Convidar Usuario */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Convidar Usuario</h2>
            <input
              type="text"
              value={inviteNickname}
              onChange={(e) => setInviteNickname(e.target.value)}
              placeholder="Nickname do usuario"
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              autoFocus
            />
            {inviteMessage && (
              <p className={`text-sm mb-4 ${inviteMessage.includes("adicionado") ? "text-green-500" : "text-destructive"}`}>
                {inviteMessage}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteMessage("")
                }}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={inviteUser}
                disabled={inviting || !inviteNickname.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {inviting ? "Convidando..." : "Convidar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
