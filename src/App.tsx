import React, { useState } from 'react';
import { Button, ButtonGroup, Grid } from '@material-ui/core';
import PriceChart from './components/PriceChart';
import CustomTimePeriod from './components/CustomTimePeriod';
import Header from './components/Header';
import SearchFragment from './containers/SearchFragment';
import { useGlobalContext, TimePeriods } from './context';
import './styles/theme.scss';

function App() {
  const { selectedSymbol, setTimePeriod } = useGlobalContext();

  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="App">
      <Grid container>
        <Header handleClick={() => setShowSearch(!showSearch)} symbol={selectedSymbol} />
        {showSearch && <SearchFragment handleClick={() => setShowSearch(!showSearch)} />}
        <Grid item>
          {selectedSymbol && <PriceChart width={600} height={400} symbol={selectedSymbol} />}
        </Grid>
        <Grid item>
          <ButtonGroup variant="text" color="secondary">
            {Object.values(TimePeriods).map((t) => (
              <Button key={t} onClick={() => setTimePeriod(t)}>
                {t}
              </Button>
            ))}
          </ButtonGroup>
        </Grid>
        <Grid item>
          <CustomTimePeriod />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
