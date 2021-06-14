import React, { useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { useGlobalContext } from '../context';

const CustomTimePeriod = () => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const { setCustomTimePeriod } = useGlobalContext();

  const handleClick = () => {
    const fd = new Date(fromDate);
    const td = new Date(toDate);
    setCustomTimePeriod(fd, td);
  };

  return (
    <>
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
      <Button disabled={fromDate === '' || toDate === ''} onClick={handleClick}>
        Go To
      </Button>
    </>
  );
};

export default CustomTimePeriod;
