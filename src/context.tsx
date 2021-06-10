import React from 'react';
import reducer, { StockSymbol } from './reducer';
import type { State } from './reducer';

const { useReducer, useContext, createContext } = React;

type Props = {
  children: React.ReactNode;
};

const initialState: State = {
  userSymbols: [],
  addSymbol: () => {},
  removeSymbol: () => {},
};

const AppContext = createContext(initialState);

const AppProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addSymbol = (stockSymbol: StockSymbol) => {
    dispatch({ type: 'ADD', stockSymbol });
  };

  const removeSymbol = (symbol: string) => {
    const symbols = state.userSymbols.filter((s) => s.symbol !== symbol);
    dispatch({ type: 'REMOVE', symbols });
  };

  return (
    <AppContext.Provider value={{ ...state, removeSymbol, addSymbol }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);

export { AppProvider };
