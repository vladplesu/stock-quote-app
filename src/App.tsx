import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import ChartFragment from './containers/ChartFragment';
import Header from './components/Header';
import SearchFragment from './containers/SearchFragment';
import './styles/theme.scss';

function App() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="App">
      <Grid className="container" container wrap="nowrap" direction="column">
        <Header handleClick={() => setShowSearch(!showSearch)} />
        {showSearch && <SearchFragment handleClick={() => setShowSearch(!showSearch)} />}
        <ChartFragment handleBtnClick={() => setShowSearch(!showSearch)} />
      </Grid>
    </div>
  );
}

export default App;
