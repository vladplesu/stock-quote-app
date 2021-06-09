import React, { useState } from 'react';
import { InputBase, List, ListItem, ListItemText } from '@material-ui/core';
import { StockSymbol } from './reducer';
import './styles/theme.scss';

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const SEARCH_URL = `${URL}/search?token=${KEY}`;

function App() {
  const [symbols, setSymbols] = useState([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fetch(`${SEARCH_URL}&q=${event.target.value}`)
      .then((res) => res.json())
      .then((data) => {
        setSymbols(data.result);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="App">
      <InputBase placeholder="Search..." onChange={handleChange} />
      <List dense>
        {symbols.map((s: StockSymbol) => (
          <ListItem key={s.symbol}>
            <ListItemText primary={s.symbol} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default App;
