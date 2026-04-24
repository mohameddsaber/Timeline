import { useState } from 'react'
import Simulator from './components/Simulator'
import ScenarioManager from './components/ScenarioManager'
import NodeBuilder from './components/NodeBuilder'

function App() {
  const [view, setView] = useState('manager') // 'manager', 'builder', 'simulator'
  const [activeScenarioId, setActiveScenarioId] = useState(null)
  const [simulatorRootId, setSimulatorRootId] = useState(null)

  const handleOpenBuilder = (id) => {
    setActiveScenarioId(id)
    setView('builder')
  }

  const handleOpenSimulator = (rootId) => {
    if (!rootId) return;
    setSimulatorRootId(rootId)
    setView('simulator')
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-zinc-800">
      {/* Top Navbar for Simulator Exit */}
      {view === 'simulator' && (
        <nav className="fixed top-0 left-0 w-full p-6 z-50 pointer-events-none">
           <button 
            onClick={() => setView('builder')}
            className="pointer-events-auto px-4 py-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-400 text-xs font-medium uppercase tracking-widest rounded-lg hover:text-zinc-200 transition-colors shadow-lg"
          >
            &larr; Exit Simulator
          </button>
        </nav>
      )}

      {view === 'manager' && (
        <ScenarioManager onOpenBuilder={handleOpenBuilder} />
      )}
      
      {view === 'builder' && activeScenarioId && (
        <NodeBuilder 
          scenarioId={activeScenarioId} 
          onBack={() => setView('manager')} 
          onOpenSimulator={handleOpenSimulator}
        />
      )}

      {view === 'simulator' && simulatorRootId && (
        <Simulator initialNodeId={simulatorRootId} key={simulatorRootId} />
      )}
    </div>
  )
}

export default App
