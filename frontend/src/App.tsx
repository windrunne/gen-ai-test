import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ExperimentDetail from './pages/ExperimentDetail'
import ExperimentsList from './pages/ExperimentsList'

function App() {
  // Debug: Check if component is rendering
  console.log('App component rendering...')
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiments" element={<ExperimentsList />} />
        <Route path="/experiments/:id" element={<ExperimentDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
