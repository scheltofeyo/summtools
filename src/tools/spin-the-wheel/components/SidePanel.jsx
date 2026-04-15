import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, X, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { ScrollArea } from './ui/ScrollArea';

export function SidePanel({
  isOpen,
  onToggle,
  activeNames,
  removedNames,
  allWinners,
  onActiveNamesChange,
  onRemovedNamesChange
}) {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('participants');

  const handleAddName = () => {
    if (inputValue.trim()) {
      const newNames = inputValue
        .split(/[,;\n]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .filter(name => !activeNames.includes(name));

      if (newNames.length > 0) {
        onActiveNamesChange([...activeNames, ...newNames]);
        setInputValue('');
      }
    }
  };

  const handleRemoveName = (index) => {
    onActiveNamesChange(activeNames.filter((_, i) => i !== index));
  };

  const handleRestoreName = (name) => {
    if (!activeNames.includes(name)) {
      onActiveNamesChange([...activeNames, name]);
    }
    onRemovedNamesChange(removedNames.filter(item => item.name !== name));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed right-0 top-24 z-50 bg-white shadow-lg border border-l-0 border-slate-200 rounded-l-xl px-2 py-6 hover:bg-slate-50 transition-colors ${
          !isOpen ? 'block' : 'hidden md:block'
        }`}
        style={{
          right: isOpen ? '420px' : '0px'
        }}
        animate={{
          right: isOpen ? '420px' : '0px'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </motion.div>
      </motion.button>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 relative">
              <h2 className="text-2xl font-bold text-slate-800 pr-10 md:pr-0">Manage Participants</h2>
              <button
                onClick={onToggle}
                className="absolute top-6 right-6 p-2 hover:bg-white/50 rounded-lg transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Add Participant Section */}
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Add Participants
              </label>
              <div className="flex gap-2 items-start">
                <textarea
                  placeholder="Enter names (comma or newline separated)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddName();
                    }
                  }}
                  rows={3}
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none resize-none"
                />
                <Button
                  onClick={handleAddName}
                  disabled={!inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-[76px]"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Tip: Add multiple names at once by separating them with commas or line breaks. Press Ctrl+Enter (Cmd+Enter on Mac) to add.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === 'participants'
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Participants ({activeNames.length})
                {activeTab === 'participants' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('winners')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === 'winners'
                    ? 'text-amber-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Winners ({allWinners.length})
                {activeTab === 'winners' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                  />
                )}
              </button>
            </div>

            {/* List Content */}
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'participants' ? (
                    <motion.div
                      key="participants"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      {activeNames.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-slate-400 text-sm">No active participants</p>
                        </div>
                      ) : (
                        activeNames.map((name, index) => (
                          <motion.div
                            key={`${name}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.02 }}
                            className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all group"
                          >
                            <span className="text-sm font-medium text-slate-700">{name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveName(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="winners"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      {allWinners.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-slate-400 text-sm">No winners yet</p>
                        </div>
                      ) : (
                        allWinners.map((item, index) => {
                          const isRemoved = removedNames.some(r => r.name === item.name);
                          return (
                            <motion.div
                              key={`${item.name}-${item.timestamp}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.02 }}
                              className={`flex items-center justify-between ${
                                isRemoved ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                              } border rounded-lg px-4 py-3 hover:border-amber-300 hover:shadow-sm transition-all group`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${
                                  isRemoved ? 'text-red-600 bg-red-200' : 'text-amber-600 bg-amber-200'
                                } px-2 py-1 rounded`}>
                                  #{allWinners.length - index}
                                </span>
                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              </div>
                              {isRemoved && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestoreName(item.name)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600"
                                  title="Restore to active list"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
