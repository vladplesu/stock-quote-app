import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Typography } from '@material-ui/core';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { debounce } from 'lodash';
import PriceChart from '../components/PriceChart';
import CompanyProfile from '../components/CompanyProfile';
import { useGlobalContext } from '../context';

type Props = {
  handleBtnClick: () => void;
};

const ChartFragment: React.FC<Props> = ({ handleBtnClick }) => {
  const { selectedSymbol } = useGlobalContext();
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setChartHeight(window.innerHeight * 0.8);
    }, 300);

    window.addEventListener('resize', debouncedHandleResize);

    debouncedHandleResize();

    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, []);

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
    <Box padding={2} paddingBottom={0} textAlign="left">
      <ParentSize className="parent">
        {({ width }) => <PriceChart width={width} height={chartHeight} />}
      </ParentSize>
      <Divider />
      <CompanyProfile />
    </Box>
  );
};

export default ChartFragment;
