import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

type SelectionMode = 'wheel' | 'slot';

interface BottomControlsProps {
  onSpin: () => void;
  isSpinning: boolean;
  hasNames: boolean;
  hasWinner: boolean;
  removeWinner: boolean;
  onRemoveWinnerChange: (value: boolean) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
}

export function BottomControls({
  onSpin,
  isSpinning,
  hasNames,
  hasWinner,
  removeWinner,
  onRemoveWinnerChange,
  selectionMode,
  onSelectionModeChange
}: BottomControlsProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4"
    >
      <div className="relative p-4 md:p-6">
        {/* Mobile Layout - Stack everything */}
        <div className="md:hidden flex flex-col items-center gap-3 pointer-events-auto">
          {/* Mode Switcher - Top on Mobile */}
          {!isSpinning && (
            <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 p-1.5 flex gap-1">
              <button
                onClick={() => onSelectionModeChange('wheel')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectionMode === 'wheel'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Wheel
              </button>
              <button
                onClick={() => onSelectionModeChange('slot')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectionMode === 'slot'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                List
              </button>
            </div>
          )}

          {/* Randomize Button */}
          <Button
            onClick={onSpin}
            disabled={!hasNames || isSpinning}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs"
          >
            {isSpinning ? 'Selecting...' : hasWinner ? 'Randomize Next!' : 'Randomize!'}
          </Button>

          {/* Remove Winners Toggle */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-lg border border-slate-200 mb-2">
            <Switch
              id="remove-winner"
              checked={removeWinner}
              onCheckedChange={onRemoveWinnerChange}
              className="data-[state=checked]:bg-red-500"
            />
            <label
              htmlFor="remove-winner"
              className="text-xs font-medium text-slate-700 cursor-pointer select-none"
            >
              Remove winners from list
            </label>
          </div>
        </div>

        {/* Desktop Layout - Original */}
        <div className="hidden md:flex items-end justify-between">
          {/* Mode Switcher - Bottom Left */}
          {!isSpinning && (
            <div className="pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 p-2 flex gap-2">
                <button
                  onClick={() => onSelectionModeChange('wheel')}
                  className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                    selectionMode === 'wheel'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Wheel
                </button>
                <button
                  onClick={() => onSelectionModeChange('slot')}
                  className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                    selectionMode === 'slot'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          )}

          {/* Center Controls */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center gap-4 pointer-events-auto">
            {/* Randomize Button */}
            <Button
              onClick={onSpin}
              disabled={!hasNames || isSpinning}
              className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 px-12 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {isSpinning ? 'Selecting...' : hasWinner ? 'Randomize Next!' : 'Randomize!'}
            </Button>

            {/* Remove Winners Toggle */}
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-slate-200 mb-4">
              <Switch
                id="remove-winner-desktop"
                checked={removeWinner}
                onCheckedChange={onRemoveWinnerChange}
                className="data-[state=checked]:bg-red-500"
              />
              <label
                htmlFor="remove-winner-desktop"
                className="text-sm font-medium text-slate-700 cursor-pointer select-none"
              >
                Remove winners from list
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}