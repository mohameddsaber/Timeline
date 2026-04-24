import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const NodeBuilder = ({ scenarioId, onBack, onOpenSimulator }) => {
  const [scenario, setScenario] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeText, setNewNodeText] = useState('');
  const [newChoiceText, setNewChoiceText] = useState('');
  const [editingChoices, setEditingChoices] = useState({});

  useEffect(() => {
    loadData();
  }, [scenarioId]);

  const loadData = async () => {
    try {
      const [scenData, nodesData] = await Promise.all([
        api.getScenario(scenarioId),
        api.getScenarioNodes(scenarioId)
      ]);
      setScenario(scenData);
      setNodes(nodesData);
      
      // Update selected node state if it exists
      if (selectedNode) {
        const updatedSelected = nodesData.find(n => n._id === selectedNode._id);
        setSelectedNode(updatedSelected || null);
        initEditingChoices(updatedSelected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initEditingChoices = (node) => {
    if (!node || !node.choices) return;
    const initialEdits = {};
    node.choices.forEach(c => {
      initialEdits[c._id] = { ...c };
    });
    setEditingChoices(initialEdits);
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    initEditingChoices(node);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!newNodeText.trim()) return;
    try {
      const created = await api.createNode({ text: newNodeText, scenario: scenarioId });
      setNewNodeText('');
      if (nodes.length === 0) {
        await api.updateScenario(scenarioId, { rootNode: created._id });
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChoice = async (e) => {
    e.preventDefault();
    if (!newChoiceText.trim() || !selectedNode) return;
    try {
      await api.addChoice(selectedNode._id, { text: newChoiceText });
      setNewChoiceText('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChoiceChange = (choiceId, field, value) => {
    setEditingChoices(prev => ({
      ...prev,
      [choiceId]: { ...prev[choiceId], [field]: value }
    }));
  };

  const handleSaveChoice = async (choiceId) => {
    try {
      const data = editingChoices[choiceId];
      await api.updateChoice(selectedNode._id, choiceId, {
        text: data.text,
        nextNode: data.nextNode || undefined,
        reward: Number(data.reward) || 0,
        effort: Number(data.effort) || 0
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!scenario) return <div className="min-h-screen bg-zinc-950 text-zinc-500 p-8">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-900/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium">&larr; Back</button>
          <h1 className="text-xl font-light text-zinc-200">{scenario.title} <span className="text-zinc-600 text-sm ml-2">Builder</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-zinc-500">Root Node: {scenario.rootNode || 'None'}</span>
          <button 
            onClick={() => onOpenSimulator(scenario.rootNode)}
            disabled={!scenario.rootNode}
            className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm font-medium rounded hover:bg-zinc-300 transition-colors disabled:opacity-50"
          >
            Play Simulator
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Nodes List */}
        <aside className="w-1/3 max-w-sm border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 flex-shrink-0 bg-zinc-900/30">
            <form onSubmit={handleCreateNode} className="flex flex-col gap-3">
              <input 
                value={newNodeText}
                onChange={e => setNewNodeText(e.target.value)}
                placeholder="New node text..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <button type="submit" disabled={!newNodeText.trim()} className="w-full py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                + CREATE NEW NODE
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {nodes.map(node => (
              <button
                key={node._id}
                onClick={() => handleSelectNode(node)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedNode?._id === node._id 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <p className="text-zinc-200 text-sm truncate">{node.text}</p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1.5">{node._id}</p>
              </button>
            ))}
            {nodes.length === 0 && <p className="text-zinc-600 text-sm text-center mt-10 font-light">No nodes created yet.</p>}
          </div>
        </aside>

        {/* Right Panel: Node Details & Linking */}
        <main className="flex-1 bg-zinc-950 flex flex-col h-full overflow-y-auto p-8 relative">
          {selectedNode ? (
            <div className="max-w-2xl w-full mx-auto space-y-10">
              <div className="pb-6 border-b border-zinc-800/50">
                <h2 className="text-3xl font-light text-zinc-100 mb-3">{selectedNode.text}</h2>
                <p className="text-xs font-mono text-zinc-600">ID: {selectedNode._id}</p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Choices / Links</h3>
                
                {/* Existing Choices */}
                {selectedNode.choices && selectedNode.choices.map(choice => (
                  <div key={choice._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Choice Text</label>
                        <input 
                          value={editingChoices[choice._id]?.text || ''}
                          onChange={e => handleChoiceChange(choice._id, 'text', e.target.value)}
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 w-full focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Next Node Link</label>
                          <select
                            value={editingChoices[choice._id]?.nextNode || ''}
                            onChange={e => handleChoiceChange(choice._id, 'nextNode', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 appearance-none"
                          >
                            <option value="">End of path (None)</option>
                            {nodes.filter(n => n._id !== selectedNode._id).map(n => (
                              <option key={n._id} value={n._id}>{n.text.substring(0, 40)}...</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Reward</label>
                          <input 
                            type="number"
                            value={editingChoices[choice._id]?.reward || 0}
                            onChange={e => handleChoiceChange(choice._id, 'reward', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-500"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Effort</label>
                          <input 
                            type="number"
                            value={editingChoices[choice._id]?.effort || 0}
                            onChange={e => handleChoiceChange(choice._id, 'effort', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <button 
                          onClick={() => handleSaveChoice(choice._id)}
                          className="px-5 py-2 bg-zinc-200 text-zinc-900 text-sm font-medium rounded-lg hover:bg-white transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Choice Form */}
                <form onSubmit={handleAddChoice} className="mt-8 flex gap-3 border-t border-zinc-800/50 pt-6">
                  <input 
                    value={newChoiceText}
                    onChange={e => setNewChoiceText(e.target.value)}
                    placeholder="Type new choice..."
                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
                  />
                  <button type="submit" disabled={!newChoiceText.trim()} className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                    + Add Choice
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center text-zinc-500 p-8 border border-zinc-800/50 border-dashed rounded-2xl">
                <span className="block text-2xl mb-3 opacity-50">❖</span>
                <p className="font-light">Select a node from the left panel to begin editing.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NodeBuilder;
