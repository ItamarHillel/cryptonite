import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import type { CoinMarketData } from '../../types/api';
import CoinCard from '../../components/CoinCard/CoinCard';
import LimitModal from '../../components/LimitModal/LimitModal';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCoin, setPendingCoin] = useState<{ id: string; symbol: string } | null>(null);

  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100&page=1');
        if (!res.ok) throw new Error('שגיאה בטעינת המטבעות. ייתכן וחריגה ממגבלת בקשות.');
        const data: CoinMarketData[] = await res.json();
        setCoins(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  const handleLimitReached = (coinId: string) => {
    const coin = coins.find(c => c.id === coinId);
    if (coin) {
      setPendingCoin({ id: coin.id, symbol: coin.symbol });
      setIsModalOpen(true);
    }
  };

  const filteredCoins = coins.filter((coin) => {
    const query = searchQuery.toLowerCase();
    return coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query);
  });

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>קריפטונייט</h1>
          <p className={styles.subtitle}>מעקב מטבעות קריפטוגרפיים בזמן אמת ותובנות שוק</p>
        </div>
      </div>

      <div className={styles.content}>
        {loading && <div className={styles.message}>טוען 100 מטבעות מובילים...</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        {!loading && !error && (
          <div className={styles.grid}>
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} onLimitReached={handleLimitReached} />
            ))}
          </div>
        )}
        
        {!loading && !error && filteredCoins.length === 0 && (
          <div className={styles.message}>לא נמצאו מטבעות התואמים לחיפוש שלך.</div>
        )}
      </div>

      <LimitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pendingCoin={pendingCoin} 
      />
    </div>
  );
};

export default Home;
