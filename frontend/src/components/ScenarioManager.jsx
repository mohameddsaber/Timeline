import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';

const ScenarioManager = ({ onOpenBuilder, onOpenSimulator }) => {
  const [scenarios, setScenarios] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const created = await api.createScenario({ title });
      setScenarios([created, ...scenarios]);
      setTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-light tracking-wide text-zinc-100">Scenario Manager</h1>
          <p className="text-zinc-500 mt-2">Create and manage your interactive experiences.</p>
        </header>

        <form onSubmit={handleCreate} className="flex gap-4">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New Scenario Title..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={loading || !title.trim()}
            className="px-6 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-lg hover:bg-zinc-300 disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4">
          {scenarios.map((s) => (
            <motion.div 
              key={s._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div>
                <h3 className="text-xl font-light text-zinc-200">{s.title}</h3>
                <p className="text-xs font-mono text-zinc-600 mt-1">ID: {s._id}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenSimulator(s.rootNode)}
                  disabled={!s.rootNode}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    s.rootNode 
                      ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20' 
                      : 'border border-zinc-800 text-zinc-700 cursor-not-allowed'
                  }`}
                  title={s.rootNode ? 'Play Simulator' : 'No Root Node set'}
                >
                  Play
                </button>
                <button 
                  onClick={() => onOpenBuilder(s._id)}
                  className="px-4 py-2 text-sm font-medium border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  Open Builder &rarr;
                </button>
              </div>
            </motion.div>
          ))}
          {scenarios.length === 0 && (
            <div className="text-center py-12 text-zinc-600 font-light border border-zinc-800/50 border-dashed rounded-xl">
              No scenarios yet. Create one above to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioManager;
