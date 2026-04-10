"use client"

import { Check, X, Crown, Sparkles, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Gratis",
    price: "R$ 0",
    period: "/mes",
    description: "Para quem quer comecar",
    icon: Star,
    features: [
      { text: "Acesso a comunidade", included: true },
      { text: "Conteudo basico", included: true },
      { text: "Suporte por email", included: true },
      { text: "Torneios exclusivos", included: false },
      { text: "Conteudo premium", included: false },
      { text: "Badges especiais", included: false },
    ],
    cta: "Criar Conta",
    href: "/auth/sign-up",
    popular: false,
  },
  {
    name: "Premium",
    price: "R$ 19,90",
    period: "/mes",
    description: "O mais popular",
    icon: Crown,
    features: [
      { text: "Tudo do plano Gratis", included: true },
      { text: "Torneios exclusivos", included: true },
      { text: "Conteudo premium", included: true },
      { text: "Badge Premium", included: true },
      { text: "Suporte prioritario", included: true },
      { text: "Descontos em parceiros", included: false },
    ],
    cta: "Assinar Premium",
    href: "/checkout?plan=premium",
    popular: true,
  },
  {
    name: "Ultimate",
    price: "R$ 39,90",
    period: "/mes",
    description: "Para os mais dedicados",
    icon: Sparkles,
    features: [
      { text: "Tudo do plano Premium", included: true },
      { text: "Acesso antecipado", included: true },
      { text: "Badge Ultimate exclusivo", included: true },
      { text: "Mentoria com pros", included: true },
      { text: "Descontos em parceiros", included: true },
      { text: "Sorteios mensais", included: true },
    ],
    cta: "Assinar Ultimate",
    href: "/checkout?plan=ultimate",
    popular: false,
  },
]

export function Plans() {
  return (
    <section id="planos" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu <span className="text-primary">Plano</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Desbloqueie todo o potencial do GamerZone com nossos planos premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <plan.icon className={`w-12 h-12 mx-auto mb-4 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-lg text-center font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-accent"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
