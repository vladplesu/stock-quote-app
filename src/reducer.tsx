interface StockSymbol {
  type: string;
  symbol: string;
  displaySymbol: string;
  description: string;
  currency?: string;
  exchange?: string;
  companyProfile?: {
    country: string;
    marketCapitalization: number;
    name: string;
    shareOutstanding: number;
    weburl: string;
    logo: string;
    finnhubIndustry: string;
  };
}

interface TimeData {
  from: number;
  to: number;
  resolution: string;
}

type State = {
  userSymbols: StockSymbol[];
  selectedSymbol: StockSymbol | null | undefined;
  timePeriod: TimeData;
  addSymbol: (stockSymbol: StockSymbol) => void;
  removeSymbol: (symbol: string) => void;
  selectSymbol: (stockSymbol: StockSymbol) => void;
  setTimePeriod: (tp: string) => void;
  setCustomTimePeriod: (from: Date, to: Date) => void;
};

export enum ActionTypes {
  Add = 'ADD',
  Remove = 'REMOVE',
  Select = 'SELECT',
  SetTimePeriod = 'SET_TIME_PERIOD',
}

type Actions =
  | { type: ActionTypes.Add; stockSymbol: StockSymbol }
  | { type: ActionTypes.Remove; symbols: StockSymbol[] }
  | { type: ActionTypes.Select; stockSymbol: StockSymbol | undefined }
  | { type: ActionTypes.SetTimePeriod; timePeriod: TimeData };

const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case ActionTypes.Add:
      return { ...state, userSymbols: [...state.userSymbols, action.stockSymbol] };
    case ActionTypes.Remove:
      if (action.symbols.length === 0) {
        return { ...state, selectedSymbol: null, userSymbols: action.symbols };
      }
      return { ...state, userSymbols: action.symbols };
    case ActionTypes.Select:
      return { ...state, selectedSymbol: action.stockSymbol };
    case ActionTypes.SetTimePeriod:
      return { ...state, timePeriod: action.timePeriod };
    default:
      return state;
  }
};

export type { State, StockSymbol, TimeData };

export default reducer;
