import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { useGlobalContext } from '../context';

type Props = {
  handleClick?: () => void;
};

const Header: React.FC<Props> = ({ handleClick }) => {
  const { selectedSymbol } = useGlobalContext();

  return (
    <Grid item onClick={handleClick}>
      <Box paddingY={1} boxShadow={1}>
        {selectedSymbol ? (
          <>
            <Typography component="h1" variant="h5" color="primary">
              {selectedSymbol.symbol}
            </Typography>
            <Typography component="h2" variant="subtitle2">
              {selectedSymbol.exchange}
            </Typography>
          </>
        ) : (
          <Typography component="h2" variant="h5" color="primary">
            No Symbol
          </Typography>
        )}
      </Box>
    </Grid>
  );
;;
};

export default Header;
