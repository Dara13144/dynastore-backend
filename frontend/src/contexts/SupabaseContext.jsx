import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase, { isSupabaseConfigured } from '../utils/supabase';
import { supabaseAPI } from '../api/endpoints';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(isSupabaseConfigured());
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await supabaseAPI.getStatus();
      if (res.data && res.data.success) {
        setSupabaseStatus(res.data.data);
      }
    } catch (err) {
      console.warn('[SupabaseContext] Error fetching status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isConfigured: isReady || Boolean(supabaseStatus?.configured),
        supabaseStatus,
        fetchStatus,
        loading
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
