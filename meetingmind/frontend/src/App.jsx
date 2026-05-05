import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MeetingDetail from './pages/MeetingDetail';
import UploadMeeting from './pages/UploadMeeting';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--success))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>M</div>
            MeetingMind
          </h2>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadMeeting />} />
            <Route path="/meeting/:id" element={<MeetingDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
