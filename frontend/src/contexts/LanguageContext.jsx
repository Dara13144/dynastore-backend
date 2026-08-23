import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const dictionary = {
  en: {
    navHome: 'HOME',
    navMovies: 'GAME',
    navOrders: 'MY ORDERS',
    navTopUp: 'Top Up',
    navWishlist: 'Wishlist',
    navDashboard: 'Dashboard',
    navAdmin: 'Admin Portal',
    navSignOut: 'Sign Out',
    signIn: 'Sign In',
    register: 'Register',
    availableBalance: 'Available Balance',
    topUpWallet: 'Top Up Wallet Balance',
    paymentGateway: 'Payment Gateway',
    scanAndPay: 'KHQR Scan & Pay via ABA Mobile App',
    generateCode: 'Generate Payment Code',
    myOrders: 'MY ORDERS',
    watchMovie: 'Watch Movie Video',
    play: 'Play',
    completed: 'COMPLETED',
    pending: 'PENDING',
    failed: 'FAILED',
    totalPaid: 'Total Amount Paid',
    modeNight: 'Night Mode',
    modeLight: 'Light Mode',
    langName: 'English',
    langSwitch: 'ភាសាខ្មែរ (KM)'
  },
  km: {
    navHome: 'HOME',
    navMovies: 'GAME',
    navOrders: 'MY ORDERS',
    navTopUp: 'បញ្ចូលប្រាក់',
    navWishlist: 'បញ្ជីប្រាថ្នា',
    navDashboard: 'ផ្ទាំងគ្រប់គ្រង',
    navAdmin: 'ផ្ទាំងអភិបាល',
    navSignOut: 'ចាកចេញ',
    signIn: 'ចូលប្រើ',
    register: 'ចុះឈ្មោះ',
    availableBalance: 'សមតុល្យដែលមាន',
    topUpWallet: 'បញ្ចូលប្រាក់ក្នុងកាបូប',
    paymentGateway: 'ប្រព័ន្ធទូទាត់ប្រាក់',
    scanAndPay: 'ស្កែនទូទាត់តាម ABA Mobile App',
    generateCode: 'បង្កើតកូដទូទាត់ប្រាក់',
    myOrders: 'MY ORDERS',
    watchMovie: 'ទស្សនាវីដេអូ',
    play: 'លេង',
    completed: 'បានទូទាត់រួច',
    pending: 'រង់ចាំទូទាត់',
    failed: 'បរាជ័យ',
    totalPaid: 'ចំនួនប្រាក់សរុប',
    modeNight: 'របៀបយប់',
    modeLight: 'របៀបថ្ងៃ',
    langName: 'ភាសាខ្មែរ',
    langSwitch: 'English (EN)'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kv_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kv_language', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  const t = (key) => {
    return dictionary[lang]?.[key] || dictionary['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
