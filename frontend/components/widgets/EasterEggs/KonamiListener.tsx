'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with xterm
const TerminalEmulator = dynamic(() => import('./TerminalEmulator'), {
  ssr: false
})

const KonamiListener = () => {
  const [terminalOpen, setTerminalOpen] = useState(false)
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

  return (
    <>
      {/* Terminal modal */}
      {terminalOpen && (
        <TerminalEmulator onClose={() => setTerminalOpen(false)} />
      )}
    </>
  )
}

export default KonamiListener
