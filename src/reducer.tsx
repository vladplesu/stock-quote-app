interface StockSymbol {
  type: string;
  symbol: string;
}

type State = {
  symbols: StockSymbol[];
  addSymbol?: (symbol: StockSymbol) => void;
  removeSymbol?: (figi: string) => void;
};

type Actions =
  | { type: 'ADD'; stockSymbol: StockSymbol }
  | { type: 'REMOVE'; symbols: StockSymbol[] };

const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case 'ADD':
      return { ...state, symbols: [...state.symbols, action.stockSymbol] };
    case 'REMOVE':
      return { ...state, symbols: action.symbols };
    default:
      return state;
  }
};

export type { State, StockSymbol };

export default reducer;
