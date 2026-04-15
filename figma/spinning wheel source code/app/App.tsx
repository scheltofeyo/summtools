import { useState, useEffect, useCallback } from 'react';
import { SpinningWheel } from './components/SpinningWheel';
import { SlotMachine } from './components/SlotMachine';
import { SidePanel } from './components/SidePanel';
import { BottomControls } from './components/BottomControls';
import { WinnerOverlay } from './components/WinnerOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { WHEEL_SPIN_DURATION, WHEEL_TOTAL_TIME, WINNER_DISPLAY_DELAY } from './constants/timings';

type SelectionMode = 'wheel' | 'slot';

function App() {
  const [names, setNames] = useState<string[]>([
    'Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Martinez', 'Eve Wilson', 'Frank Brown'
  ]);
  const [removedNames, setRemovedNames] = useState<Array<{ name: string; timestamp: number }>>([]);
  const [allWinners, setAllWinners] = useState<Array<{ name: string; timestamp: number }>>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number>(0);
  const [hasEverHadWinner, setHasEverHadWinner] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('slot');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [spinTimeout, setSpinTimeout] = useState<NodeJS.Timeout | null>(null);

  // Open side panel by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidePanelOpen(true);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSpin = () => {
    if (names.length === 0 || isSpinning) return;

    // Clear any existing timeout
    if (spinTimeout) {
      clearTimeout(spinTimeout);
      setSpinTimeout(null);
    }

    setWinner(null);
    setIsSpinning(true);

    // Remove previous winner if option is enabled
    if (removeWinner && winner) {
      const updatedNames = names.filter(name => name !== winner);
      if (updatedNames.length > 0) {
        setNames(updatedNames);
        // Add to removed list with timestamp
        setRemovedNames(prev => [{ name: winner, timestamp: Date.now() }, ...prev]);
      }
    }

    if (selectionMode === 'wheel') {
      // Random rotation between 3-5 full spins plus a random angle (reduced from 5-8 to prevent dizziness)
      const spins = 3 + Math.random() * 2;
      const randomAngle = Math.random() * 360;
      const newRotation = rotation + (spins * 360) + randomAngle;
      setRotation(newRotation);
      
      // Stop spinning after animation completes + winner delay (from centralized constants)
      const timeout = setTimeout(() => {
        setIsSpinning(false);
      }, WHEEL_TOTAL_TIME * 1000); // Convert to milliseconds
      setSpinTimeout(timeout);
    }
    // For slot machine, duration is handled by onSlotAnimationStart callback
  };

  const handleSlotAnimationStart = useCallback((duration: number) => {
    // Set timeout based on actual animation duration + winner display delay
    const timeout = setTimeout(() => {
      setIsSpinning(false);
    }, (duration + WINNER_DISPLAY_DELAY) * 1000); // Convert seconds to milliseconds
    setSpinTimeout(timeout);
  }, []); // Remove spinTimeout dependency to prevent callback recreation

  const handleSpinComplete = useCallback((winnerName: string, index: number) => {
    setWinner(winnerName);
    setWinnerIndex(index);
    setHasEverHadWinner(true);
    setAllWinners(prev => [{ name: winnerName, timestamp: Date.now() }, ...prev]);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40">
      {/* Main Content Area */}
      <div className={`h-full transition-all duration-300 ${sidePanelOpen ? 'md:mr-[420px]' : ''}`}>
        {/* Selection Display - Full Screen */}
        <div className="h-full flex items-center justify-center p-4 md:p-8 pb-48 md:pb-40">
          <AnimatePresence mode="wait">
            {selectionMode === 'wheel' ? (
              <motion.div
                key="wheel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center"
              >
                {names.length === 0 ? (
                  <div className="text-center">
                    <p className="text-xl text-slate-400">Add some participants to get started</p>
                  </div>
                ) : (
                  <SpinningWheel
                    names={names}
                    isSpinning={isSpinning}
                    onSpinComplete={handleSpinComplete}
                    rotation={rotation}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="slot"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center"
              >
                <SlotMachine
                  names={names}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                  onAnimationStart={handleSlotAnimationStart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel
        isOpen={sidePanelOpen}
        onToggle={() => setSidePanelOpen(!sidePanelOpen)}
        activeNames={names}
        removedNames={removedNames}
        allWinners={allWinners}
        onActiveNamesChange={setNames}
        onRemovedNamesChange={setRemovedNames}
      />

      {/* Bottom Controls */}
      <BottomControls
        onSpin={handleSpin}
        isSpinning={isSpinning}
        hasNames={names.length > 0}
        hasWinner={winner !== null}
        removeWinner={removeWinner}
        onRemoveWinnerChange={setRemoveWinner}
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
      />

      {/* Winner Overlay */}
      <WinnerOverlay
        winner={winner}
        winnerIndex={winnerIndex}
        isVisible={winner !== null && !isSpinning}
      />
    </div>
  );
}

export default App;