'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with xterm
const TerminalEmulator = dynamic(() => import('./TerminalEmulator'), {
  ssr: false
})

const KonamiListener = () => {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [konamiIndex, setKonamiIndex] = useState(0)

  // Konami code sequence: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ]

  const handleKonamiCode = useCallback((e: KeyboardEvent) => {
    // Ignore if terminal is already open
    if (terminalOpen) return

    // Check if the pressed key matches the next key in the sequence
    const key = e.key.toLowerCase()
    const expectedKey = konamiCode[konamiIndex].toLowerCase()

    if (key === expectedKey) {
      const newIndex = konamiIndex + 1

      if (newIndex === konamiCode.length) {
        // Complete sequence!
        setTerminalOpen(true)
        setKonamiIndex(0)
        setShowHint(false)

        // Play success sound (optional)
        try {
          const audio = new Audio('/sounds/unlock.mp3')
          audio.volume = 0.3
          audio.play().catch(() => {
            // Ignore if audio fails to play
          })
        } catch (error) {
          // Audio not available, no problem
        }
      } else {
        setKonamiIndex(newIndex)
      }
    } else {
      // Wrong key, reset
      setKonamiIndex(0)
    }
  }, [konamiIndex, terminalOpen, konamiCode])

  useEffect(() => {
    window.addEventListener('keydown', handleKonamiCode)
    return () => window.removeEventListener('keydown', handleKonamiCode)
  }, [handleKonamiCode])

  // Show hint after 30 seconds
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      if (!terminalOpen) {
        setShowHint(true)
        // Auto-hide hint after 10 seconds
        setTimeout(() => setShowHint(false), 10000)
      }
    }, 30000)

    return () => clearTimeout(hintTimer)
  }, [terminalOpen])

  return (
    <>
      {/* Subtle hint — centered so it never overlaps the corner mascot */}
      {showHint && !terminalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in slide-in-from-bottom-2 fade-in duration-500">
          <div className="glass-card px-4 py-3 max-w-[220px]">
            <p className="text-xs text-white/50 text-center font-mono">
              🎮 Try the Konami code
              <br />
              <span className="text-primary/70">↑↑↓↓←→←→BA</span>
            </p>
          </div>
        </div>
      )}

      {/* Terminal modal */}
      {terminalOpen && (
        <TerminalEmulator onClose={() => setTerminalOpen(false)} />
      )}
    </>
  )
}

export default KonamiListener
