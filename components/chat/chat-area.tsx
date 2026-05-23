"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Send, Hash, Users, AtSign } from "lucide-react"
import type { View, Profile } from "@/app/chat/page"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  sender_profile?: {
    nickname: string
  }
}

interface ChatAreaProps {
  userId: string
  profile: Profile
  currentView: View
  selectedServer: string | null
  selectedChannel: string | null
  selectedDM: string | null
}

export function ChatArea({
  userId,
  profile,
  currentView,
  selectedServer,
  selectedChannel,
  selectedDM
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [channelName, setChannelName] = useState("")
  const [dmProfile, setDmProfile] = useState<{ nickname: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (currentView === "server" && selectedChannel) {
      loadChannelMessages()
      loadChannelName()
      subscribeToChannelMessages()
    } else if (currentView === "dm" && selectedDM) {
      loadDMMessages()
      loadDMProfile()
      subscribeToDMMessages()
    } else {
      setMessages([])
    }
  }, [currentView, selectedChannel, selectedDM])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChannelName = async () => {
    if (!selectedChannel) return
    const { data } = await supabase
      .from("channels")
      .select("name")
      .eq("id", selectedChannel)
      .single()
    if (data) setChannelName(data.name)
  }

  const loadDMProfile = async () => {
    if (!selectedDM) return
    const { data } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", selectedDM)
      .single()
    if (data) setDmProfile(data)
  }

  const loadChannelMessages = async () => {
    if (!selectedChannel) return

    const { data } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles!messages_user_id_fkey(nickname)
      `)
      .eq("channel_id", selectedChannel)
      .order("created_at", { ascending: true })
      .limit(100)

    if (data) {
      setMessages(data.map((msg: any) => ({
        ...msg,
        sender_profile: msg.profiles
      })))
    }
  }

  const loadDMMessages = async () => {
    if (!selectedDM) return

    const { data } = await supabase
      .from("direct_messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        profiles!direct_messages_sender_id_fkey(nickname)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedDM}),and(sender_id.eq.${selectedDM},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true })
      .limit(100)

    if (data) {
      setMessages(data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.sender_id,
        sender_profile: msg.profiles
      })))
    }
  }

  const subscribeToChannelMessages = () => {
    if (!selectedChannel) return

    const channel = supabase
      .channel(`channel-${selectedChannel}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${selectedChannel}`
        },
        async (payload) => {
          // Buscar perfil do sender
          const { data: profileData } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", payload.new.user_id)
            .single()

          const newMsg: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            sender_profile: profileData || { nickname: "Usuario" }
          }
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToDMMessages = () => {
    if (!selectedDM) return

    const channel = supabase
      .channel(`dm-${userId}-${selectedDM}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages"
        },
        async (payload) => {
          const newMsg = payload.new as any
          // Verificar se a mensagem e para esta conversa
          if (
            (newMsg.sender_id === userId && newMsg.receiver_id === selectedDM) ||
            (newMsg.sender_id === selectedDM && newMsg.receiver_id === userId)
          ) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("nickname")
              .eq("id", newMsg.sender_id)
              .single()

            const msg: Message = {
              id: newMsg.id,
              content: newMsg.content,
              created_at: newMsg.created_at,
              user_id: newMsg.sender_id,
              sender_profile: profileData || { nickname: "Usuario" }
            }
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)

    if (currentView === "server" && selectedChannel) {
      await supabase.from("messages").insert({
        channel_id: selectedChannel,
        user_id: userId,
        content: newMessage.trim()
      })
    } else if (currentView === "dm" && selectedDM) {
      await supabase.from("direct_messages").insert({
        sender_id: userId,
        receiver_id: selectedDM,
        content: newMessage.trim()
      })
    }

    setNewMessage("")
    setSending(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    }
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  }

  // Estado vazio - Amigos selecionado mas nenhum DM
  if (currentView === "friends") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <Users size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bem-vindo ao GamerZone Chat!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Selecione um amigo para iniciar uma conversa ou crie/entre em um servidor para conversar com grupos.
        </p>
      </div>
    )
  }

  // Estado vazio - Servidor selecionado mas nenhum canal
  if (currentView === "server" && !selectedChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <Hash size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum canal selecionado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Selecione um canal para ver as mensagens ou crie um novo canal.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header do Chat */}
      <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
        {currentView === "server" ? (
          <div className="flex items-center gap-2">
            <Hash size={20} className="text-muted-foreground" />
            <span className="font-semibold">{channelName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AtSign size={20} className="text-muted-foreground" />
            <span className="font-semibold">{dmProfile?.nickname || "Carregando..."}</span>
          </div>
        )}
      </div>

      {/* Area de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              {currentView === "server" ? (
                <Hash size={32} className="text-primary" />
              ) : (
                <AtSign size={32} className="text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {currentView === "server"
                ? `Bem-vindo ao #${channelName}!`
                : `Conversa com ${dmProfile?.nickname || "..."}`}
            </h3>
            <p className="text-muted-foreground text-sm">
              {currentView === "server"
                ? "Este e o comeco deste canal. Envie a primeira mensagem!"
                : "Este e o comeco da sua conversa. Diga oi!"}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate =
              index === 0 ||
              formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(message.created_at)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className="flex gap-3 hover:bg-muted/30 px-2 py-1 rounded transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {message.sender_profile?.nickname?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-medium text-sm ${message.user_id === userId ? "text-primary" : "text-foreground"}`}>
                        {message.sender_profile?.nickname || "Usuario"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-foreground/90 break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              currentView === "server"
                ? `Enviar mensagem em #${channelName}`
                : `Enviar mensagem para ${dmProfile?.nickname || "..."}`
            }
            className="flex-1 px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
