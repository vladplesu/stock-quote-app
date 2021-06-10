interface StockSymbol {
  type: string;
  symbol: string;
}

type State = {
  userSymbols: StockSymbol[];
  addSymbol: (stockSymbol: StockSymbol) => void;
  removeSymbol: (symbol: string) => void;
};

type Actions =
  | { type: 'ADD'; stockSymbol: StockSymbol }
  | { type: 'REMOVE'; symbols: StockSymbol[] };

const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case 'ADD':
      return { ...state, userSymbols: [...state.userSymbols, action.stockSymbol] };
    case 'REMOVE':
      return { ...state, userSymbols: action.symbols };
    default:
      return state;
  }
};

export type { State, StockSymbol };

export default reducer;
