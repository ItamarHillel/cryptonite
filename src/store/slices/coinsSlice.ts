import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SelectedCoin {
  id: string;
  symbol: string;
}

export interface CoinsState {
  selectedCoins: SelectedCoin[];
}

// Function to initialize selected coins from localStorage
const getInitialSelectedCoins = (): SelectedCoin[] => {
  try {
    const saved = localStorage.getItem('cryptonite_selected_coins');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old string arrays if present
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map((id: string) => ({ id, symbol: id.toUpperCase() }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse selected coins from local storage', error);
  }
  return [];
};

const initialState: CoinsState = {
  selectedCoins: getInitialSelectedCoins(),
};

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    addCoin: (state, action: PayloadAction<SelectedCoin>) => {
      if (state.selectedCoins.length < 5 && !state.selectedCoins.some(c => c.id === action.payload.id)) {
        state.selectedCoins.push(action.payload);
        localStorage.setItem('cryptonite_selected_coins', JSON.stringify(state.selectedCoins));
      }
    },
    removeCoin: (state, action: PayloadAction<string>) => {
      state.selectedCoins = state.selectedCoins.filter((c) => c.id !== action.payload);
      localStorage.setItem('cryptonite_selected_coins', JSON.stringify(state.selectedCoins));
    },
  },
});

export const { addCoin, removeCoin } = coinsSlice.actions;
export default coinsSlice.reducer;
