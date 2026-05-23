"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ServerSidebar } from "@/components/chat/server-sidebar"
import { ChannelSidebar } from "@/components/chat/channel-sidebar"
import { ChatArea } from "@/components/chat/chat-area"
import { FriendsList } from "@/components/chat/friends-list"
import { Loader2 } from "lucide-react"

export type View = "server" | "friends" | "dm"

export interface Profile {
  id: string
  nickname: string
  email: string
  plan: string
  is_admin: boolean
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>("friends")
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [selectedDM, setSelectedDM] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Verificar se email foi confirmado
      if (!user.email_confirmed_at) {
        router.push("/auth/confirm-email")
        return
      }

      setUser(user)

      // Buscar perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleServerSelect = (serverId: string | null) => {
    if (serverId === null) {
      setCurrentView("friends")
      setSelectedServer(null)
      setSelectedChannel(null)
    } else {
      setCurrentView("server")
      setSelectedServer(serverId)
      setSelectedDM(null)
    }
  }

  const handleDMSelect = (friendId: string) => {
    setCurrentView("dm")
    setSelectedDM(friendId)
    setSelectedServer(null)
    setSelectedChannel(null)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Coluna 1: Lista de Servidores */}
      <ServerSidebar
        userId={user.id}
        selectedServer={selectedServer}
        onServerSelect={handleServerSelect}
      />

      {/* Coluna 2: Canais ou Lista de Amigos */}
      <div className="w-60 bg-card border-r border-border flex flex-col">
        {currentView === "friends" || currentView === "dm" ? (
          <FriendsList
            userId={user.id}
            profile={profile}
            selectedDM={selectedDM}
            onDMSelect={handleDMSelect}
          />
        ) : (
          <ChannelSidebar
            serverId={selectedServer!}
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
          />
        )}
      </div>

      {/* Coluna 3: Area de Chat */}
      <ChatArea
        userId={user.id}
        profile={profile}
        currentView={currentView}
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        selectedDM={selectedDM}
      />
    </div>
  )
}
