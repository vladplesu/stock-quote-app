import React from 'react';
import reducer, { StockSymbol, State, ActionTypes, TimeData } from './reducer';

const { useReducer, useContext, createContext } = React;

type Props = {
  children: React.ReactNode;
};

export enum TimePeriods {
  OneDay = '1D',
  FiveDays = '5D',
  OneMonth = '1M',
  SixMonths = '6M',
  YTD = 'YTD',
  OneYear = '1Y',
  FiveYears = '5y',
}

const getToTimestamp = () => {
  let now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) {
    const d = day === 0 ? 2 : 1;
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
  }
  return Math.round(now.getTime() / 1000);
};

const oneDay = 24 * 3600;
const tts = getToTimestamp();
const timePeriod: TimeData = {
  from: tts - oneDay,
  to: tts,
  resolution: '5',
};

const initialState: State = {
  userSymbols: [],
  selectedSymbol: null,
  timePeriod,
  addSymbol: () => {},
  removeSymbol: () => {},
  selectSymbol: () => {},
  setTimePeriod: () => {},
};

const AppContext = createContext(initialState);

const AppProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addSymbol = (stockSymbol: StockSymbol) => {
    dispatch({ type: ActionTypes.Add, stockSymbol });
  };

  const removeSymbol = (symbol: string) => {
    const symbols = state.userSymbols.filter((s) => s.symbol !== symbol);
    dispatch({ type: ActionTypes.Remove, symbols });
  };

  const selectSymbol = (stockSymbol: string) => {
    dispatch({ type: ActionTypes.Select, stockSymbol });
  };

  const setTimePeriod = (tp: string) => {
    const toTimestamp = getToTimestamp();
    let fromTimestamp = toTimestamp - oneDay;
    let resolution = '5';
    switch (tp) {
      case TimePeriods.FiveDays:
        resolution = '30';
        fromTimestamp = toTimestamp - 5 * oneDay;
        break;
      case TimePeriods.OneDay:
        resolution = 'D';
        fromTimestamp = toTimestamp - 30 * oneDay;
        break;
      case TimePeriods.SixMonths:
        resolution = 'D';
        fromTimestamp = toTimestamp - 180 * oneDay;
        break;
      case TimePeriods.YTD:
        resolution = 'D';
        fromTimestamp = Math.round(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
        break;
      case TimePeriods.OneYear:
        resolution = 'D';
        fromTimestamp = toTimestamp - 365 * oneDay;
        break;
      case TimePeriods.FiveYears:
        resolution = 'W';
        fromTimestamp = toTimestamp - 5 * 365 * oneDay;
        break;
      default:
        break;
    }

    dispatch({
      type: ActionTypes.SetTimePeriod,
      timePeriod: { from: fromTimestamp, to: toTimestamp, resolution },
    });
  };

  return (
    <AppContext.Provider value={{ ...state, removeSymbol, addSymbol, selectSymbol, setTimePeriod }}>
      {children}
    </AppContext.Provider>
  );
};



export const useGlobalContext = () => useContext(AppContext);

export { AppProvider };
