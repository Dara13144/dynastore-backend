import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { paymentAPI } from '../api/endpoints';

const TopupSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchWallet } = useWallet();

  const tranId = searchParams.get('tran_id') || searchParams.get('tranId') || searchParams.get('reference');

  useEffect(() => {
    const handleSyncAndRedirect = async () => {
      if (tranId) {
        try {
          await paymentAPI.checkABAStatus(tranId, true);
        } catch (e) {
          console.warn('Status check notice:', e.message);
        }
      }
      await fetchWallet();
      navigate('/dashboard', { replace: true });
    };

    handleSyncAndRedirect();
  }, [tranId, fetchWallet, navigate]);

  return null;
};

export default TopupSuccess;
