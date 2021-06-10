import React from 'react';
import { Button, ListItem, ListItemText } from '@material-ui/core';
import { StockSymbol } from '../reducer';
import { useGlobalContext } from '../context';

type Props = {
  stockSymbol: StockSymbol;
  isFavorite: boolean;
};

const StockSymbolItem: React.FC<Props> = ({ stockSymbol, isFavorite }) => {
  const { addSymbol, removeSymbol } = useGlobalContext();
  return (
    <>
      <ListItem>
        <ListItemText primary={stockSymbol.symbol} />
      </ListItem>
      {isFavorite ? (
        <ListItem>
          <Button onClick={() => removeSymbol(stockSymbol.symbol)}>REMOVE</Button>
        </ListItem>
      ) : (
        <ListItem>
          <Button onClick={() => addSymbol(stockSymbol)}>ADD</Button>
        </ListItem>
      )}
    </>
  );
};

export default StockSymbolItem;
