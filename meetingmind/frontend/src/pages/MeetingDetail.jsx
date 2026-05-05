import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { meetingsApi } from '../api';
import { ArrowLeft, Download, Mail, MessageSquare, Send, CheckCircle2, Clock, User, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

function MeetingDetail() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, chat, email
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef(null);

  // Email state
  const [emailData, setEmailData] = useState(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMeetingData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && chatHistory.length === 0) {
      fetchChatHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const fetchMeetingData = async () => {
    try {
      const response = await meetingsApi.getMeeting(id);
      if (response.data.success) {
        setMeeting(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch meeting details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await meetingsApi.getChatHistory(id);
      if (response.data.success) {
        setChatHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsgText = message;
    setMessage('');
    
    // Optimistic UI update
    const newChat = [...chatHistory, { role: 'user', content: userMsgText, created_at: new Date().toISOString() }];
    setChatHistory(newChat);
    setSendingMsg(true);

    try {
      const response = await meetingsApi.sendMessage(id, userMsgText);
      if (response.data.success) {
        setChatHistory([...newChat, { role: 'assistant', content: response.data.data.reply, created_at: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    try {
      const response = await meetingsApi.generateEmail(id);
      if (response.data.success) {
        setEmailData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to generate email', error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyEmailToClipboard = () => {
    if (!emailData) return;
    const textToCopy = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Meeting not found</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{meeting.title}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> 
                {new Date(meeting.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <a href={meetingsApi.exportMarkdown(id)} className="btn-secondary" download>
            <Download size={18} /> Export MD
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto' }}>
        {[
          { id: 'summary', icon: FileText, label: 'Summary & Action Items' },
          { id: 'chat', icon: MessageSquare, label: 'Chat with AI' },
          { id: 'email', icon: Mail, label: 'Follow-up Email' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUMMARY TAB */}
      {activeTab === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Executive Summary
            </h3>
            <p style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>{meeting.summary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="var(--success)" /> Action Items
              </h3>
              {meeting.action_items && meeting.action_items.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {meeting.action_items.map((item, idx) => (
                    <li key={idx} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 0.75rem 0', fontWeight: 500 }}>{item.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={14} /> {item.assignee || 'Unassigned'}
                        </span>
                        {item.deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={14} /> {item.deadline}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No action items found.</p>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--accent-primary)" /> Key Decisions
              </h3>
              {meeting.decisions && meeting.decisions.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {meeting.decisions.map((decision, idx) => (
                    <li key={idx} style={{ lineHeight: '1.6' }}>{decision}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No key decisions recorded.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
            <h3 style={{ margin: 0 }}>Ask questions about the meeting</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>The AI assistant has access to the full transcript and summary.</p>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatHistory.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Send a message to start chatting</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px',
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px',
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.content}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                </div>
              ))
            )}
            {sendingMsg && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', borderBottomLeftRadius: '4px' }}>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendingMsg}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={sendingMsg || !message.trim()} style={{ padding: '0 1.5rem' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
          {!emailData ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                <Mail size={32} />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Generate Follow-up Email</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                Let AI draft a professional follow-up email summarizing the discussion, highlighting key decisions, and clearly listing action items for all participants.
              </p>
              <button className="btn-primary" onClick={handleGenerateEmail} disabled={generatingEmail}>
                {generatingEmail ? (
                  <><div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> Generating...</>
                ) : (
                  'Generate Draft'
                )}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={20} color="var(--success)" /> Draft Email
                </h3>
                <button className="btn-secondary" onClick={copyEmailToClipboard} style={{ padding: '0.5rem 1rem' }}>
                  {copied ? <><Check size={16} color="var(--success)" /> Copied!</> : 'Copy to Clipboard'}
                </button>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', width: '80px', fontWeight: 500 }}>Subject:</span>
                    <span style={{ fontWeight: 500 }}>{emailData.subject}</span>
                  </div>
                </div>
                <div style={{ padding: '1.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: 'system-ui, sans-serif' }}>
                  {emailData.body}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default MeetingDetail;
