import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Note: StrictMode is intentionally omitted. Its dev-only double-invocation
// deadlocks framer-motion's AnimatePresence `mode="wait"` exit callbacks,
// freezing screen transitions. Production builds are unaffected either way.
createRoot(document.getElementById('root')!).render(<App />)
