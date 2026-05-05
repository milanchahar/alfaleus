import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsApi } from '../api';
import { Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function UploadMeeting() {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'text' && !text.trim()) {
      setError('Please enter meeting text.');
      return;
    }
    if (activeTab === 'file' && !file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    if (activeTab === 'text') {
      formData.append('text', text);
    } else {
      formData.append('file', file);
    }

    try {
      const response = await meetingsApi.analyzeMeeting(formData);
      if (response.data.success) {
        navigate(`/meeting/${response.data.data.id}`);
      } else {
        setError(response.data.error || 'Failed to analyze meeting.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1>Analyze New Meeting</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload a transcript or paste notes to generate insights.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'text' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'none',
              borderRadius: 0,
              fontWeight: activeTab === 'text' ? 600 : 400
            }}
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('file')}
            style={{
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'file' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'file' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'none',
              borderRadius: 0,
              fontWeight: activeTab === 'file' ? 600 : 400
            }}
          >
            Upload File
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'text' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Meeting Transcript or Notes</label>
              <textarea
                className="input-field"
                rows="12"
                placeholder="Paste your meeting text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div 
                style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '4rem 2rem', 
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.3)',
                  transition: 'border-color 0.2s',
                }}
              >
                <Upload size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Click to upload or drag and drop</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Supports .txt, .vtt (Max 5MB)
                </p>
                <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                  Select File
                  <input 
                    type="file" 
                    accept=".txt,.vtt" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    style={{ display: 'none' }} 
                  />
                </label>
                {file && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                    <FileText size={18} />
                    {file.name}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="loading-spinner" style={{ borderTopColor: 'white', width: '18px', height: '18px', borderWidth: '2px' }} />
                  Analyzing...
                </>
              ) : (
                'Generate Analysis'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMeeting;
