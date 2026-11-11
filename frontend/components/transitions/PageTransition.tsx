"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const slideDistance = pathname === `/${locale}` ? 0 : 20;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: slideDistance === 0 ? 1 : 0, y: slideDistance }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -slideDistance }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
