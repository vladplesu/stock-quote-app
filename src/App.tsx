import React, { useState } from 'react';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ChartFragment from './containers/ChartFragment';
import Header from './components/Header';
import SearchFragment from './containers/SearchFragment';
import SideBarFragment from './containers/SideBarFragment';
import './styles/theme.scss';

function App() {
  const [showSearch, setShowSearch] = useState(false);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div className="App">
      <Box height="100%" display="flex" flexDirection="column">
        <Header handleClick={() => setShowSearch(!showSearch)} />
        {showSearch && <SearchFragment handleClick={() => setShowSearch(!showSearch)} />}
        <Grid className="chart-container" container>
          <Grid item xs={12} sm={8} md={9} lg={10}>
            <ChartFragment handleBtnClick={() => setShowSearch(!showSearch)} />
          </Grid>
          {matches && (
            <Grid item sm={4} md={3} lg={2}>
              <SideBarFragment handleAddBtn={() => setShowSearch(!showSearch)} />
            </Grid>
          )}
        </Grid>
      </Box>
    </div>
  );
}

export default App;
