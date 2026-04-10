"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Menu, X, User as UserIcon, LogOut } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          GamerZone
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/#planos" className="text-foreground/80 hover:text-primary transition-colors">
            Planos
          </Link>
          <Link href="/#sobre" className="text-foreground/80 hover:text-primary transition-colors">
            Sobre
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
              >
                <UserIcon size={18} />
                Minha Conta
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground/80 hover:text-destructive transition-colors"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/auth/sign-up" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-background border-t border-border px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/#planos" className="text-foreground/80 hover:text-primary transition-colors">
            Planos
          </Link>
          <Link href="/#sobre" className="text-foreground/80 hover:text-primary transition-colors">
            Sobre
          </Link>
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
              >
                <UserIcon size={18} />
                Minha Conta
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground/80 hover:text-destructive transition-colors text-left"
              >
                <LogOut size={18} />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/auth/sign-up" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
              >
                Criar Conta
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
