import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RootState } from '../../store/store';
import styles from './Reports.module.css';

interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];

const Reports: React.FC = () => {
  const selectedCoins = useSelector((state: RootState) => state.coins.selectedCoins);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (selectedCoins.length === 0) return;

    const symbols = selectedCoins.map(c => c.symbol.toUpperCase()).join(',');
    
    const fetchPrices = async () => {
      try {
        const res = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`);
        if (!res.ok) throw new Error('שגיאה בטעינת המחירים החיים');
        const rawData = await res.json();
        
        if (rawData.Response === 'Error') {
           throw new Error(rawData.Message);
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour12: false });
        
        const dataPoint: ChartDataPoint = { time: timeString };
        
        // Map the payload to our ChartDataPoint
        selectedCoins.forEach((coin) => {
          const sym = coin.symbol.toUpperCase();
          if (rawData[sym] && rawData[sym].USD) {
            dataPoint[sym] = rawData[sym].USD;
          }
        });

        setData(prevData => {
          const newData = [...prevData, dataPoint];
          // Keep only the last 60 points (1 minute of history) for performance
          if (newData.length > 60) return newData.slice(newData.length - 60);
          return newData;
        });
        setError(null);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately, then initiate 1s polling
    fetchPrices();
    const intervalId = setInterval(fetchPrices, 1000);

    return () => clearInterval(intervalId); // Cleanup
  }, [selectedCoins]);

  if (selectedCoins.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <h2>לא נבחרו מטבעות</h2>
          <p>נא לחזור לדף הבית ולבחור עד 5 מטבעות כדי לראות את הביצועים שלהם בזמן אמת.</p>
          <Link to="/" className={styles.homeLink}>חזור לדף הבית</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>דוחות בזמן אמת</h1>
      <p className={styles.subtitle}>מחירים חיים בדולרים למטבעות הנבחרים שלך (מתעדכן כל שנייה)</p>
      
      {isLoading && data.length === 0 && <div className={styles.loadingMessage}>טוען נתונים חיים...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis 
              stroke="#94a3b8" 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value}`, undefined]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {selectedCoins.map((coin, index) => (
              <Line
                key={coin.id}
                type="monotone"
                dataKey={coin.symbol.toUpperCase()}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={false} /* Disabled to prevent jarring transitions every second */
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;
