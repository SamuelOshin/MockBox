"use client"

import Link from "next/link"
import { useNavigation } from "./line-loader"
import { ReactNode } from "react"

interface NavigationLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const { navigateTo } = useNavigation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.(
    )
    navigateTo(href)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}

// Hook version for more control
export function useNavigationLink() {
  const { navigateTo, startNavigation } = useNavigation()

  return {
    navigateTo,
    handleNavigation: (href: string, callback?: () => void) => {
      callback?.()
      navigateTo(href)
    }
  }
}
