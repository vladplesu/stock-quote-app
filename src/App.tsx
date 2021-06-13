import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { Button, ButtonGroup, Grid, InputBase, List } from '@material-ui/core';
import StockSymbolItem from './components/StockSymbolItem'
import PriceChart from './components/PriceChart';
import { StockSymbol } from './reducer';
import { useGlobalContext, TimePeriods } from './context';
import './styles/theme.scss';

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const SEARCH_URL = `${URL}/search?token=${KEY}`;

function App() {
  const { userSymbols, selectedSymbol, setTimePeriod } = useGlobalContext();

  const [symbols, setSymbols] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    if (searchQuery === ''){
      setSymbols([])
    } else {
      fetch(`${SEARCH_URL}&q=${event.target.value}`)
        .then((res) => {
          if (!res.ok){
            throw new Error("Could not fetch search results.");
          }
          return res.json()})
        .then((data) => {
          setSymbols(data.result);
          setError(null);
        })
        .catch((err) => setError(err.message));
    }
  };

  const debouncedHandleChange = useMemo(() => debounce(handleChange, 300), [])

  useEffect(() => () => {
      debouncedHandleChange.cancel()
    }, [debouncedHandleChange])

  return (
    <div className="App">
      <InputBase placeholder="Search..." onChange={debouncedHandleChange} />
      <p>{error}</p>
      <Grid container>
        <Grid item>
          <List dense>
            {symbols.map((s: StockSymbol) => (
              <div key={s.symbol}>
                <StockSymbolItem
                  stockSymbol={s}
                  isFavorite={userSymbols.map((sym) => sym.symbol).includes(s.symbol)}
                />
              </div>
            ))}
          </List>
        </Grid>
        <Grid item>
          <List dense>
            {userSymbols.map((s) => (
              <div key={s.symbol}>
                <StockSymbolItem stockSymbol={s} isFavorite />
              </div>
            ))}
          </List>
        </Grid>
        <Grid item>
          {selectedSymbol && <PriceChart width={600} height={400}  symbol={selectedSymbol}/>}
        </Grid>
        <Grid item>
          <ButtonGroup variant="text" color="secondary">
            {Object.values(TimePeriods).map(t => (
              <Button key={t} onClick={() => setTimePeriod(t)}>
                {t}
              </Button>
            ))}
          </ButtonGroup>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
