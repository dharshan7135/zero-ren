import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Upload,
  Download,
  Activity,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  Hash,
  Box,
  RefreshCw
} from 'lucide-react';
import { apiClient, SERVERS } from './lib/api';

function App() {
  const [serverStatus, setServerStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadHash, setDownloadHash] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [healingStatus, setHealingStatus] = useState(false);

  const fileInputRef = useRef(null);

  // Poll server status and logs
  useEffect(() => {
    const poll = async () => {
      // Poll Servers
      const statuses = {};
      for (const server of SERVERS) {
        statuses[server.id] = await apiClient.getStatus(server.url);
      }
      setServerStatus(statuses);

      // Poll Logs
      try {
        const latestLogs = await apiClient.fetchLogs();
        setLogs(latestLogs);

        // Check if any healing is happening (demo heuristic: if logs contain "Healed" in last 5s)
        const isHealing = latestLogs.some(l =>
          l.action.toLowerCase().includes('healed') &&
          (new Date() - new Date(l.time)) < 5000
        );
        setHealingStatus(isHealing);
      } catch (e) {
        console.error("Log fetch failed", e);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await apiClient.uploadFile(selectedServer.url, file);
      setUploadedFile({
        ...result,
        encryption: 'AES-256-GCM',
        server: selectedServer.id
      });
      setDownloadHash(result.master_hash);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadHash) return;
    setIsDownloading(true);
    try {
      const blob = await apiClient.downloadFile(selectedServer.url, downloadHash);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'restored_file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed. File might be missing or still healing.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAttack = async () => {
    if (!confirm("Are you sure you want to simulate an attack on Node S3? This will wipe its storage.")) return;
    try {
      await apiClient.simulateAttack();
      alert("Attack simulation triggered on S3. Watch the logs for healing!");
    } catch (err) {
      alert("Attack failed: " + err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={40} color="#58a6ff" />
          <h1>Distributed Storage System</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {healingStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3fb950' }}>
              <div className="healing-spinner"></div>
              <span>Self-Healing Protocol Active</span>
            </div>
          )}
          <div className="glass-card" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            System Integrity: <span style={{ color: '#3fb950' }}>99.9%</span>
          </div>
        </div>
      </header>

      <div className="grid">
        <div className="main-content">
          <section className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={24} /> Data Ingress
            </h2>
            <div className="upload-section">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>Select Target Server:</span>
                <select
                  style={{ background: '#0d1117', color: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '4px' }}
                  value={selectedServer.id}
                  onChange={(e) => setSelectedServer(SERVERS.find(s => s.id === e.target.value))}
                >
                  {SERVERS.map(s => <option key={s.id} value={s.id}>{s.id} - Storage Node</option>)}
                </select>
              </div>

              <div className="dropzone" onClick={() => fileInputRef.current.click()}>
                <Zap size={48} color={isUploading ? '#bc8cff' : '#58a6ff'} style={{ marginBottom: '1rem' }} />
                <p>{isUploading ? "Encrypting and fragmenting..." : "Click or drag file to secure storage"}</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                />
              </div>

              {uploadedFile && (
                <div className="file-info">
                  <h3 style={{ marginBottom: '1rem', color: '#bc8cff' }}>File Information</h3>
                  <div className="info-row">
                    <span className="info-label">Filename:</span>
                    <span className="info-value">{uploadedFile.filename}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span className="info-value">{(uploadedFile.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Chunks:</span>
                    <span className="info-value">{uploadedFile.chunk_count} blocks</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Encryption:</span>
                    <span className="info-value"><Shield size={14} style={{ marginRight: '4px' }} /> {uploadedFile.encryption}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Master Hash:</span>
                    <span className="info-value" style={{ fontSize: '0.8rem' }}>{uploadedFile.master_hash}</span>
                  </div>
                  <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(63, 185, 80, 0.1)', borderRadius: '4px', textAlign: 'center', color: '#3fb950' }}>
                    <CheckCircle size={16} /> Data replicated across ALL nodes
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={24} /> Data Egress
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Enter Master Hash ID..."
                className="btn"
                style={{ flex: 1, textAlign: 'left', background: '#0d1117', color: 'white', border: '1px solid var(--border)' }}
                value={downloadHash}
                onChange={(e) => setDownloadHash(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? <RefreshCw className="healing-spinner" /> : "Reconstruct & Verify"}
              </button>
            </div>
          </section>
        </div>

        <aside className="sidebar">
          <section className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} /> Cluster Topology
            </h3>
            <div className="status-grid">
              {SERVERS.map(server => (
                <div key={server.id} className="status-item">
                  <div className={`status-indicator ${serverStatus[server.id]?.online ? 'status-online' : 'status-offline'}`}></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{server.id}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {serverStatus[server.id]?.online ? 'SYNCHRONIZED' : 'UNREACHABLE'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleAttack}
              >
                <AlertTriangle size={18} /> Simulate Attack on S3
              </button>
            </div>
          </section>

          <section className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} /> Resilience Activity
            </h3>
            <div className="log-container">
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '2rem' }}>No activity detected</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">[{new Date(log.time).toLocaleTimeString()}]</span>
                    <span className="log-server">{log.server}:</span>
                    <span>{log.action}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
