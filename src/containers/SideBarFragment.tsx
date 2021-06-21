import React, { useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { useGlobalContext } from '../context';
import CompanyProfile from '../components/CompanyProfile';

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const QUOTE_URL = `${URL}/quote?token=${KEY}`;

type Props = {
  handleAddBtn: () => void;
};

const useStyles = makeStyles((theme) => ({
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      background: theme.palette.grey[100],
    },
    '& td:last-child': {
      paddingRight: 0,
    },
  },
  removeBtn: {
    minWidth: '36px',
    padding: 0,
    '& svg': {
      width: '20px',
    },
  },
}));

const SideBarFragment: React.FC<Props> = ({ handleAddBtn }) => {
  const { userSymbols, removeSymbol, selectSymbol } = useGlobalContext();

  const classes = useStyles();

  useEffect(() => {
    fetch(`${QUOTE_URL}&symbol=`);
  });

  return (
    <>
      <Box
        borderLeft={3}
        borderColor="rgba(0, 0, 0, 0.2)"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" padding={1}>
          <Typography>Favorites</Typography>
          <IconButton size="small" color="secondary" onClick={handleAddBtn}>
            <AddIcon />
          </IconButton>
        </Box>
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <TableContainer style={{ height: '50%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Industry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userSymbols.map((symbol) => (
                  <TableRow
                    key={symbol.symbol}
                    className={classes.tableRow}
                    onClick={() => selectSymbol(symbol)}
                  >
                    <TableCell>{symbol.symbol}</TableCell>
                    <TableCell align="right">
                      {symbol.companyProfile?.finnhubIndustry}
                      <Button
                        className={classes.removeBtn}
                        color="secondary"
                        onClick={() => removeSymbol(symbol.symbol)}
                      >
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box borderTop={3} borderColor="rgba(0, 0, 0, 0.2)" paddingLeft={2} paddingRight={2}>
            <CompanyProfile />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SideBarFragment;
