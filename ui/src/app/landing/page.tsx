'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Lightning from '@/components/Lightning';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Lightning Background */}
      <div className="absolute inset-0">
        <Lightning hue={63} xOffset={-1} intensity={0.8} speed={0.8} size={1} />
      </div>

      {/* Dashboard Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900/60 backdrop-blur-sm border border-amber-500/30 text-amber-400 hover:bg-stone-800/80 hover:border-amber-500/50 transition-all duration-300"
        >
          <span className="text-sm font-medium">Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* ZEUS Title - Black Adam Inspired */}
        <div className="relative">
          {/* Outer glow - golden lightning energy */}
          <div 
            className="absolute inset-0 blur-2xl opacity-60"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
            }}
          />
          
          <h1 
            className="relative text-[20rem] md:text-[28rem] lg:text-[36rem] font-black tracking-tight leading-none select-none zeus-title"
            style={{
              fontFamily: 'var(--font-cinzel)',
              background: `
                linear-gradient(
                  180deg,
                  #1a1a1a 0%,
                  #2d2d2d 15%,
                  #1a1a1a 30%,
                  #0d0d0d 50%,
                  #1a1a1a 70%,
                  #2d2d2d 85%,
                  #1a1a1a 100%
                )
              `,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.4)) drop-shadow(0 0 40px rgba(251, 191, 36, 0.2))',
              WebkitTextStroke: '1px rgba(251, 191, 36, 0.6)',
            }}
          >
            ZEUS
          </h1>
        </div>

        {/* Description */}
        <p 
          className="mt-10 text-2xl md:text-3xl text-center max-w-2xl font-medium tracking-[0.3em] uppercase"
          style={{
            color: 'rgba(251, 191, 36, 0.9)',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
          }}
        >
          AI-Powered Software Development Framework
        </p>
        <p className="mt-4 text-lg md:text-xl text-amber-500/40 text-center max-w-xl tracking-wider">
          Intelligent orchestration through hierarchical AI agents
        </p>
      </div>

    </div>
  );
}
