"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigation } from "@/components/ui/line-loader"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "@/components/ui/theme-provider"
import { 
  Code2, 
  Share2, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Star, 
  Github, 
  Twitter, 
  Linkedin,
  Zap,
  Globe,
  Sparkles,
  Boxes,
  Shield,
  Clock
} from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "AI-Powered Generation",
    description: "Generate realistic mock data using advanced AI algorithms that understand your API patterns",
    gradient: "from-blue-500 to-purple-600",
    color: "text-blue-400"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create and deploy mocks in seconds with our streamlined workflow and instant CDN distribution",
    gradient: "from-yellow-500 to-orange-600", 
    color: "text-yellow-400"
  },
  {
    icon: Globe,
    title: "Global Distribution",
    description: "Deploy your mocks globally with edge caching for ultra-low latency worldwide",
    gradient: "from-green-500 to-teal-600",
    color: "text-green-400"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with authentication, rate limiting, and compliance features",
    gradient: "from-purple-500 to-pink-600",
    color: "text-purple-400"
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Monitor API usage with detailed metrics, performance insights, and request tracking",
    gradient: "from-red-500 to-rose-600",
    color: "text-red-400"
  },
  {
    icon: Boxes,
    title: "Team Collaboration",
    description: "Share mocks seamlessly with your team using workspaces, permissions, and version control",
    gradient: "from-indigo-500 to-blue-600",
    color: "text-indigo-400"
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    company: "Vercel",
    content: "MockBox has revolutionized our development workflow. We can prototype and test APIs before they're even built.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face",
    cardTheme: "slate" // Professional slate theme
  },
  {
    name: "Alex Rodriguez",
    role: "Tech Lead",
    company: "Stripe",
    content: "The AI-powered mock generation is incredible. It understands our data patterns perfectly.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    cardTheme: "emerald" // Success-oriented emerald theme
  },
  {
    name: "Emily Johnson",
    role: "Product Manager", 
    company: "Figma",
    content: "Even our designers can create realistic API mocks for prototyping. It's that intuitive.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    cardTheme: "indigo" // Creative indigo theme
  }
]

const cardThemes = {
  slate: {
    background: "from-slate-900/90 via-slate-800/80 to-slate-900/90",
    border: "border-slate-600/30",
    hoverBorder: "hover:border-slate-500/50",
    textPrimary: "text-slate-100", // High contrast white text
    textSecondary: "text-slate-300", // Medium contrast for secondary text
    accent: "text-slate-400",
    overlay: "from-slate-700/20 via-slate-600/10 to-slate-700/20"
  },
  emerald: {
    background: "from-emerald-950/90 via-emerald-900/80 to-emerald-950/90",
    border: "border-emerald-600/30",
    hoverBorder: "hover:border-emerald-500/50",
    textPrimary: "text-emerald-50", // High contrast white text
    textSecondary: "text-emerald-200", // Medium contrast for secondary text
    accent: "text-emerald-300",
    overlay: "from-emerald-700/20 via-emerald-600/10 to-emerald-700/20"
  },
  indigo: {
    background: "from-indigo-950/90 via-indigo-900/80 to-indigo-950/90",
    border: "border-indigo-600/30",
    hoverBorder: "hover:border-indigo-500/50",
    textPrimary: "text-indigo-50", // High contrast white text
    textSecondary: "text-indigo-200", // Medium contrast for secondary text
    accent: "text-indigo-300",
    overlay: "from-indigo-700/20 via-indigo-600/10 to-indigo-700/20"
  }
}

const codeExample = `{
  "users": [
    {
      "id": "usr_1234",
      "name": "Alex Johnson",
      "email": "alex@company.com",
      "role": "developer",
      "avatar": "https://api.mockbox.dev/avatars/1234",
      "lastActive": "2024-01-20T10:30:00Z",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "hasMore": false
  }
}`

// Animated Grid Background Component
const AnimatedGrid = ({ theme }: { theme: "light" | "dark" }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)"}
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id="grid-large"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 120 0 L 0 0 0 120"
            fill="none"
            stroke={theme === 'light' ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)"}
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#grid-large)" />
    </svg>
  </div>
)

