/**
 * IgExtractor — React Component
 * --------------------------------
 * Drop-in Instagram Post ID extraction tool with history.
 *
 * Props:
 *   apiBase  (string)  — Base URL for API routes. Default: '/api'
 *   showHistory (bool) — Show extraction history table. Default: true
 *
 * Usage:
 *   import IgExtractor from './ig-extractor-module/components/IgExtractor';
 *   <IgExtractor apiBase="/api" showHistory={true} />
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './IgExtractor.module.css';

const POST_TYPE_COLORS = {
  post:  { bg: '#e0f2fe', text: '#0369a1' },
  reel:  { bg: '#fef3c7', text: '#b45309' },
  tv:    { bg: '#f3e8ff', text: '#7c3aed' },
  story: { bg: '#dcfce7', text: '#15803d' },
};

const EXAMPLE_URLS = [
  { type: 'Post', url: 'https://www.instagram.com/p/C8W9X7ys1aR/' },
  { type: 'Reel', url: 'https://www.instagram.com/reel/DAhK2L_ySzJ/' },
  { type: 'IGTV', url: 'https://www.instagram.com/tv/CWtB3xYJhFm/' },
  { type: 'Story', url: 'https://www.instagram.com/stories/instagram/3456789012345678901/' },
];

export default function IgExtractor({ apiBase = '/api', showHistory = true }) {
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
      setError('Please enter an Instagram URL');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/ig-extract`, {
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

      // Refresh history after successful extraction
      if (showHistory && json.saved) {
        fetchHistory();
      }
    } catch (err) {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [inputUrl, apiBase, showHistory]);

  // ------- History -------
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${apiBase}/ig-extract/history?limit=20`);
      const json = await res.json();
      if (json.success) {
        setHistory(json.data || []);
      }
    } catch {
      // Silently fail — history is non-critical
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
      // Fallback
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
      const res = await fetch(`${apiBase}/ig-extract/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // Silent fail
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
    const color = POST_TYPE_COLORS[type] || POST_TYPE_COLORS.post;
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>IG Post ID Extractor</h2>
        <span className={styles.subtitle}>Shortcode & Media ID Decoder</span>
      </div>

      {/* Input */}
      <div className={styles.inputSection}>
        <label htmlFor="ig-url-input" className={styles.label}>
          Instagram URL
        </label>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            id="ig-url-input"
            type="url"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="Paste Instagram URL here..."
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
            <TypeBadge type={result.post_type || result.postType} />
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Shortcode</span>
            <div className={styles.resultValue}>
              <code>{result.shortcode}</code>
              <CopyBtn text={result.shortcode} label="shortcode" />
            </div>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Media ID</span>
            <div className={styles.resultValue}>
              <code>{result.media_id || result.mediaId}</code>
              <CopyBtn text={result.media_id || result.mediaId} label="mediaId" />
            </div>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Post Type</span>
            <div className={styles.resultValue}>
              <code>{(result.post_type || result.postType || '').toUpperCase()}</code>
              <CopyBtn text={result.post_type || result.postType} label="postType" />
            </div>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Clean URL</span>
            <div className={styles.resultValue}>
              <code className={styles.urlValue}>{result.original_url || result.originalUrl}</code>
              <CopyBtn text={result.original_url || result.originalUrl} label="url" />
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && (
        <div className={styles.emptyState}>
          <p>Paste an Instagram URL above to extract the post shortcode and numeric media ID.</p>
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
                {ex.url.replace('https://www.', '')}
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
                  <th>Shortcode</th>
                  <th>Media ID</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><TypeBadge type={item.post_type} /></td>
                    <td><code>{item.shortcode}</code></td>
                    <td><code className={styles.mediaIdCell}>{item.media_id}</code></td>
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
