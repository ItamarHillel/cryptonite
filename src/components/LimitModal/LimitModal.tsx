import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { removeCoin, addCoin } from '../../store/slices/coinsSlice';
import styles from './LimitModal.module.css';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCoin: { id: string; symbol: string } | null;
}

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, pendingCoin }) => {
  const dispatch = useDispatch();
  const selectedCoins = useSelector((state: RootState) => state.coins.selectedCoins);

  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleRemoveAndAdd = (coinToRemove: string) => {
    dispatch(removeCoin(coinToRemove));
    if (pendingCoin) {
      dispatch(addCoin(pendingCoin));
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>הגעת למגבלת המטבעות</h2>
        <p className={styles.subtitle}>
          ניתן לעקוב אחרי עד 5 מטבעות בלבד. אנא הסר מטבע אחד מהרשימה מטה כדי להוסיף מטבע חדש.
        </p>
        
        <div className={styles.coinList}>
          {selectedCoins.map((coin) => (
            <div key={coin.id} className={styles.coinItem}>
              <span className={styles.coinName}>{coin.symbol.toUpperCase()}</span>
              <button className={styles.removeBtn} onClick={() => handleRemoveAndAdd(coin.id)}>
                הסר
              </button>
            </div>
          ))}
        </div>
        
        <button className={styles.closeBtn} onClick={onClose}>
          ביטול
        </button>
      </div>
    </div>
  );
};

export default LimitModal;
