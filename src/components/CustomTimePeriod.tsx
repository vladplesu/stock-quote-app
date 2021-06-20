import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton, Modal, TextField } from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { useGlobalContext } from '../context';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '15px',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '400px',
    margin: `0 ${theme.spacing(2)}px`,
  },
  active: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
  },
}));

type Props = {
  active: boolean;
};

const CustomTimePeriod: React.FC<Props> = ({ active }) => {
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const classes = useStyles();

  const { setCustomTimePeriod } = useGlobalContext();

  const handleClick = () => {
    const fd = new Date(fromDate);
    const td = new Date(toDate);
    setCustomTimePeriod(fd, td);
    setOpen(!open);
  };

  const body = (
    <div className={classes.paper}>
      <TextField
        id="from-date"
        type="date"
        label="from"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(event) => setFromDate(event.target.value)}
      />
      <TextField
        id="to-date"
        type="date"
        label="to"
        InputLabelProps={{ shrink: true }}
        value={toDate}
        onChange={(event) => setToDate(event.target.value)}
      />
      <Button
        style={{ marginTop: '16px' }}
        variant="contained"
        color="primary"
        disabled={fromDate === '' || toDate === ''}
        onClick={handleClick}
      >
        Go To
      </Button>
    </div>
  );

  return (
    <>
      <IconButton
        onClick={() => setOpen(!open)}
        size="small"
        className={active ? classes.active : ''}
      >
        <DateRangeIcon />
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)} className={classes.modal}>
        {body}
      </Modal>
    </>
  );
};

export default CustomTimePeriod;
