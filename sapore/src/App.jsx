import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CategoryPage from './pages/CategoryPage';
import Constructor from './pages/Constructor';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import Contacts from './pages/Contacts';
import PizzaDetails from './pages/PizzaDetails';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Privacy from './pages/Privacy';
import Offer from './pages/Offer';
import NotFound from './pages/NotFound';
import { useCart } from './contexts/CartContext';

function ScrollManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return null;
}

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

function App() {
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [lastAdded, setLastAdded] = useState('');
  const location = useLocation();

  const handleAddToCart = (pizza) => {
    addToCart(pizza);
    if (pizza.name === 'Пицца на заказ') return;
    setLastAdded(pizza.name);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollManager />
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes location={location}>
              <Route path="/" element={<Home addToCart={handleAddToCart} />} />
              <Route path="/catalog" element={<Catalog addToCart={handleAddToCart} />} />
              <Route path="/category/:slug" element={<CategoryPage addToCart={handleAddToCart} />} />
              <Route path="/product/:slug" element={<PizzaDetails addToCart={handleAddToCart} />} />
              <Route path="/pizza/:id" element={<PizzaDetails addToCart={handleAddToCart} />} />
              <Route path="/constructor" element={<Constructor addToCart={handleAddToCart} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/offer" element={<Offer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
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
      <CookieBanner />
    </div>
  );
}

export default App;