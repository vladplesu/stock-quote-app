import React from 'react';
import { Box, Divider, IconButton, ListItem, ListItemText, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import { StockSymbol } from '../reducer';
import { useGlobalContext } from '../context';

type Props = {
  stockSymbol: StockSymbol;
  isFavorite: boolean;
  handleSelect?: () => void;
};

const StockSymbolItem: React.FC<Props> = ({ stockSymbol, isFavorite, handleSelect }) => {
  const { addSymbol, removeSymbol, selectSymbol } = useGlobalContext();
  const onSelectClick = () => {
    selectSymbol(stockSymbol);
    if (handleSelect){
      handleSelect();
    }
  }
  return (
    <>
      <ListItem>
        <ListItemText
          primary={stockSymbol.symbol}
          primaryTypographyProps={{ variant: "body1" }}
          secondary={
                <Box display="flex" justifyContent="space-between">
                  <Typography component="span" variant="caption">
                    {stockSymbol.description}
                  </Typography>
                  <Typography component="span" variant="caption">
                    {stockSymbol.type}
                  </Typography>
                </Box>
              }
          secondaryTypographyProps={{ component: "div" }}
        />
        {isFavorite ? (
          <>
            <IconButton color="secondary" size="small" onClick={() => removeSymbol(stockSymbol.symbol)}>
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" onClick={onSelectClick}>
              <ShowChartIcon />
            </IconButton>
          </>
        ) : (
          <IconButton size="small" onClick={() => addSymbol(stockSymbol)}>
            <AddIcon color="primary" />
          </IconButton>
        )}
      </ListItem>
      <Divider light/>
    </>
  );
};

export default StockSymbolItem;
