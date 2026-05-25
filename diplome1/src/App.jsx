import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Constructor from './pages/Constructor'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Tracking from './pages/Tracking'

function App() {
  return (
    <>
      <Header />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/constructor" element={<Constructor />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </main>
    </>
  )
}

export default App;