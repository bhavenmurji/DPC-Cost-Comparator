import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { initializeEnv, logEnvValidation } from './config/env.ts'
import './index.css'

// Validate environment variables at startup
const envValidation = initializeEnv()

// Log validation results (warnings and errors)
logEnvValidation()

// Block application startup if critical environment variables are missing
if (!envValidation.success) {
  const errorMessage = envValidation.errors.join('\n')
  const rootElement = document.getElementById('root')

  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 40px;
          max-width: 600px;
          text-align: center;
        ">
          <div style="
            font-size: 48px;
            margin-bottom: 20px;
          ">⚠️</div>
          <h1 style="
            margin: 0 0 20px 0;
            color: #1f2937;
            font-size: 24px;
          ">Configuration Error</h1>
          <p style="
            color: #6b7280;
            margin: 0 0 30px 0;
            line-height: 1.6;
            white-space: pre-wrap;
          ">${errorMessage}</p>
          <div style="
            background: #f3f4f6;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
            border-radius: 4px;
          ">
            <p style="
              color: #1f2937;
              margin: 0 0 10px 0;
              font-weight: 600;
            ">Setup Instructions:</p>
            <ol style="
              color: #4b5563;
              margin: 10px 0 0 0;
              padding-left: 20px;
            ">
              <li>Copy <code>.env.example</code> to <code>.env</code></li>
              <li>Fill in the required environment variables</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <button onclick="location.reload()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
            Retry
          </button>
        </div>
      </div>
    `
  }

  throw new Error(`Application startup blocked: ${envValidation.errors[0]}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary errorBoundaryId="root">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
