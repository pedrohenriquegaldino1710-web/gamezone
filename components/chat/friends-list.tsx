"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Search, MessageCircle, Check, X, Clock } from "lucide-react"
import type { Profile } from "@/app/chat/page"

interface Friend {
  id: string
  friend_id: string
  friend_profile: {
    id: string
    nickname: string
    email: string
  }
  status: "pending" | "accepted"
  is_requester: boolean
}

interface FriendsListProps {
  userId: string
  profile: Profile
  selectedDM: string | null
  onDMSelect: (friendId: string) => void
}

export function FriendsList({ userId, profile, selectedDM, onDMSelect }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchNickname, setSearchNickname] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"online" | "all" | "pending">("all")
  const supabase = createClient()

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    // Buscar amizades onde o usuario e o requester
    const { data: sentRequests } = await supabase
      .from("friendships")
      .select(`
        id,
        friend_id,
        status,
        profiles!friendships_friend_id_fkey(id, nickname, email)
      `)
      .eq("user_id", userId)

    // Buscar amizades onde o usuario e o friend
    const { data: receivedRequests } = await supabase
      .from("friendships")
      .select(`
        id,
        user_id,
        status,
        profiles!friendships_user_id_fkey(id, nickname, email)
      `)
      .eq("friend_id", userId)

    const allFriends: Friend[] = []
    const pending: Friend[] = []

    // Processar requests enviados
    sentRequests?.forEach((req: any) => {
      const friend: Friend = {
        id: req.id,
        friend_id: req.friend_id,
        friend_profile: req.profiles,
        status: req.status,
        is_requester: true
      }
      if (req.status === "accepted") {
        allFriends.push(friend)
      } else {
        pending.push(friend)
      }
    })

    // Processar requests recebidos
    receivedRequests?.forEach((req: any) => {
      const friend: Friend = {
        id: req.id,
        friend_id: req.user_id,
        friend_profile: req.profiles,
        status: req.status,
        is_requester: false
      }
      if (req.status === "accepted") {
        allFriends.push(friend)
      } else {
        pending.push(friend)
      }
    })

    setFriends(allFriends)
    setPendingRequests(pending)
  }

  const sendFriendRequest = async () => {
    if (!searchNickname.trim()) return
    setSearching(true)
    setSearchMessage("")

    // Buscar usuario pelo nickname
    const { data: userData } = await supabase
      .from("profiles")
      .select("id, nickname")
      .ilike("nickname", searchNickname.trim())
      .single()

    if (!userData) {
      setSearchMessage("Usuario nao encontrado")
      setSearching(false)
      return
    }

    if (userData.id === userId) {
      setSearchMessage("Voce nao pode adicionar a si mesmo")
      setSearching(false)
      return
    }

    // Verificar se ja existe amizade
    const { data: existingFriendship } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(user_id.eq.${userId},friend_id.eq.${userData.id}),and(user_id.eq.${userData.id},friend_id.eq.${userId})`)
      .single()

    if (existingFriendship) {
      setSearchMessage("Voce ja tem uma solicitacao com este usuario")
      setSearching(false)
      return
    }

    // Enviar solicitacao
    const { error } = await supabase
      .from("friendships")
      .insert({
        user_id: userId,
        friend_id: userData.id,
        status: "pending"
      })

    if (!error) {
      setSearchMessage(`Solicitacao enviada para ${userData.nickname}!`)
      setSearchNickname("")
      loadFriends()
    } else {
      setSearchMessage("Erro ao enviar solicitacao")
    }

    setSearching(false)
  }

  const acceptFriendRequest = async (friendshipId: string) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId)

    loadFriends()
  }

  const rejectFriendRequest = async (friendshipId: string) => {
    await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)

    loadFriends()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
        <Search size={18} className="text-muted-foreground mr-2" />
        <span className="font-semibold">Mensagens Diretas</span>
      </div>

      {/* Botao Adicionar Amigo */}
      <div className="px-2 py-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <UserPlus size={16} />
          Adicionar Amigo
        </button>
      </div>

      {/* Tabs */}
      <div className="px-2 flex gap-1 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            activeTab === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            activeTab === "pending" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pendentes
          {pendingRequests.length > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-1.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {activeTab === "pending" ? (
          pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma solicitacao pendente
            </p>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {request.friend_profile.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {request.friend_profile.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={10} />
                    {request.is_requester ? "Aguardando resposta" : "Quer ser seu amigo"}
                  </p>
                </div>
                {!request.is_requester && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="p-1.5 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="p-1.5 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : friends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Voce ainda nao tem amigos. Adicione alguem!
          </p>
        ) : (
          friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onDMSelect(friend.friend_id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors ${
                selectedDM === friend.friend_id
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {friend.friend_profile.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">
                  {friend.friend_profile.nickname}
                </p>
              </div>
              <MessageCircle size={16} className="text-muted-foreground" />
            </button>
          ))
        )}
      </div>

      {/* Info do Usuario */}
      <div className="px-2 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">
              {profile.nickname?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile.nickname}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Amigo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-2">Adicionar Amigo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Digite o nickname do seu amigo para enviar uma solicitacao
            </p>
            <input
              type="text"
              value={searchNickname}
              onChange={(e) => setSearchNickname(e.target.value)}
              placeholder="Nickname do usuario"
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              autoFocus
            />
            {searchMessage && (
              <p className={`text-sm mb-4 ${searchMessage.includes("enviada") ? "text-green-500" : "text-destructive"}`}>
                {searchMessage}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSearchMessage("")
                }}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={sendFriendRequest}
                disabled={searching || !searchNickname.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {searching ? "Enviando..." : "Enviar Solicitacao"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
