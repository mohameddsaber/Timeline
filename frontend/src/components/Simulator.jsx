import React, { useEffect, useState } from 'react';
import useSimulatorStore from '../store/useSimulatorStore';
import { getNode } from '../services/api';

const Simulator = ({ initialNodeId }) => {
  const { 
    currentNode, 
    pathHistory, 
    currentScore, 
    setCurrentNode, 
    makeChoice, 
    goBack 
  } = useSimulatorStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load initial node if we don't have one and an initialNodeId is provided
    const loadInitialNode = async () => {
      if (initialNodeId && !currentNode && pathHistory.length === 0) {
        setLoading(true);
        try {
          const node = await getNode(initialNodeId);
          setCurrentNode(node);
        } catch (err) {
          setError('Failed to load initial node. Is the backend running?');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadInitialNode();
  }, [initialNodeId, currentNode, pathHistory.length, setCurrentNode]);

  const handleChoiceClick = async (choice) => {
    if (!choice.nextNode) {
      // Leaf node / End of line: Update score and state, but nextNode is null
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

  if (loading && !currentNode) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading simulator...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 font-sans">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Main Node Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {currentNode ? currentNode.text : "Scenario Complete"}
          </h2>

          {/* Choices */}
          {currentNode && currentNode.choices && currentNode.choices.length > 0 ? (
            <div className="flex flex-col gap-3">
              {currentNode.choices.map((choice, index) => (
                <button
                  key={choice._id || index}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={loading}
                  className="px-5 py-4 text-left transition-colors bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-700 font-medium text-lg">End of the line.</p>
              <p className="text-gray-500 text-sm mt-1">There are no further choices.</p>
            </div>
          )}
        </div>
        
        {/* Navigation & Score Bar */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={goBack}
            disabled={pathHistory.length === 0 || loading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              pathHistory.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 shadow-sm'
            }`}
          >
            &larr; Go Back
          </button>
          
          <div className="font-semibold text-gray-700 flex items-center gap-2">
            Score: <span className={`text-xl font-bold ${currentScore >= 0 ? 'text-green-600' : 'text-red-500'}`}>{currentScore}</span>
          </div>
        </div>
      </div>

      {/* Path History Log */}
      {pathHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-100 pb-2">Journey History</h3>
          <ul className="space-y-3 text-sm">
            {pathHistory.map((step, index) => (
              <li key={index} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-1">
                <div className="flex gap-3">
                  <span className="text-gray-400 font-mono">#{index + 1}</span>
                  <span className="text-gray-700 font-medium">{step.choiceText}</span>
                </div>
                <span className={`font-mono text-xs ${step.choiceScore >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {step.choiceScore > 0 ? '+' : ''}{step.choiceScore} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Simulator;
