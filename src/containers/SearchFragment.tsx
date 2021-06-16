import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { Box, IconButton, InputBase, Typography, List } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import StockSymbolItem from '../components/StockSymbolItem';
import { StockSymbol } from '../reducer';
import { useGlobalContext } from '../context';

type Props = {
  handleClick?: () => void;
};

const useStyles = makeStyles((theme) => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.primary.light}`,
    margin: theme.spacing(2),
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.light,
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: '100%',
  },
}));

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const SEARCH_URL = `${URL}/search?token=${KEY}`;

const SearchFragment: React.FC<Props> = ({ handleClick }) => {
  const { userSymbols } = useGlobalContext();
  const [symbols, setSymbols] = useState<StockSymbol[]>([]);
  const [error, setError] = useState(null);

  const classes = useStyles();

  const debouncedHandleChange = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        const searchQuery = event.target.value;
        if (searchQuery === '') {
          setSymbols([]);
        } else {
          fetch(`${SEARCH_URL}&q=${event.target.value}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error('Could not fetch search results.');
              }
              return res.json();
            })
            .then((data) => {
              setSymbols(data.result);
              setError(null);
            })
            .catch((err) => setError(err.message));
        }
      }, 300),
    []
  );

  useEffect(
    () => () => {
      debouncedHandleChange.cancel();
    },
    [debouncedHandleChange]
  );

  return (
    <Box zIndex={999} position="absolute" left={0} right={0} top={0} bottom={0} bgcolor="white">
      <Box
        display="flex"
        paddingLeft={2}
        alignItems="center"
        justifyContent="space-between"
        boxShadow={1}
      >
        <Typography component="h2" variant="h6">
          Search Symbols
        </Typography>
        <IconButton onClick={handleClick} color="secondary">
          <CloseIcon />
        </IconButton>
      </Box>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          classes={{ root: classes.inputRoot, input: classes.inputInput }}
          placeholder="Search..."
          onChange={debouncedHandleChange}
        />
      </div>
      <List dense>
        {symbols.length > 0
          ? symbols.map((s: StockSymbol) => (
              <div key={s.symbol}>
                <StockSymbolItem
                  stockSymbol={s}
                  isFavorite={userSymbols.map((sym) => sym.symbol).includes(s.symbol)}
                  handleSelect={handleClick}
                />
              </div>
            ))
          : userSymbols.map((s: StockSymbol) => (
              <div key={s.symbol}>
                <StockSymbolItem stockSymbol={s} isFavorite={true} handleSelect={handleClick} />
              </div>
            ))}
      </List>
      {error && <Typography>{error}</Typography>}
    </Box>
  );
};

export default SearchFragment;
