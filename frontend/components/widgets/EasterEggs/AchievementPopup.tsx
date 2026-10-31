'use client'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { Achievement } from './types'

interface AchievementPopupProps {
  achievement: Achievement
  onClose: () => void
}

const AchievementPopup = ({ achievement, onClose }: AchievementPopupProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-300 ${
          show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="glass-card p-6 min-w-[320px] border-2 border-primary/50 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="text-5xl animate-bounce">{achievement.icon}</div>
            <div className="flex-1">
              <div className="text-sm text-primary font-semibold mb-1">
                🎉 Achievement Unlocked!
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-400">{achievement.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AchievementPopup
