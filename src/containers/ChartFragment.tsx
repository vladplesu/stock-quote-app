import React from 'react';
import { Box, Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import PriceChart from '../components/PriceChart';
import { useGlobalContext, TimePeriods } from '../context';

type Props = {
  handleBtnClick: () => void;
};

const ChartFragment: React.FC<Props> = ({ handleBtnClick }) => {
  const { selectedSymbol, setTimePeriod } = useGlobalContext();

  if (!selectedSymbol) {
    return (
      <Grid item xs={12}>
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
      </Grid>
    );
  }

  return (
    <Grid item>
      <PriceChart width={600} height={400} />;
      <ButtonGroup variant="text" color="secondary">
        {Object.values(TimePeriods).map((t) => (
          <Button key={t} onClick={() => setTimePeriod(t)}>
            {t}
          </Button>
        ))}
      </ButtonGroup>
    </Grid>
  );
};

export default ChartFragment;
