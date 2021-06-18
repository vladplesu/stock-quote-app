import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import ChartFragment from './containers/ChartFragment';
import Header from './components/Header';
import SearchFragment from './containers/SearchFragment';
import './styles/theme.scss';

function App() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="App">
      <Box height="100%">
        <Header handleClick={() => setShowSearch(!showSearch)} />
        {showSearch && <SearchFragment handleClick={() => setShowSearch(!showSearch)} />}
        <ChartFragment handleBtnClick={() => setShowSearch(!showSearch)} />
      </Box>
    </div>
  );
}

export default App;
