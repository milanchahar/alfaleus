import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingsApi } from '../api';
import { Calendar, FileText, Plus, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await meetingsApi.getMeetings();
      if (response.data.success) {
        setMeetings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await meetingsApi.deleteMeeting(id);
      setMeetings(meetings.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete meeting', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Your Meetings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and analyze your recent discussions</p>
        </div>
        <Link to="/upload" className="btn-primary">
          <Plus size={20} />
          New Analysis
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-primary)' }}>
            <FileText size={32} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>No meetings analyzed yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload a transcript or paste text to get started with AI analysis.</p>
          <Link to="/upload" className="btn-primary">
            Get Started
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {meetings.map((meeting, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={meeting.id}
            >
              <Link to={`/meeting/${meeting.id}`} style={{ display: 'block' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {meeting.title || 'Untitled Meeting'}
                    </h3>
                    <button 
                      onClick={(e) => deleteMeeting(meeting.id, e)}
                      style={{ color: 'var(--text-secondary)', padding: '0.25rem', display: 'flex' }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    <Calendar size={14} />
                    {new Date(meeting.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge">{meeting.action_items_count} Action Items</span>
                    </div>
                    <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                      View Details <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