// Floating Particles Component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    opacity: number
    color: string
    speedX: number
    speedY: number
  }>>([])

  useEffect(() => {
    const particleCount = window.innerWidth < 768 ? 15 : 25 // Responsive particle count
    const colors = ['rgba(59, 130, 246, 0.6)', 'rgba(147, 51, 234, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 101, 101, 0.6)']
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2, // Size range: 2-6px
      opacity: Math.random() * 0.6 + 0.2, // Opacity range: 0.2-0.8
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.5, // Gentle horizontal movement
      speedY: (Math.random() - 0.5) * 0.3, // Gentle vertical movement
    }))
    
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    if (particles.length === 0) return

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX
          let newY = particle.y + particle.speedY

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth) {
            particle.speedX *= -1
            newX = Math.max(0, Math.min(window.innerWidth, newX))
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            particle.speedY *= -1
            newY = Math.max(0, Math.min(window.innerHeight, newY))
          }

          return {
            ...particle,
            x: newX,
            y: newY,
          }
        })
      )
    }

    const interval = setInterval(animateParticles, 50) // 20 FPS for smooth performance
    return () => clearInterval(interval)
  }, [particles.length])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.7, particle.opacity],
          }}
          transition={{
            duration: 3 + Math.random() * 2, // Random duration between 3-5 seconds
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// SVG World Map Component
const WorldMapSVG = () => (
  <svg
    viewBox="0 0 1000 500"
    className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simplified world map paths with key continents */}
    <g fill="currentColor" className="text-white">
      {/* North America */}
      <path d="M150 120 L280 100 L320 140 L300 180 L250 200 L180 190 L120 160 Z" />
      {/* South America */}
      <path d="M220 250 L280 240 L300 280 L290 350 L260 380 L240 360 L210 320 Z" />
      {/* Europe */}
      <path d="M450 100 L520 90 L540 120 L520 140 L480 150 L440 130 Z" />
      {/* Africa */}
      <path d="M480 160 L540 150 L560 200 L550 280 L520 320 L490 300 L470 240 Z" />
      {/* Asia */}
      <path d="M550 80 L700 70 L750 100 L780 140 L760 180 L720 200 L680 180 L640 160 L580 140 Z" />
      {/* Australia */}
      <path d="M720 320 L780 310 L800 340 L790 360 L750 370 L710 350 Z" />
      {/* Connection lines representing global network */}
      <g stroke="currentColor" fill="none" strokeWidth="0.5" opacity="0.6">
        <path d="M200 150 Q400 100 600 130" />
        <path d="M250 180 Q450 200 650 170" />
        <path d="M300 300 Q500 250 700 280" />
        <circle cx="200" cy="150" r="2" fill="currentColor" />
        <circle cx="500" cy="120" r="2" fill="currentColor" />
        <circle cx="650" cy="140" r="2" fill="currentColor" />
        <circle cx="750" cy="340" r="2" fill="currentColor" />
      </g>
    </g>
  </svg>
)

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [typedCode, setTypedCode] = useState("")
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()
  
  // Optimized scroll with reduced calculations
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  useEffect(() => {
    setMounted(true)
    
    // Typing animation for code
    let i = 0
    const charsPerStep = 5 
    const timer = setInterval(() => {
      if (i < codeExample.length) {
        setTypedCode(codeExample.slice(0, i + charsPerStep))
        i += charsPerStep
      } else {
        setTypedCode(codeExample)
        clearInterval(timer)
      }
    }, 10)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' 
      ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100' 
      : 'bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400',
    border: actualTheme === 'light' ? 'border-slate-200' : 'border-white/10',
    cardBg: actualTheme === 'light' ? 'bg-white/80' : 'bg-black/20',
    cardBorder: actualTheme === 'light' ? 'border-slate-200/50' : 'border-white/10'
  }

  return (
    <div className={`min-h-screen ${themeColors.background} ${themeColors.text} overflow-hidden relative transition-all duration-200`}>      {/* Animated Grid Background */}
      <AnimatedGrid theme={actualTheme} />
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Optimized Background Elements - Reduced complexity */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>      {/* Header */}
      <header className={`relative z-50 border-b ${themeColors.border} ${actualTheme === 'light' ? 'bg-white/80' : 'bg-black/20'} backdrop-blur-xl`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.div 
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-white font-bold text-lg">MB</span>
            </motion.div>
            <span className={`font-bold text-xl ${actualTheme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'}`}>
              MockBox
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Docs", "Dashboard"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className={`${themeColors.textSecondary} hover:${themeColors.text} transition-colors relative`}
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className={`${themeColors.text} ${actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              Sign In
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle variant="minimal" />
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                onClick={() => navigateTo("/builder")} >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden z-20">
        <motion.div 
          className="container mx-auto text-center max-w-6xl"
          style={{ y: backgroundY }}
        >         
         {/* New Feature Badge */}          
        <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
              actualTheme === 'light' 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm' 
                : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className={`h-4 w-4 ${actualTheme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
            <span className={`text-sm font-semibold ${
              actualTheme === 'light' 
                ? 'text-blue-700' 
                : 'text-blue-300'
            }`}>
              New: AI-Powered Mock Generation
            </span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Mock APIs
            </span>
            <br />
            <span className={actualTheme === 'light' ? 'text-slate-900' : 'text-white'}>Like Never Before</span>
          </motion.h1>

          <motion.p 
            className={`text-xl md:text-2xl ${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300'} mb-12 max-w-4xl mx-auto leading-relaxed`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Build, test, and deploy realistic API mocks in seconds. The most advanced API 
            mocking platform for modern development teams.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => navigateTo("/builder")}
                size="lg" 
                className="text-lg px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-2xl shadow-blue-500/25"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className={`text-lg px-12 py-6 ${actualTheme === 'light' ? 'bg-slate-100/50 border-2 border-slate-300 text-slate-900 hover:bg-slate-200/70 hover:border-slate-400' : 'bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30'} backdrop-blur-md hover:shadow-lg transition-all duration-300 font-semibold relative overflow-hidden group`}
              >
                {/* Glass effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${actualTheme === 'light' ? 'from-slate-200/30 via-slate-100/20 to-transparent' : 'from-white/10 via-white/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <Activity className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">View Live Demo</span>
              </Button>
            </motion.div>
          </motion.div>          
          {/* Floating Code Example */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >            
            <Card className={`${actualTheme === 'light' ? 'bg-white border-slate-200 shadow-lg' : 'bg-black/40 border-white/10'} backdrop-blur-xl overflow-hidden h-[550px]`}>
              <CardHeader className="text-left">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>                    <Badge className={`${
                    actualTheme === 'light' 
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 shadow-sm' 
                      : 'bg-gradient-to-r from-green-500/20 to-teal-500/20 border-green-500/30 text-green-300'
                  } font-semibold`}>
                    ✨ AI Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className={`text-left text-sm font-mono ${actualTheme === 'light' ? 'text-slate-700' : 'text-gray-300'} overflow-x-auto`}>
                  <code>{typedCode}</code>
                  <motion.span 
                    className="inline-block w-2 h-5 bg-blue-400 ml-1"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Simplified Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-full blur-xl opacity-50" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-gradient-to-r from-green-500/30 to-teal-600/30 rounded-full blur-xl opacity-50" />
      </section>      
      {/* Features Section - Optimized animations */}
      <section className="pt-32 px-4 relative z-20">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-5xl font-bold mb-6 ${actualTheme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'}`}>
              Everything you need to mock APIs
            </h2>
            <p className={`text-xl ${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'} max-w-3xl mx-auto`}>
              Powerful features designed for modern development workflows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                }}
                className="group"
              >
                <Card className={`h-full ${actualTheme === 'light' ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20'} backdrop-blur-xl transition-all duration-300 overflow-hidden relative`}>
                  <div className={`absolute inset-0 ${actualTheme === 'light' ? 'bg-gradient-to-br from-slate-50/50 to-transparent' : 'bg-gradient-to-br from-white/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className={`text-xl ${actualTheme === 'light' ? 'text-slate-900' : 'text-white'} group-hover:${actualTheme === 'light' ? 'text-slate-900' : 'text-white'} transition-colors`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className={`${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'} text-base leading-relaxed`}>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section with World Map Background */}
      <section className="py-32 px-4 relative overflow-hidden z-20">
        {/* World Map Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <WorldMapSVG />
        </div>
          {/* Subtle overlay to ensure readability */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${actualTheme === 'light' ? 'via-slate-200/20' : 'via-black/20'} to-transparent`} />
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Globe className="h-8 w-8 text-blue-400" />
              <h2 className={`text-5xl font-bold ${actualTheme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'}`}>
                Loved by developers worldwide
              </h2>
            </div>
            <p className={`text-xl ${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>Join 50,000+ developers building faster with MockBox</p>
            
            {/* Global stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mt-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>150+ Countries</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>10M+ API Calls</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const theme = cardThemes[testimonial.cardTheme as keyof typeof cardThemes]
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8
                  }}
                  className="group"
                >
                  <Card className={`h-full bg-gradient-to-br ${theme.background} ${theme.border} ${theme.hoverBorder} backdrop-blur-xl transition-all duration-500 relative overflow-hidden shadow-2xl`}>
                    {/* Gradient overlay for depth */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Subtle border glow effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    
                    <CardHeader className="relative z-10 pb-4">
                      <div className="flex items-center gap-2 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.2 + i * 0.1, type: "spring" }}
                            viewport={{ once: true }}
                          >
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                          </motion.div>
                        ))}
                      </div>
                      <CardDescription className={`text-base ${theme.textSecondary} leading-relaxed font-medium`}>
                        "{testimonial.content}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-0">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-current shadow-sm"></div>
                        </div>
                        <div>
                          <div className={`font-semibold ${theme.textPrimary} text-base`}>
                            {testimonial.name}
                          </div>
                          <div className={`text-sm ${theme.accent} font-medium`}>
                            {testimonial.role}
                          </div>
                          <div className={`text-xs ${theme.accent} opacity-80`}>
                            {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
          
          {/* Trust indicators */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 text-sm mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Vercel", "Stripe", "Figma", "GitHub", "Discord", "Shopify"].map((company, index) => (
                <motion.div
                  key={company}
                  className="text-gray-400 font-semibold text-lg hover:text-gray-300 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <motion.div 
          className="container mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >          <h2 className={`text-5xl font-bold mb-6 ${actualTheme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent'}`}>
            Ready to build the future?
          </h2>
          <p className={`text-xl mb-12 ${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300'} max-w-2xl mx-auto`}>
            Join thousands of developers who ship faster with MockBox. Start building your next project today.
          </p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => navigateTo("/builder")}
                size="lg" 
                className="text-lg px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-2xl shadow-blue-500/25"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className={`text-lg px-12 py-6 ${actualTheme === 'light' ? 'bg-slate-100/50 border-2 border-slate-300 text-slate-900 hover:bg-slate-200/70 hover:border-slate-400' : 'bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30'} backdrop-blur-md hover:shadow-lg transition-all duration-300 font-semibold relative overflow-hidden group`}
              >
                {/* Glass effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${actualTheme === 'light' ? 'from-slate-200/30 via-slate-100/20 to-transparent' : 'from-white/10 via-white/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <Github className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">View on GitHub</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>      {/* Footer */}
      <footer className={`border-t ${themeColors.border} py-16 px-4 ${actualTheme === 'light' ? 'bg-slate-50/50' : 'bg-black/20'} backdrop-blur-xl relative z-20`}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MB</span>
                </div>
                <span className={`font-bold text-xl ${themeColors.text}`}>MockBox</span>
              </Link>
              <p className={`${themeColors.textSecondary} leading-relaxed`}>
                The most advanced API mocking platform for modern development teams.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-6 ${themeColors.text}`}>Product</h3>
              <ul className={`space-y-3 ${themeColors.textSecondary}`}>
                {["Features", "Pricing", "Documentation", "API Reference", "Templates"].map((item) => (
                  <li key={item}>
                    <Link href="#" className={`hover:${themeColors.text} transition-colors`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-6 ${themeColors.text}`}>Company</h3>
              <ul className={`space-y-3 ${themeColors.textSecondary}`}>
                {["About", "Blog", "Careers", "Contact", "Privacy"].map((item) => (
                  <li key={item}>
                    <Link href="#" className={`hover:${themeColors.text} transition-colors`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-6 ${themeColors.text}`}>Connect</h3>
              <div className="flex gap-4">
                {[
                  { icon: Github, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" }
                ].map(({ icon: Icon, href }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    className={`w-10 h-10 rounded-lg ${actualTheme === 'light' ? 'bg-slate-200/50 text-slate-600 hover:text-slate-900 hover:bg-slate-300/70' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'} flex items-center justify-center transition-all`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className={`border-t ${themeColors.border} mt-12 pt-8 text-center ${themeColors.textSecondary}`}>
            <p>&copy; 2024 MockBox. Built with ❤️ for developers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}