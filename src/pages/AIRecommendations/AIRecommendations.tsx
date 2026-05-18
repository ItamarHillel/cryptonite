import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store/store';
import type { CoinDeepMarketData } from '../../types/api';
import styles from './AIRecommendations.module.css';

interface AIResult {
  loading: boolean;
  data?: string;
  error?: string;
}

const AIRecommendations: React.FC = () => {
  const selectedCoins = useSelector((state: RootState) => state.coins.selectedCoins);
  const [results, setResults] = useState<Record<string, AIResult>>({});

  const handleGetRecommendation = async (coinId: string, coinSymbol: string) => {
    setResults(prev => ({ ...prev, [coinId]: { loading: true } }));

    try {
      // Step A: Fetch Deep Market Data
      const marketRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?market_data=true`);
      if (!marketRes.ok) throw new Error('שגיאה בטעינת נתוני השוק מ-CoinGecko.');
      const marketData: CoinDeepMarketData = await marketRes.json();

      // Step B: Extract Parameters
      const name = marketData.name;
      const price = marketData.market_data.current_price.usd;
      const marketCap = marketData.market_data.market_cap.usd;
      const volume = marketData.market_data.total_volume.usd;
      const change30 = marketData.market_data.price_change_percentage_30d_in_currency?.usd || 0;
      const change60 = marketData.market_data.price_change_percentage_60d_in_currency?.usd || 0;
      const change200 = marketData.market_data.price_change_percentage_200d_in_currency?.usd || 0;

      // Step C: Construct Prompt
      const prompt = `You are an expert cryptocurrency financial advisor. 
I want you to evaluate ${name} (${coinSymbol.toUpperCase()}).
Current Price: $${price}
Market Cap: $${marketCap}
24h Volume: $${volume}
30-Day Change: ${change30.toFixed(2)}%
60-Day Change: ${change60.toFixed(2)}%
200-Day Change: ${change200.toFixed(2)}%

Based on this precise market data, determine if this is a good investment.
You MUST provide exactly two things IN HEBREW:
1. A clear 'קנה' (Buy) or 'אל תקנה' (Don't Buy) verdict.
2. A short paragraph explaining your reasoning based on the provided data in Hebrew.`;

      // Step D: ChatGPT API Call
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('משתנה הסביבה VITE_OPENAI_API_KEY חסר.');
      }

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a cryptocurrency financial analyst.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!aiRes.ok) throw new Error('שגיאה בקבלת ההמלצה מ-OpenAI.');
      const aiData = await aiRes.json();
      
      const recommendationText = aiData.choices[0].message.content;

      setResults(prev => ({ 
        ...prev, 
        [coinId]: { loading: false, data: recommendationText } 
      }));

    } catch (err: unknown) {
      setResults(prev => ({ 
        ...prev, 
        [coinId]: { loading: false, error: (err as Error).message } 
      }));
    }
  };

  if (selectedCoins.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <h2>לא נבחרו מטבעות</h2>
          <p>נא לחזור לדף הבית ולבחור עד 5 מטבעות כדי לקבל המלצות AI.</p>
          <Link to="/" className={styles.homeLink}>חזור לדף הבית</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>המלצות AI</h1>
        <p className={styles.subtitle}>קבל תובנות פיננסיות מבוססות GPT המבוססות על נתוני שוק עמוקים.</p>
      </div>

      <div className={styles.grid}>
        {selectedCoins.map((coin) => {
          const result = results[coin.id];
          
          return (
            <div key={coin.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.coinName}>{coin.symbol.toUpperCase()}</h2>
                <button 
                  className={styles.actionBtn}
                  onClick={() => handleGetRecommendation(coin.id, coin.symbol)}
                  disabled={result?.loading}
                >
                  {result?.loading ? 'מנתח...' : 'קבל המלצת AI'}
                </button>
              </div>

              {result?.loading && (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>מתייעץ עם ChatGPT...</p>
                </div>
              )}

              {result?.error && (
                <div className={styles.errorState}>
                  {result.error}
                </div>
              )}

              {result?.data && !result.loading && (
                <div className={styles.resultState}>
                  {result.data.split('\n').map((paragraph, idx) => (
                    <p key={idx} className={
                      paragraph.includes('קנה') && !paragraph.includes('אל תקנה') 
                        ? styles.verdictBuy 
                        : paragraph.includes('אל תקנה') 
                          ? styles.verdictNoBuy 
                          : styles.paragraph
                    }>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;
