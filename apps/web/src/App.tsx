import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>HealthPartnershipX</h1>
      <p>Healthcare Partnership and Collaboration Platform</p>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setCount((count) => count + 1)}>
          Count: {count}
        </button>
      </div>

      <div style={{ marginTop: '2rem', color: '#666' }}>
        <p>Frontend initialized successfully!</p>
        <p>Edit <code>apps/web/src/App.tsx</code> to get started.</p>
      </div>
    </div>
  )
}

export default App
