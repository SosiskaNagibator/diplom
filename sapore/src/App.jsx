import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Constructor from './pages/Constructor';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import Contacts from './pages/Contacts';
import { useCart } from './contexts/CartContext';

function App() {
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [lastAdded, setLastAdded] = useState('');
  const location = useLocation();

  const handleAddToCart = (pizza) => {
    addToCart(pizza);
    setLastAdded(pizza.name);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Home addToCart={handleAddToCart} />
              </motion.div>
            } />
            <Route path="/catalog" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Catalog addToCart={handleAddToCart} />
              </motion.div>
            } />
            <Route path="/constructor" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Constructor addToCart={handleAddToCart} />
              </motion.div>
            } />
            <Route path="/cart" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Cart />
              </motion.div>
            } />
            <Route path="/profile" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Profile />
              </motion.div>
            } />
            <Route path="/tracking" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Tracking />
              </motion.div>
            } />
            <Route path="/admin" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Admin />
              </motion.div>
            } />
            <Route path="/contacts" element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Contacts />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 z-50" style={{ transform: 'translateX(-50%)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full text-white text-xs font-bold">✓</span>
            {lastAdded} добавлена в корзину
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;