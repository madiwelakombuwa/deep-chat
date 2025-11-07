import React, { useEffect, useState } from 'react';
import { DeepChat } from 'deep-chat-react';
import { loadRemoteData, createDataContextPrompt } from '../../utils/dataLoader';

export default function DataLoaderExample() {
  const [directConnection, setDirectConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataUrl, setDataUrl] = useState('https://storage.googleapis.com/gdsshopify/MonteCarlo.csv');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);

  async function loadData(url, key) {
    setLoading(true);
    setError(null);

    try {
      // Determine file type from URL
      const fileType = url.endsWith('.json') ? 'json' : 'csv';

      // Load data from URL
      const data = await loadRemoteData(url, fileType);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('No data loaded from file');
      }

      // Create system prompt with data context
      const systemPrompt = createDataContextPrompt(
        data,
        'You are a helpful assistant that can analyze and answer questions about the provided dataset. ' +
        'When users ask about the data, provide clear and accurate answers based on the information available.',
        50 // Include first 50 rows as context
      );

      // Set up OpenAI connection with data context
      setDirectConnection({
        openAI: {
          key: key,
          chat: {
            system_prompt: systemPrompt,
            model: 'gpt-4o',
            max_tokens: 2000,
            temperature: 0.7,
          },
        },
      });

      setShowKeyInput(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadData() {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }
    if (!dataUrl.trim()) {
      setError('Please enter a data URL');
      return;
    }
    loadData(dataUrl, apiKey);
  }

  function handleReset() {
    setShowKeyInput(true);
    setDirectConnection(null);
    setError(null);
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '20px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    backgroundColor: 'var(--ifm-background-surface-color)',
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontWeight: '600',
    fontSize: '14px',
  };

  const inputStyle = {
    padding: '10px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: 'var(--ifm-background-color)',
    color: 'var(--ifm-font-color-base)',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: 'var(--ifm-color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const errorStyle = {
    padding: '12px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '6px',
    color: '#c33',
    fontSize: '14px',
  };

  const infoStyle = {
    padding: '12px',
    backgroundColor: 'var(--ifm-color-info-contrast-background)',
    border: '1px solid var(--ifm-color-info)',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.6',
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 10px 0' }}>Interactive Example: Chat with Your Data</h3>

      <div style={infoStyle}>
        <strong>Try asking:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>"What columns are in this dataset?"</li>
          <li>"Show me a summary of the data"</li>
          <li>"What are the first few rows?"</li>
          <li>"Are there any interesting patterns?"</li>
        </ul>
      </div>

      {showKeyInput && (
        <>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Data URL (CSV or JSON from Google Cloud Storage or public URL):</label>
            <input
              type="text"
              value={dataUrl}
              onChange={(e) => setDataUrl(e.target.value)}
              placeholder="https://storage.googleapis.com/bucket/file.csv"
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>OpenAI API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={inputStyle}
            />
            <small style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '12px' }}>
              Your API key is only used in your browser and never sent to any server except OpenAI.
            </small>
          </div>

          <button onClick={handleLoadData} style={buttonStyle} disabled={loading}>
            {loading ? 'Loading...' : 'Load Data & Start Chat'}
          </button>
        </>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      {!showKeyInput && directConnection && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--ifm-color-success)' }}>
              ✓ Data loaded successfully! Start asking questions below.
            </span>
            <button
              onClick={handleReset}
              style={{
                ...buttonStyle,
                backgroundColor: 'var(--ifm-color-emphasis-300)',
                padding: '6px 12px',
                fontSize: '12px',
              }}
            >
              Reset
            </button>
          </div>
          <DeepChat
            directConnection={directConnection}
            style={{
              borderRadius: '8px',
              height: '500px',
              width: '100%',
            }}
            messageStyles={{
              default: {
                shared: {
                  bubble: {
                    maxWidth: '100%',
                    backgroundColor: 'var(--ifm-background-surface-color)',
                    color: 'var(--ifm-font-color-base)',
                  },
                },
              },
            }}
            textInput={{
              placeholder: {
                text: 'Ask questions about your data...',
              },
            }}
          />
        </>
      )}

      {loading && !showKeyInput && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ifm-color-emphasis-600)' }}>
          Loading data and initializing chat...
        </div>
      )}
    </div>
  );
}
