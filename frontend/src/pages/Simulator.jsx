import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSimulatorStore from '../store/useSimulatorStore';
import { getNode, getBestPath } from '../services/api';

const Simulator = ({ initialNodeId, onExit }) => {
  const {
    currentNode,
    pathHistory,
    currentScore,
    setCurrentNode,
    makeChoice,
    goBack,
    reset
  } = useSimulatorStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [bestPathData, setBestPathData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Load Initial Node
  useEffect(() => {
    const loadInitialNode = async () => {
      if (initialNodeId && !currentNode && pathHistory.length === 0 && !error) {
        setLoading(true);
        try {
          const node = await getNode(initialNodeId);
          setCurrentNode(node);
        } catch (err) {
          setError('Failed to load initial node.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialNode();
  }, [initialNodeId, currentNode, pathHistory.length, setCurrentNode, error]);

  // Check for terminal node
  useEffect(() => {
    if (currentNode) {
      const hasValidChoices = currentNode.choices && currentNode.choices.length > 0 && currentNode.choices.some(c => c.nextNode);
      if (!hasValidChoices && !isSimulationComplete) {
        setIsSimulationComplete(true);
      }
    }
  }, [currentNode, isSimulationComplete]);

  // Fetch best path when complete
  useEffect(() => {
    const fetchBestPath = async () => {
      if (isSimulationComplete && currentNode?.scenario && !bestPathData) {
        setLoadingResults(true);
        try {
          const data = await getBestPath(currentNode.scenario);
          setBestPathData(data);
        } catch (err) {
          console.error(err);
          setBestPathData({ bestPath: [], maxScore: 0, error: true });
        } finally {
          setLoadingResults(false);
        }
      }
    };
    fetchBestPath();
  }, [isSimulationComplete, currentNode, bestPathData]);

  // Cleanup on unmount to prevent weird states if user exits early
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleChoiceClick = async (choice) => {
    if (!choice.nextNode) {
      makeChoice(choice, null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextNode = await getNode(choice.nextNode);
      makeChoice(choice, nextNode);
    } catch (err) {
      setError('Failed to load the next step.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    reset();
    setIsSimulationComplete(false);
    setBestPathData(null);
    setError(null);
  };

  if (loading && !currentNode) {
    return (
      <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-light">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse delay-150"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 overflow-hidden">
      {/* Top Header */}
      {!isSimulationComplete && (
        <header className="p-6 md:px-10 py-8 flex justify-between items-center w-full relative z-10">
          <button
            onClick={goBack}
            disabled={pathHistory.length === 0 || loading}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathHistory.length === 0 || loading
                ? 'text-zinc-800 cursor-not-allowed'
                : 'text-zinc-400 hover:text-zinc-100'
              }`}
          >
            <span>&larr;</span> Go Back
          </button>

          <div className="text-zinc-500 text-xs font-semibold tracking-widest flex items-center">
            SCORE
            <span className={`ml-3 text-xl font-light ${currentScore >= 0 ? 'text-zinc-200' : 'text-zinc-500'}`}>
              {currentScore}
            </span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col justify-center items-center w-full mx-auto relative z-10 ${isSimulationComplete ? 'p-4 md:p-8 max-w-5xl' : 'p-6 max-w-2xl'}`}>
        {error && (
          <div className="mb-8 p-4 bg-red-950/20 text-red-400 rounded-lg border border-red-900/30 w-full text-center text-sm">
            {error}
          </div>
        )}

        <div className="w-full relative">
          <AnimatePresence mode="wait">
            {!isSimulationComplete ? (
              currentNode && (
                <motion.div
                  key={currentNode._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex flex-col items-center"
                >
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-center text-zinc-100 mb-12">
                    {currentNode.text}
                  </h1>

                  {/* Choices Grid */}
                  <div className="flex flex-col gap-4 w-full">
                    {currentNode.choices && currentNode.choices.length > 0 && (
                      currentNode.choices.map((choice, idx) => (
                        <motion.button
                          key={choice._id || idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleChoiceClick(choice)}
                          disabled={loading}
                          className="group flex flex-col text-left px-6 py-5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/40 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-wait w-full focus:outline-none focus:ring-2 focus:ring-zinc-600"
                        >
                          <span className="text-lg text-zinc-200 font-light tracking-wide mb-3">
                            {choice.text}
                          </span>

                          <div className="flex gap-4 mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                            {choice.reward > 0 && (
                              <span className="text-xs font-mono text-zinc-400">
                                <span className="text-zinc-600 uppercase tracking-widest text-[10px] mr-1.5">RWD</span>
                                +{choice.reward}
                              </span>
                            )}
                            {choice.effort > 0 && (
                              <span className="text-xs font-mono text-zinc-400">
                                <span className="text-zinc-600 uppercase tracking-widest text-[10px] mr-1.5">EFF</span>
                                -{choice.effort}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-zinc-400">❖</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-light text-zinc-100 mb-8 tracking-wide">Simulation Complete</h1>

                <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mb-12">
                  {/* User Score Card */}
                  <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 text-center">
                    <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Your Final Score</h3>
                    <p className={`text-5xl font-light ${currentScore >= 0 ? 'text-zinc-100' : 'text-zinc-500'}`}>{currentScore}</p>
                  </div>

                  {/* Max Score Card */}
                  <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 text-center relative overflow-hidden">
                    <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Optimal Score</h3>
                    {loadingResults ? (
                      <div className="flex justify-center items-center h-12">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"></div>
                      </div>
                    ) : (
                      <p className="text-5xl font-light text-zinc-100">{bestPathData?.maxScore || 0}</p>
                    )}
                  </div>
                </div>

                {/* Path Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 text-sm">
                  {/* User Path */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase pb-2 border-b border-zinc-800/50">Your Path</h4>
                    <ul className="space-y-3">
                      {pathHistory.map((step, idx) => (
                        <li key={idx} className="flex justify-between items-start bg-zinc-900/20 px-4 py-3 rounded-lg border border-zinc-800/30">
                          <span className="text-zinc-300 font-light pr-4">{step.choiceText}</span>
                          <span className={`font-mono text-xs whitespace-nowrap ${step.choiceScore >= 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {step.choiceScore > 0 ? '+' : ''}{step.choiceScore}
                          </span>
                        </li>
                      ))}
                      {pathHistory.length === 0 && <li className="text-zinc-600 italic">No choices made.</li>}
                    </ul>
                  </div>

                  {/* Best Path */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase pb-2 border-b border-zinc-800/50">Optimal Path</h4>
                    {loadingResults ? (
                      <div className="text-zinc-600 font-light animate-pulse">Analyzing optimal routes...</div>
                    ) : bestPathData?.bestPath && bestPathData.bestPath.length > 0 ? (
                      <ul className="space-y-3">
                        {bestPathData.bestPath.map((step, idx) => (
                          <li key={idx} className="flex justify-between items-start bg-zinc-900/20 px-4 py-3 rounded-lg border border-zinc-800/30">
                            <span className="text-zinc-300 font-light pr-4">{step.choiceText}</span>
                            <span className={`font-mono text-xs whitespace-nowrap ${step.choiceScore >= 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              {step.choiceScore > 0 ? '+' : ''}{step.choiceScore}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-zinc-600 italic">No valid paths found.</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button onClick={handleRestart} className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors">
                    Restart Scenario
                  </button>
                  {onExit && (
                    <button onClick={onExit} className="px-6 py-3 bg-zinc-100 text-zinc-900 text-sm font-medium rounded-xl hover:bg-white transition-colors shadow-sm">
                      Back to Dashboard
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Path History Footer */}
      {!isSimulationComplete && (
        <footer className="p-6 md:p-10 w-full mt-auto relative z-10">
          <AnimatePresence>
            {pathHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6 border-t border-zinc-900/50"
              >
                <h3 className="text-[10px] font-semibold tracking-[0.2em] text-zinc-700 uppercase mb-4 text-center">Timeline</h3>
                <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-zinc-500">
                  {pathHistory.map((step, index) => (
                    <React.Fragment key={index}>
                      <span className="bg-zinc-900/30 px-4 py-2 rounded-full border border-zinc-800/30 font-light text-zinc-400 truncate max-w-[200px]">
                        {step.choiceText}
                      </span>
                      {index < pathHistory.length - 1 && (
                        <span className="text-zinc-800 text-[10px]">&rarr;</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      )}
    </div>
  );
};

export default Simulator;
