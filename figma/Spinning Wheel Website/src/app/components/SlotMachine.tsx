import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SLOT_SPIN_DURATION_MIN, SLOT_SPIN_DURATION_MAX, WINNER_DISPLAY_DELAY } from '../constants/timings';

interface SlotMachineProps {
  names: string[];
  isSpinning: boolean;
  onSpinComplete: (winner: string, winnerIndex: number) => void;
  onAnimationStart?: (duration: number) => void;
}

const SLOT_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
];

const ITEM_HEIGHT = 140; // Single source of truth for item height

export function SlotMachine({ names, isSpinning, onSpinComplete, onAnimationStart }: SlotMachineProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [animationDuration, setAnimationDuration] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousScrollRef = useRef(0);
  const previousIsSpinningRef = useRef(isSpinning);
  const [easingCurve, setEasingCurve] = useState<[number, number, number, number]>([0.37, 0, 0.2, 1]);

  useEffect(() => {
    if (names.length === 0) return;

    // Create a repeating list for seamless scrolling - increased to handle long scrolls
    const repeats = 40; // Increased to ensure we never run out during animation
    const repeated = Array(repeats).fill(names).flat();
    setDisplayNames(repeated);
    
    // Reset to middle position when names change
    const middlePosition = -(20 * names.length * ITEM_HEIGHT); // Start at middle of the 40 repeats
    setScrollPosition(middlePosition);
    previousScrollRef.current = middlePosition;
  }, [names]);

  useEffect(() => {
    if (!isSpinning && previousIsSpinningRef.current && selectedWinner) {
      // Only trigger winner when we transition from spinning to not spinning
      // Verify the centered name matches the selected winner
      const centeredIndex = Math.round(-scrollPosition / ITEM_HEIGHT);
      const centeredName = displayNames[centeredIndex];
      
      // If they match, show the winner after a brief pause (converted to ms)
      if (centeredName === selectedWinner) {
        onSpinComplete(selectedWinner, names.indexOf(selectedWinner));
      } else {
        // Fallback: use the actually centered name
        const winnerIndex = names.indexOf(centeredName || selectedWinner);
        onSpinComplete(centeredName || selectedWinner, winnerIndex >= 0 ? winnerIndex : 0);
      }
    }
    previousIsSpinningRef.current = isSpinning;
  }, [isSpinning, selectedWinner, onSpinComplete, scrollPosition, displayNames, names]);

  useEffect(() => {
    if (isSpinning && names.length > 0) {
      // Pick a random winner
      const winnerIndex = Math.floor(Math.random() * names.length);
      const winner = names[winnerIndex];
      setSelectedWinner(winner);
      
      // Randomize the tail end behavior for this spin
      // x1 controls start (keep between 0.35-0.45 for smooth start)
      // x2 controls the tail end (vary between 0.15-0.35 for different endings)
      const x1 = 0.35 + Math.random() * 0.1; // 0.35 to 0.45
      const x2 = 0.15 + Math.random() * 0.2; // 0.15 to 0.35
      const y2 = 0.92 + Math.random() * 0.08; // 0.92 to 1.0 - controls how dramatic the slowdown is
      
      setEasingCurve([x1, 0, x2, y2]);
      
      // Calculate scroll position to land on this winner
      const totalItems = names.length;
      
      // Reset to middle if we've drifted too far (past 30 repeats out of 40)
      const middlePosition = -(20 * names.length * ITEM_HEIGHT);
      const currentCenteredIndex = Math.round(-previousScrollRef.current / ITEM_HEIGHT);
      const maxSafeIndex = 30 * names.length; // Stay within first 30 repeats
      
      // If we're too far down, reset to middle instantly
      if (currentCenteredIndex > maxSafeIndex) {
        setScrollPosition(middlePosition);
        previousScrollRef.current = middlePosition;
      }
      
      // ALWAYS scroll through at least 8-12 full cycles for maximum excitement
      const minCycles = 8;
      const maxCycles = 12;
      const cycles = minCycles + Math.random() * (maxCycles - minCycles);
      
      // Find the current centered index
      const adjustedCurrentIndex = Math.round(-previousScrollRef.current / ITEM_HEIGHT);
      
      // Calculate how many full cycles to scroll, then land on winner
      const fullCyclesToScroll = Math.floor(cycles);
      const itemsInFullCycles = fullCyclesToScroll * totalItems;
      
      // Find next occurrence of winner after current position
      const currentIndexInCycle = adjustedCurrentIndex % totalItems;
      let offsetToWinner = (winnerIndex - currentIndexInCycle + totalItems) % totalItems;
      
      // Total items to scroll
      const totalItemsToScroll = itemsInFullCycles + offsetToWinner;
      const targetScroll = previousScrollRef.current - (totalItemsToScroll * ITEM_HEIGHT);
      
      // Animation duration: 5-6 seconds for dramatic buildup
      const totalDuration = SLOT_SPIN_DURATION_MIN + Math.random() * (SLOT_SPIN_DURATION_MAX - SLOT_SPIN_DURATION_MIN);
      
      setScrollPosition(targetScroll);
      previousScrollRef.current = targetScroll;
      setAnimationDuration(totalDuration);
      
      // Call onAnimationStart if provided
      if (onAnimationStart) {
        onAnimationStart(totalDuration);
      }
    }
  }, [isSpinning, names]); // Remove onAnimationStart from dependencies

  if (names.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 text-xl">Add some participants to get started</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center">
      {/* Scrolling container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
        }}
      >
        <motion.div
          className="absolute w-full"
          style={{ top: '50%' }}
          animate={{ y: scrollPosition }}
          initial={{ y: scrollPosition }}
          transition={{
            duration: isSpinning ? animationDuration : 0,
            ease: isSpinning ? easingCurve : 'linear' // Smooth start with very dramatic slow end
          }}
        >
          {displayNames.map((name, index) => {
            const colorIndex = index % SLOT_COLORS.length;
            const color = SLOT_COLORS[colorIndex];
            
            return (
              <div
                key={index}
                className="flex items-center justify-center px-6 md:px-12"
                style={{ 
                  height: `${ITEM_HEIGHT}px`,
                  marginTop: index === 0 ? `-${ITEM_HEIGHT / 2}px` : '0'
                }}
              >
                <div className={`w-full ${color.bg} ${color.text} border-2 ${color.border} rounded-2xl flex items-center justify-center px-8 shadow-lg`}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <p className="text-2xl md:text-4xl font-bold text-center truncate">
                    {name}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Selection indicator - center highlight box - drawn on top */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none px-6 md:px-12">
        <div style={{ height: `${ITEM_HEIGHT}px` }} className="border-4 border-white bg-white/10 rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}