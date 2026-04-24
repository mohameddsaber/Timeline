import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Simulator from './pages/Simulator';
import ScenarioManager from './components/ScenarioManager';
import NodeBuilder from './components/NodeBuilder';
import LandingPage from './components/LandingPage';

// --- Route Wrappers ---
// These extract URL routing logic so your core components don't need to be rewritten.

const LandingWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onEnter={() => navigate('/scenarios')} />;
};

const ManagerWrapper = () => {
  const navigate = useNavigate();
  return <ScenarioManager onOpenBuilder={(id) => navigate(`/builder/${id}`)} />;
};

const BuilderWrapper = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  return (
    <NodeBuilder
      scenarioId={scenarioId}
      onBack={() => navigate('/scenarios')}
      onOpenSimulator={(rootId) => {
        if (rootId) navigate(`/simulator/${rootId}`);
      }}
    />
  );
};

const SimulatorWrapper = () => {
  const { rootId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      {/* Top Navbar for Simulator Exit */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 pointer-events-none">
        <button
          onClick={() => navigate(-1)} // Navigates exactly one step back in browser history
          className="pointer-events-auto px-4 py-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-400 text-xs font-medium uppercase tracking-widest rounded-lg hover:text-zinc-200 transition-colors shadow-lg"
        >
          &larr; Exit Simulator
        </button>
      </nav>
      <Simulator
        initialNodeId={rootId}
        key={rootId}
        onExit={() => navigate('/scenarios')}
      />
    </>
  );
};

// --- Main App Component ---

function App() {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-zinc-800">

      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/scenarios" element={<ManagerWrapper />} />
        <Route path="/builder/:scenarioId" element={<BuilderWrapper />} />
        <Route path="/simulator/:rootId" element={<SimulatorWrapper />} />
      </Routes>

    </div>
  );
}

export default App;