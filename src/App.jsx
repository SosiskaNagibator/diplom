import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Constructor from './pages/Constructor'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Tracking from './pages/Tracking'

function App() {
  const [cart, setCart] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [lastAdded, setLastAdded] = useState('')

  const addToCart = (pizza) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === pizza.id)
      if (existing) {
        return prev.map(item =>
          item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...pizza, quantity: 1 }]
    })
    setLastAdded(pizza.name)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/catalog" element={<Catalog addToCart={addToCart} />} />
          <Route path="/constructor" element={<Constructor addToCart={addToCart} />} />
          <Route path="/cart" element={
            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </main>

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-slide-up z-50">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full text-white text-xs font-bold">✓</span>
          {lastAdded} добавлена в корзину
        </div>
      )}
    </>
  )
}

export default App