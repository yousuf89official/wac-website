/**
 * TtExtractor — React Component
 * --------------------------------
 * Drop-in TikTok Post ID extraction tool with history.
 *
 * Props:
 *   apiBase     (string)  — Base URL for API routes. Default: '/api'
 *   showHistory (bool)    — Show extraction history table. Default: true
 *
 * Usage:
 *   import TtExtractor from './tiktok-extractor-module/components/TtExtractor';
 *   <TtExtractor apiBase="/api" showHistory={true} />
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './TtExtractor.module.css';

const POST_TYPE_COLORS = {
  video:    { bg: '#e0f2fe', text: '#0369a1' },
  photo:    { bg: '#fef3c7', text: '#b45309' },
  embed:    { bg: '#f3e8ff', text: '#7c3aed' },
  share:    { bg: '#dcfce7', text: '#15803d' },
  short:    { bg: '#fce7f3', text: '#be185d' },
  trending: { bg: '#ffe4e6', text: '#e11d48' },
};

const EXAMPLE_URLS = [
  { type: 'Video', url: 'https://www.tiktok.com/@charlidamelio/video/7067695578729221378' },
  { type: 'Photo', url: 'https://www.tiktok.com/@username/photo/7234567890123456789' },
  { type: 'Short', url: 'https://vm.tiktok.com/ZMF6rgvXY/' },
  { type: 'Mobile', url: 'https://m.tiktok.com/v/6749869095467945218.html' },
];

export default function TtExtractor({ apiBase = '/api', showHistory = true }) {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const inputRef = useRef(null);

  // ------- Extract -------
  const handleExtract = useCallback(async (url) => {
    const target = url || inputUrl;
    if (!target.trim()) {
      setError('Please enter a TikTok URL');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/tt-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target.trim() }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Extraction failed');
        return;
      }

      setResult(json.data);

      if (showHistory && json.saved) {
        fetchHistory();
      }
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [inputUrl, apiBase, showHistory]);

  // ------- History -------
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${apiBase}/tt-extract/history?limit=20`);
      const json = await res.json();
      if (json.success) {
        setHistory(json.data || []);
      }
    } catch {
      // Silent
    } finally {
      setHistoryLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, fetchHistory]);

  // ------- Copy -------
  const handleCopy = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    }
  }, []);

  // ------- Clear -------
  const handleClear = useCallback(() => {
    setInputUrl('');
    setResult(null);
    setError('');
    inputRef.current?.focus();
  }, []);

  // ------- Delete -------
  const handleDelete = useCallback(async (id) => {
    try {
      const res = await fetch(`${apiBase}/tt-extract/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // Silent
    }
  }, [apiBase]);

  // ------- Key handler -------
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExtract();
    }
  }, [handleExtract]);

  // ------- Badge -------
  const TypeBadge = ({ type }) => {
    const color = POST_TYPE_COLORS[type] || POST_TYPE_COLORS.video;
    return (
      <span
        className={styles.badge}
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {type?.toUpperCase()}
      </span>
    );
  };

  // ------- Copy button -------
  const CopyBtn = ({ text, label }) => (
    <button
      className={styles.copyBtn}
      onClick={() => handleCopy(text, label)}
      title={`Copy ${label}`}
    >
      {copied === label ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8.5l4 4 8-9" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="9" height="9" rx="1.5" />
          <path d="M5 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V5" />
        </svg>
      )}
    </button>
  );

  // Determine display fields based on result shape
  const videoId = result?.video_id ?? result?.videoId;
  const username = result?.username;
  const shortCode = result?.short_code ?? result?.shortCode;
  const postType = result?.post_type ?? result?.postType;
  const originalUrl = result?.original_url ?? result?.originalUrl;
  const isShort = result?.is_short_url ?? result?.isShortUrl;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>TikTok Post ID Extractor</h2>
        <span className={styles.subtitle}>Video ID & Username Decoder</span>
      </div>

      {/* Input */}
      <div className={styles.inputSection}>
        <label htmlFor="tt-url-input" className={styles.label}>
          TikTok URL
        </label>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            id="tt-url-input"
            type="url"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="Paste TikTok URL here..."
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className={styles.extractBtn}
            onClick={() => handleExtract()}
            disabled={loading}
          >
            {loading ? 'Extracting...' : 'Extract'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <button className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsTitle}>Extraction Results</span>
            <TypeBadge type={postType} />
          </div>

          {videoId && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Video ID</span>
              <div className={styles.resultValue}>
                <code>{videoId}</code>
                <CopyBtn text={videoId} label="videoId" />
              </div>
            </div>
          )}

          {shortCode && !videoId && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Short Code</span>
              <div className={styles.resultValue}>
                <code>{shortCode}</code>
                <CopyBtn text={shortCode} label="shortCode" />
              </div>
            </div>
          )}

          {username && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Username</span>
              <div className={styles.resultValue}>
                <code>@{username}</code>
                <CopyBtn text={username} label="username" />
              </div>
            </div>
          )}

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Post Type</span>
            <div className={styles.resultValue}>
              <code>{(postType || '').toUpperCase()}</code>
              <CopyBtn text={postType || ''} label="postType" />
            </div>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Clean URL</span>
            <div className={styles.resultValue}>
              <code className={styles.urlValue}>{originalUrl}</code>
              <CopyBtn text={originalUrl || ''} label="url" />
            </div>
          </div>

          {isShort && (
            <div className={styles.shortWarning}>
              Short URLs (vm.tiktok.com) cannot be fully resolved client-side. The video ID requires server-side redirect follow. Use the short code above for reference.
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !error && (
        <div className={styles.emptyState}>
          <p>Paste a TikTok URL above to extract the video ID, username, and post metadata.</p>
        </div>
      )}

      {/* Example URLs */}
      <div className={styles.examples}>
        <span className={styles.examplesTitle}>Try an example</span>
        <div className={styles.examplesList}>
          {EXAMPLE_URLS.map((ex) => (
            <button
              key={ex.type}
              className={styles.exampleBtn}
              onClick={() => {
                setInputUrl(ex.url);
                handleExtract(ex.url);
              }}
            >
              <span className={styles.exampleType}>{ex.type}</span>
              <code className={styles.exampleUrl}>
                {ex.url.replace('https://www.', '').replace('https://', '')}
              </code>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className={styles.history}>
          <h3 className={styles.historyTitle}>
            Recent Extractions
            <button className={styles.refreshBtn} onClick={fetchHistory} disabled={historyLoading}>
              {historyLoading ? '...' : '↻'}
            </button>
          </h3>
          <div className={styles.historyTable}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Video ID</th>
                  <th>Username</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><TypeBadge type={item.post_type} /></td>
                    <td><code className={styles.videoIdCell}>{item.video_id || item.short_code || '—'}</code></td>
                    <td>{item.username ? <code>@{item.username}</code> : <span className={styles.muted}>—</span>}</td>
                    <td className={styles.dateCell}>
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
