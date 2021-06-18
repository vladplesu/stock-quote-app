import React from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import PriceChart from '../components/PriceChart';
import { useGlobalContext } from '../context';

type Props = {
  handleBtnClick: () => void;
};

const ChartFragment: React.FC<Props> = ({ handleBtnClick }) => {
  const { selectedSymbol } = useGlobalContext();

  if (!selectedSymbol) {
    return (
      <Box
        display="flex"
        height="100%"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Typography component="p" variant="h6">
          Select a stock symbol
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBtnClick}>
          Search
        </Button>
      </Box>
    );
  }

  return (
    <Box padding={2} textAlign="left">
      <ParentSize>{({ width }) => <PriceChart width={width} height={350} />}</ParentSize>
    </Box>
  );
};

export default ChartFragment;
