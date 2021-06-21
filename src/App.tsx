import React, { useState } from 'react';
import { Box, Grid, Modal, Snackbar, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import ChartFragment from './containers/ChartFragment';
import Header from './components/Header';
import SearchFragment from './containers/SearchFragment';
import SideBarFragment from './containers/SideBarFragment';
import './styles/theme.scss';
import { useGlobalContext } from './context';

function App() {
  const { errorMessage, logErrors } = useGlobalContext();

  const [showSearch, setShowSearch] = useState(false);
  const [openError, setOpenError] = useState(errorMessage !== '');

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const handleClose = () => {
    setOpenError(false);
    logErrors('');
  };

  return (
    <div className="App">
      <Box height="100%" display="flex" flexDirection="column">
        <Header handleClick={() => setShowSearch(!showSearch)} />
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
      <Snackbar open={openError} autoHideDuration={3000} onClose={handleClose}>
        <Alert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      <Modal className="search-modal" open={showSearch} onClose={() => setShowSearch(!showSearch)}>
        <div>
          <SearchFragment handleClick={() => setShowSearch(!showSearch)} />
        </div>
      </Modal>
    </div>
  );
}

export default App;
