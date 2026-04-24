import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function ScenarioBuilder() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [nodes, setNodes] = useState([]);

  // Forms state
  const [newScenarioTitle, setNewScenarioTitle] = useState('');
  const [newNodeText, setNewNodeText] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [choiceForm, setChoiceForm] = useState({ text: '', nextNode: '', reward: 0, effort: 0 });

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await api.getScenarios();
      setScenarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNodes = async (scenarioId) => {
    try {
      const data = await api.getScenarioNodes(scenarioId);
      setNodes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateScenario = async (e) => {
    e.preventDefault();
    if (!newScenarioTitle) return;
    try {
      const created = await api.createScenario({ title: newScenarioTitle });
      setScenarios([created, ...scenarios]);
      setNewScenarioTitle('');
      selectScenario(created);
    } catch (err) {
      console.error(err);
    }
  };

  const selectScenario = (s) => {
    setCurrentScenario(s);
    loadNodes(s._id);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!newNodeText || !currentScenario) return;
    try {
      const created = await api.createNode({ text: newNodeText, scenario: currentScenario._id });
      setNodes([...nodes, created]);
      setNewNodeText('');
      
      // If it's the first node, automatically make it the rootNode
      if (nodes.length === 0) {
        const updated = await api.updateScenario(currentScenario._id, { rootNode: created._id });
        setCurrentScenario(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChoice = async (e, nodeId) => {
    e.preventDefault();
    if (!choiceForm.text) return;
    try {
      await api.addChoice(nodeId, {
        ...choiceForm,
        nextNode: choiceForm.nextNode || undefined // ensure empty string is sent as undefined
      });
      // reload nodes
      loadNodes(currentScenario._id);
      setChoiceForm({ text: '', nextNode: '', reward: 0, effort: 0 });
      setActiveNodeId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 font-sans">
      {/* Left Sidebar: Scenarios List */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Scenarios</h2>
          
          <form onSubmit={handleCreateScenario} className="flex gap-2 mb-6">
            <input 
              value={newScenarioTitle}
              onChange={e => setNewScenarioTitle(e.target.value)}
              placeholder="New Scenario Title"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add</button>
          </form>

          <ul className="space-y-2">
            {scenarios.map(s => (
              <li key={s._id}>
                <button 
                  onClick={() => selectScenario(s)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${currentScenario?._id === s._id ? 'bg-blue-50 border-blue-200 border text-blue-700 font-medium' : 'bg-gray-50 border border-transparent text-gray-700 hover:bg-gray-100'}`}
                >
                  {s.title}
                </button>
              </li>
            ))}
            {scenarios.length === 0 && <p className="text-sm text-gray-500 italic">No scenarios yet.</p>}
          </ul>
        </div>
      </div>

      {/* Main Content: Builder */}
      <div className="w-full md:w-2/3">
        {currentScenario ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
            <header>
              <h1 className="text-2xl font-bold text-gray-800">{currentScenario.title}</h1>
              <p className="text-sm text-gray-500 mt-1 font-mono">ID: {currentScenario._id}</p>
              <p className="text-sm text-gray-500 font-mono">Root Node: {currentScenario.rootNode || 'None'}</p>
            </header>

            {/* Create Node Form */}
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Add a State / Node</h3>
              <form onSubmit={handleCreateNode} className="flex gap-2">
                <input 
                  value={newNodeText}
                  onChange={e => setNewNodeText(e.target.value)}
                  placeholder="e.g., 'You reach a crossroads...'"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">Create Node</button>
              </form>
            </div>

            {/* Nodes List */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Nodes & Choices</h3>
              {nodes.map(node => (
                <div key={node._id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:border-blue-200 transition-colors">
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800 text-lg">{node.text}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {node._id}</p>
                  </div>

                  {/* Existing Choices */}
                  {node.choices && node.choices.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {node.choices.map((c, i) => (
                        <li key={i} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 gap-2">
                          <span className="font-medium text-gray-700">{c.text}</span>
                          <div className="flex gap-3 text-xs text-gray-500 font-mono">
                            <span className="bg-white px-2 py-1 rounded border">Next: {c.nextNode ? c.nextNode.substring(c.nextNode.length - 6) : 'None'}</span>
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">Reward: {c.reward}</span>
                            <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">Effort: {c.effort}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add Choice Form Toggle */}
                  {activeNodeId === node._id ? (
                    <form onSubmit={(e) => handleAddChoice(e, node._id)} className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 mt-4">
                      <input 
                        required
                        value={choiceForm.text}
                        onChange={e => setChoiceForm({...choiceForm, text: e.target.value})}
                        placeholder="Choice text (e.g. 'Go left')"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          value={choiceForm.nextNode}
                          onChange={e => setChoiceForm({...choiceForm, nextNode: e.target.value})}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Next Node (Optional)</option>
                          {nodes.filter(n => n._id !== node._id).map(n => (
                            <option key={n._id} value={n._id}>{n.text.substring(0, 30)}... ({n._id.substring(n._id.length - 6)})</option>
                          ))}
                        </select>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 font-medium">Reward</label>
                            <input 
                              type="number"
                              value={choiceForm.reward}
                              onChange={e => setChoiceForm({...choiceForm, reward: Number(e.target.value)})}
                              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 font-medium">Effort</label>
                            <input 
                              type="number"
                              value={choiceForm.effort}
                              onChange={e => setChoiceForm({...choiceForm, effort: Number(e.target.value)})}
                              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setActiveNodeId(null)} className="text-sm font-medium text-gray-500 hover:text-gray-800">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm">Save Choice</button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => {
                        setActiveNodeId(node._id);
                        setChoiceForm({ text: '', nextNode: '', reward: 0, effort: 0 });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      + Add a Choice
                    </button>
                  )}
                </div>
              ))}
              
              {nodes.length === 0 && <p className="text-gray-500 text-sm italic">No nodes created yet. Start by creating the first state above.</p>}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center p-12 bg-white rounded-xl border border-gray-200 border-dashed shadow-sm">
            <div className="text-center">
              <div className="text-gray-300 mb-3 text-5xl">🏗️</div>
              <p className="text-gray-500 text-lg font-medium">Select or create a scenario to begin building.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
