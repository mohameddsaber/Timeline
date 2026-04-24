import { create } from 'zustand';

const useSimulatorStore = create((set, get) => ({
  currentNode: null,
  pathHistory: [],
  currentScore: 0,
  
  setCurrentNode: (node) => set({ currentNode: node }),
  
  makeChoice: (choice, nextNode) => {
    const { currentNode, pathHistory, currentScore } = get();
    
    const choiceScore = (choice.reward || 0) - (choice.effort || 0);
    
    // Save current state to history so we can restore it on goBack
    const step = {
      previousNode: currentNode,
      choiceText: choice.text,
      choiceScore: choiceScore,
    };
    
    set({
      currentNode: nextNode || null,
      pathHistory: [...pathHistory, step],
      currentScore: currentScore + choiceScore,
    });
  },
  
  goBack: () => {
    const { pathHistory, currentScore } = get();
    
    if (pathHistory.length === 0) return;
    
    const newHistory = [...pathHistory];
    const lastStep = newHistory.pop();
    
    set({
      currentNode: lastStep.previousNode,
      pathHistory: newHistory,
      currentScore: currentScore - lastStep.choiceScore,
    });
  },
}));

export default useSimulatorStore;
