import React, { useCallback } from 'react';

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
  FiveYears = '5Y',
}

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const PROFILE_URL = `${URL}/stock/profile2?token=${KEY}`;

const getToTimestamp = () => {
  let now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) {
    const d = day === 0 ? 2 : 1;
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, 23, 59);
  }
  return Math.round(now.getTime() / 1000);
};

const oneDay = 24 * 3600;
const tts = getToTimestamp();
const timePeriod: TimeData = {
  from: tts - oneDay,
  to: tts,
  resolution: '5',
  timePeriod: TimePeriods.OneDay,
};

const initialState: State = {
  userSymbols: [],
  selectedSymbol: null,
  timePeriod,
  errorMessage: '',
  addSymbol: () => {},
  removeSymbol: () => {},
  selectSymbol: () => {},
  setTimePeriod: () => {},
  setCustomTimePeriod: () => {},
  logErrors: () => {},
};

const AppContext = createContext(initialState);

const AppProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addSymbol = (stockSymbol: StockSymbol) => {
    if (!stockSymbol.exchange) {
      fetch(`${PROFILE_URL}&symbol=${stockSymbol.symbol}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Could not fetch data!');
          }
          return res.json();
        })
        .then((data) => {
          const companyProfile = {
            country: data.country,
            ipo: data.ipo,
            marketCapitalization: data.marketCapitalization,
            name: data.name,
            shareOutstanding: data.shareOutstanding,
            weburl: data.weburl,
            logo: data.logo,
            finnhubIndustry: data.finnhubIndustry,
          };
          dispatch({
            type: ActionTypes.Add,
            stockSymbol: {
              ...stockSymbol,
              exchange: data.exchange,
              currency: data.currency,
              companyProfile,
            },
          });
        })
        .catch((err) => {
          logErrors(err.message);
        });
    } else {
      dispatch({ type: ActionTypes.Add, stockSymbol });
    }
  };

  const removeSymbol = (symbol: string) => {
    const symbols = state.userSymbols.filter((s) => s.symbol !== symbol);
    if (symbol === state.selectedSymbol?.symbol) {
      dispatch({ type: ActionTypes.Select, stockSymbol: undefined });
    }
    dispatch({ type: ActionTypes.Remove, symbols });
  };

  const selectSymbol = (stockSymbol: StockSymbol) => {
    const symbol = state.userSymbols.find((s) => s.symbol === stockSymbol.symbol);
    dispatch({ type: ActionTypes.Select, stockSymbol: symbol });
  };

  const setCustomTimePeriod = (from: Date, to: Date) => {
    const fromTimestamp = Math.round(from.getTime() / 1000);
    const toTimestamp = Math.round(to.getTime() / 1000);
    let resolution = '5';
    const timeFrame = (toTimestamp - fromTimestamp) / (24 * 3600) + 1;
    if (timeFrame > 7) {
      resolution = '30';
    }
    if (timeFrame > 30) {
      resolution = 'D';
    }
    const tp: TimeData = {
      from: fromTimestamp,
      to: toTimestamp,
      resolution,
      timePeriod: 'custom',
    };
    dispatch({ type: ActionTypes.SetTimePeriod, timePeriod: tp });
  };

  const setTimePeriod = (tp: string) => {
    const toTimestamp = getToTimestamp();
    let fromTimestamp = toTimestamp - oneDay;
    let resolution = '5';
    switch (tp) {
      case TimePeriods.FiveDays:
        resolution = '15';
        fromTimestamp = toTimestamp - 5 * oneDay;
        break;
      case TimePeriods.OneMonth:
        resolution = '30';
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
      timePeriod: { from: fromTimestamp, to: toTimestamp, resolution, timePeriod: tp },
    });
  };

  const logErrors = useCallback((error: string) => {
    dispatch({ type: ActionTypes.LogErrors, errorMessage: error });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        removeSymbol,
        addSymbol,
        selectSymbol,
        setTimePeriod,
        setCustomTimePeriod,
        logErrors,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);

export { AppProvider };
