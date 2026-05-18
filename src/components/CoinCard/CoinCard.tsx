import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { addCoin, removeCoin } from '../../store/slices/coinsSlice';
import type { CoinMarketData, CoinDetailData } from '../../types/api';
import styles from './CoinCard.module.css';

interface CoinCardProps {
  coin: CoinMarketData;
  onLimitReached: (coinId: string) => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onLimitReached }) => {
  const dispatch = useDispatch();
  const selectedCoins = useSelector((state: RootState) => state.coins.selectedCoins);
  const isSelected = selectedCoins.some(c => c.id === coin.id);

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local cache in sessionStorage to prevent duplicate network requests (2 min limit)
  const [moreInfo, setMoreInfo] = useState<CoinDetailData | null>(null);

  const handleToggle = () => {
    if (isSelected) {
      dispatch(removeCoin(coin.id));
    } else {
      if (selectedCoins.length >= 5) {
        onLimitReached(coin.id);
      } else {
        dispatch(addCoin({ id: coin.id, symbol: coin.symbol }));
      }
    }
  };

  const handleMoreInfo = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    const cacheKey = `cryptonite_coin_${coin.id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < 2 * 60 * 1000) { // 2 minutes
        setMoreInfo(data);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
      if (!res.ok) throw new Error('שגיאת רשת או חריגה ממגבלת בקשות');
      const data: CoinDetailData = await res.json();
      
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      setMoreInfo(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img src={coin.image} alt={coin.name} className={styles.image} />
        <div className={styles.titleInfo}>
          <h3 className={styles.symbol}>{coin.symbol.toUpperCase()}</h3>
          <p className={styles.name}>{coin.name}</p>
        </div>
        <label className={styles.switch}>
          <input type="checkbox" checked={isSelected} onChange={handleToggle} />
          <span className={styles.slider}></span>
        </label>
      </div>
      
      <button className={styles.moreInfoBtn} onClick={handleMoreInfo}>
        {expanded ? 'פחות מידע' : 'מידע נוסף'}
      </button>

      <div className={`${styles.collapseContainer} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.collapseContent}>
          {loading && <p className={styles.loadingText}>טוען...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
          {moreInfo && !loading && !error && (
            <div className={styles.prices}>
              <div className={styles.priceItem}>
                <span className={styles.currency}>USD ($)</span>
                <span className={styles.value}>${moreInfo.market_data.current_price.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </div>
              <div className={styles.priceItem}>
                <span className={styles.currency}>EUR (€)</span>
                <span className={styles.value}>€{moreInfo.market_data.current_price.eur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </div>
              <div className={styles.priceItem}>
                <span className={styles.currency}>ILS (₪)</span>
                <span className={styles.value}>₪{moreInfo.market_data.current_price.ils.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinCard;
