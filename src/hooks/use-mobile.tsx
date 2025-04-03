
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Initialize on mount
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

// Add useMobile as an alias for useIsMobile for backward compatibility
export const useMobile = useIsMobile
