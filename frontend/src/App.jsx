import { useState } from 'react'
import './App.css'
import Simulator from './components/Simulator'
import ScenarioBuilder from './components/ScenarioBuilder'

function App() {
  const [view, setView] = useState('builder') // 'simulator' or 'builder'

  // This will just randomly pick a hardcoded ID for now if you haven't wired it up
  // We can eventually lift state to pass a selected scenario ID to the Simulator
  const [activeSimulatorNodeId, setActiveSimulatorNodeId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 p-4 mb-8 flex justify-center gap-4">
        <button 
          onClick={() => setView('builder')}
          className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${view === 'builder' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          Scenario Builder
        </button>
        <button 
          onClick={() => setView('simulator')}
          className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${view === 'simulator' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          Simulator
        </button>
      </nav>

      <main>
        {view === 'builder' ? (
          <ScenarioBuilder />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center max-w-lg text-gray-500 text-sm p-4 bg-white rounded shadow-sm border">
              <p>For the simulator to work seamlessly, paste a valid Root Node ID below, or simply hardcode one.</p>
              <input 
                placeholder="Paste Root Node ID here..."
                value={activeSimulatorNodeId || ''}
                onChange={e => setActiveSimulatorNodeId(e.target.value)}
                className="mt-3 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {activeSimulatorNodeId ? (
              <Simulator initialNodeId={activeSimulatorNodeId} key={activeSimulatorNodeId} />
            ) : (
              <p className="text-gray-400 italic">Please enter a Node ID above to start</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
