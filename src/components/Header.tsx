import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { StockSymbol } from '../reducer';

type Props = {
  symbol?: StockSymbol | null;
  handleClick?: () => void;
};

const Header: React.FC<Props> = ({ symbol, handleClick }) => (
  <Grid item xs={12} onClick={handleClick}>
    <Box paddingY={1} boxShadow={1}>
      {symbol ? (
        <>
          <Typography component="h1" variant="h5" color="primary">
            {symbol.symbol}
          </Typography>
          <Typography component="h2" variant="subtitle2">
            {symbol.exchange}
          </Typography>
        </>
      ) : (
        <Typography component="h2" variant="h5" color="primary">
          Search Symbols
        </Typography>
      )}
    </Box>
  </Grid>
);

export default Header;
