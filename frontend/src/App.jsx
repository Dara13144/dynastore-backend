import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import WatchMovie from './pages/WatchMovie';
import Podcasts from './pages/Podcasts';
import Wishlist from './pages/Wishlist';
import TopUp from './pages/TopUp';
import TopupSuccess from './pages/TopupSuccess';
import TopupCancel from './pages/TopupCancel';
import UserDashboard from './pages/UserDashboard';
import About from './pages/CMS/About';

import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

import AdminCinema from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminPodcasts from './pages/Admin/AdminPodcasts';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminPayWay from './pages/Admin/AdminPayWay';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <WalletProvider>
              <CartProvider>
                <div className="min-h-screen bg-theme-bg text-gray-100 flex flex-col justify-between selection:bg-theme-gold selection:text-black transition-colors duration-300">
              <div>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movie/:slug" element={<MovieDetails />} />
                  <Route path="/watch/:slug" element={<WatchMovie />} />
                  <Route path="/podcasts" element={<Podcasts />} />
                  <Route path="/wishlist" element={<Wishlist />} />

                  {/* E-Commerce & ABA PayWay KHQR Routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/failed" element={<PaymentFailed />} />
                  <Route path="/orders" element={<Orders />} />

                  {/* Top Up Routes */}
                  <Route path="/topup" element={<TopUp />} />
                  <Route path="/wallet/topup" element={<TopUp />} />
                  <Route path="/wallet/topup/success" element={<TopupSuccess />} />
                  <Route path="/wallet/topup/cancel" element={<TopupCancel />} />

                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/about" element={<About />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminCinema />} />
                  <Route path="/admin/ecommerce" element={<AdminDashboard />} />
                  <Route path="/admin/cinema" element={<AdminCinema />} />
                  <Route path="/admin/movies" element={<AdminMovies />} />
                  <Route path="/admin/podcasts" element={<AdminPodcasts />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                  <Route path="/admin/payway" element={<AdminPayWay />} />
                </Routes>
              </div>
              <Footer />
              <AuthModal />
              <ToastContainer position="bottom-right" theme="dark" />
            </div>
          </CartProvider>
        </WalletProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</Router>
  );
}

export default App;
