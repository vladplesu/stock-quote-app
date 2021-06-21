import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab/';
import { useTheme } from '@material-ui/core/styles';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { debounce } from 'lodash';
import PriceChart, { Stock } from '../components/PriceChart';
import CompanyProfile from '../components/CompanyProfile';
import { useGlobalContext } from '../context';

type Props = {
  handleBtnClick: () => void;
};

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const QUOTE_URL = `${URL}/stock/candle?token=${KEY}`;

const ChartFragment: React.FC<Props> = ({ handleBtnClick }) => {
  const { selectedSymbol, timePeriod } = useGlobalContext();
  const [priceData, setPriceData] = useState<Stock[]>([]);
  const [chartHeight, setChartHeight] = useState(300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));

  useEffect(() => {
    if (selectedSymbol) {
      const { resolution, from, to } = timePeriod;
      setLoading(true);
      fetch(
        `${QUOTE_URL}&symbol=${selectedSymbol.symbol}&resolution=${resolution}&from=${from}&to=${to}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Could not fetch price data');
          }
          return res.json();
        })
        .then((data) => {
          if (data.s !== 'ok') {
            throw new Error('Could not fetch price data');
          }

          const { c: closePrices, t: timeStamps } = data;
          const stockData: Stock[] = [];
          if (closePrices && timeStamps) {
            for (let i = 0; i < closePrices.length; i++) {
              const date = new Date(timeStamps[i] * 1000);
              stockData.push({ date, close: closePrices[i] });
            }
          }
          setPriceData(stockData);
          setLoading(false);
          setError('');
        })

        .catch((err) => {
          setLoading(false);
          setError(err.message);
          setOpenError(true);
        });
    }
  }, [selectedSymbol, timePeriod]);

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

  if (loading) {
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <CircularProgress color="secondary" />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error !== '') {
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h6">Select another symbol!</Typography>
        <Button variant="contained" color="primary" onClick={handleBtnClick}>
          Select
        </Button>
        <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
          <Alert elevation={6} variant="filled" severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box padding={2} paddingBottom={0} textAlign="left">
      <ParentSize className="parent">
        {({ width }) => <PriceChart width={width} height={chartHeight} priceData={priceData} />}
      </ParentSize>
      {matches && (
        <>
          <Divider />
          <CompanyProfile />
        </>
      )}
    </Box>
  );
};

export default ChartFragment;
