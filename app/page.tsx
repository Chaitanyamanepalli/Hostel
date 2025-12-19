"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/ui/fade-in"
import {
  Building2,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Bell,
  MessageSquare,
  Sparkles,
  Lock,
  Loader2,
} from "lucide-react"

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      setShouldRedirect(true)
      const roleRoutes: Record<UserRole, string> = {
        student: "/student",
        warden: "/warden",
        admin: "/admin",
      }
      setTimeout(() => router.push(roleRoutes[user.role]), 100)
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                HostelFlow
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 px-3 py-1 hover:scale-105 transition-transform cursor-default">
                <Sparkles className="h-3 w-3 mr-1" />
                Modern Hostel Management
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Simplify Hostel Operations with{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                HostelFlow
              </span>
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              A complete platform to manage issues, conduct polls, and streamline communication between students,
              wardens, and administrators. Built for the modern hostel experience.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-12 px-8 group">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 hover:scale-105 transition-transform">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
            <motion.p
              className="text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              No credit card required • Free forever
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage your hostel</h2>
            <p className="text-muted-foreground text-lg">Powerful features designed for efficiency and simplicity</p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Issue Tracking",
                description: "Report and resolve maintenance issues instantly. Track progress in real-time with automated notifications.",
                color: "text-yellow-500",
                gradient: "from-yellow-500/20 to-yellow-500/0",
              },
              {
                icon: MessageSquare,
                title: "Smart Polls",
                description: "Create polls and gather feedback from residents. Make data-driven decisions for your hostel.",
                color: "text-blue-500",
                gradient: "from-blue-500/20 to-blue-500/0",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Get insights into hostel operations with detailed analytics and visualizations.",
                color: "text-green-500",
                gradient: "from-green-500/20 to-green-500/0",
              },
              {
                icon: Bell,
                title: "Real-time Notifications",
                description: "Stay updated with instant notifications for important events and updates.",
                color: "text-purple-500",
                gradient: "from-purple-500/20 to-purple-500/0",
              },
              {
                icon: Users,
                title: "User Management",
                description: "Efficiently manage students, wardens, and staff with role-based access control.",
                color: "text-pink-500",
                gradient: "from-pink-500/20 to-pink-500/0",
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "Enterprise-grade security with encrypted data and secure authentication.",
                color: "text-red-500",
                gradient: "from-red-500/20 to-red-500/0",
              },
            ].map((feature, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-xl hover:border-primary/20 transition-all h-full group">
                    <CardContent className="pt-6 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <motion.div
                        className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${feature.color} relative`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="h-6 w-6" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for every role</h2>
            <p className="text-muted-foreground text-lg">Tailored experiences for students, wardens, and admins</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Students",
                icon: Users,
                features: ["Report issues quickly", "Vote on hostel polls", "Track issue resolution", "Stay updated with notifications"],
                color: "from-blue-500/10 to-blue-500/0",
              },
              {
                role: "Wardens",
                icon: Shield,
                features: ["Manage all issues", "Create and monitor polls", "View analytics", "Communicate with students"],
                color: "from-green-500/10 to-green-500/0",
              },
              {
                role: "Admins",
                icon: Building2,
                features: ["Manage multiple hostels", "User management", "System-wide analytics", "Complete control"],
                color: "from-purple-500/10 to-purple-500/0",
              },
            ].map((role, index) => (
              <FadeIn key={index} delay={index * 0.15}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-border/50 bg-card backdrop-blur hover:shadow-xl hover:border-primary/20 transition-all h-full group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <CardContent className="pt-6 relative z-10">
                      <motion.div
                        className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <role.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-4">{role.role}</h3>
                      <ul className="space-y-3">
                        {role.features.map((feature, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to transform your hostel management?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join hundreds of hostels already using HostelFlow</p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-12 px-8">
            <Link href="/signup">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">HostelFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 HostelFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
