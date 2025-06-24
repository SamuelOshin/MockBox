"use client"

import React, { forwardRef, HTMLAttributes, CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface ScrollbarContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  height?: string | number
  width?: string | number
  maxHeight?: string | number
  maxWidth?: string | number
  thumbColor?: string
  trackColor?: string
  scrollbarWidth?: string
  scrollbarHeight?: string
  borderRadius?: string
  hoverOpacity?: number
  transition?: string
  direction?: "vertical" | "horizontal" | "both"
  theme?: "light" | "dark" | "auto"
  touchSupport?: boolean
  rtlSupport?: boolean
}

const ScrollbarContainer = forwardRef<HTMLDivElement, ScrollbarContainerProps>(
  (
    {
      children,
      className,
      style,
      height,
      width,
      maxHeight,
      maxWidth,
      thumbColor,
      trackColor,
      scrollbarWidth = "8px",
      scrollbarHeight = "8px",
      borderRadius = "4px",
      hoverOpacity = 0.8,
      transition = "0.2s all ease",
      direction = "vertical",
      theme = "auto",
      touchSupport = true,
      rtlSupport = true,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for CSS custom properties
    const containerId = React.useId().replace(/:/g, "")

    // Determine theme colors
    const getThemeColors = () => {
      if (theme === "light") {
        return {
          track: trackColor || "#f1f1f1",
          thumb: thumbColor || "#888888",
        }
      } else if (theme === "dark") {
        return {
          track: trackColor || "#2d2d2d",
          thumb: thumbColor || "#505050",
        }
      } else {
        // Auto theme - use CSS custom properties
        return {
          track: trackColor || "var(--scrollbar-track, #2d2d2d)",
          thumb: thumbColor || "var(--scrollbar-thumb, #505050)",
        }
      }
    }

    const colors = getThemeColors()

    // Responsive scrollbar width
    const responsiveScrollbarWidth = `clamp(4px, ${scrollbarWidth}, 8px)`
    const responsiveScrollbarHeight = `clamp(4px, ${scrollbarHeight}, 8px)`

    // Container styles
    const containerStyle: CSSProperties = {
      height,
      width,
      maxHeight,
      maxWidth,
      overflow: direction === "both" ? "auto" : direction === "horizontal" ? "auto" : "auto",
      overflowX: direction === "horizontal" || direction === "both" ? "auto" : "hidden",
      overflowY: direction === "vertical" || direction === "both" ? "auto" : "hidden",
      scrollbarWidth: "thin", // Firefox
      scrollbarColor: `${colors.thumb} ${colors.track}`, // Firefox
      // CSS custom properties for this container
      [`--scrollbar-width-${containerId}`]: responsiveScrollbarWidth,
      [`--scrollbar-height-${containerId}`]: responsiveScrollbarHeight,
      [`--scrollbar-track-${containerId}`]: colors.track,
      [`--scrollbar-thumb-${containerId}`]: colors.thumb,
      [`--scrollbar-border-radius-${containerId}`]: borderRadius,
      [`--scrollbar-hover-opacity-${containerId}`]: hoverOpacity,
      [`--scrollbar-transition-${containerId}`]: transition,
      // Touch scrolling
      WebkitOverflowScrolling: touchSupport ? "touch" : "auto",
      // RTL support
      direction: rtlSupport ? "inherit" : "ltr",
      ...style,
    }

    // Generate dynamic CSS for webkit scrollbars
    React.useEffect(() => {
      const styleId = `scrollbar-${containerId}`
      let styleElement = document.getElementById(styleId) as HTMLStyleElement

      if (!styleElement) {
        styleElement = document.createElement("style")
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }

      const css = `
        .scrollbar-container-${containerId}::-webkit-scrollbar {
          width: var(--scrollbar-width-${containerId});
          height: var(--scrollbar-height-${containerId});
        }

        .scrollbar-container-${containerId}::-webkit-scrollbar-track {
          background: var(--scrollbar-track-${containerId});
          border-radius: var(--scrollbar-border-radius-${containerId});
        }

        .scrollbar-container-${containerId}::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-${containerId});
          border-radius: var(--scrollbar-border-radius-${containerId});
          transition: var(--scrollbar-transition-${containerId});
        }

        .scrollbar-container-${containerId}::-webkit-scrollbar-thumb:hover {
          opacity: var(--scrollbar-hover-opacity-${containerId});
        }

        .scrollbar-container-${containerId}::-webkit-scrollbar-corner {
          background: var(--scrollbar-track-${containerId});
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .scrollbar-container-${containerId}::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }

        /* RTL support */
        [dir="rtl"] .scrollbar-container-${containerId}::-webkit-scrollbar {
          left: 0;
          right: auto;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .scrollbar-container-${containerId}::-webkit-scrollbar-thumb {
            border: 1px solid;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .scrollbar-container-${containerId}::-webkit-scrollbar-thumb {
            transition: none;
          }
        }
      `

      styleElement.textContent = css

      return () => {
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement)
        }
      }
    }, [
      containerId,
      colors.track,
      colors.thumb,
      responsiveScrollbarWidth,
      responsiveScrollbarHeight,
      borderRadius,
      hoverOpacity,
      transition,
    ])

    return (
      <div
        ref={ref}
        className={cn(
          `scrollbar-container-${containerId}`,
          "scrollbar-container",
          className
        )}
        style={containerStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollbarContainer.displayName = "ScrollbarContainer"

export { ScrollbarContainer }
