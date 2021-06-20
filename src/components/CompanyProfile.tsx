import React from 'react';
import { Avatar, Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useGlobalContext } from '../context';

const useStyles = makeStyles((theme) => ({
  caption: {
    marginLeft: theme.spacing(1),
  },
}));

const CompanyProfile = () => {
  const { selectedSymbol } = useGlobalContext();

  const classes = useStyles();

  if (selectedSymbol) {
    const { companyProfile } = selectedSymbol;

    return (
      <Box paddingTop={2} paddingBottom={2} textAlign="left">
        <Box display="flex" alignItems="center" marginBottom={1}>
          <Avatar src={companyProfile?.logo} />
          <Box display="flex" flexDirection="column" paddingLeft={2}>
            <Typography component="h2" variant="h5" color="primary">
              {companyProfile?.name}
              <Typography
                className={classes.caption}
                component="span"
                variant="caption"
                color="textSecondary"
              >
                {companyProfile?.country}
              </Typography>
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {companyProfile?.finnhubIndustry}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1">Key Stats</Typography>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            Market Capitalization
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Math.floor(companyProfile?.marketCapitalization || 0)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            Share Outstanding
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Math.floor(companyProfile?.shareOutstanding || 0)}
          </Typography>
        </Box>
      </Box>
    );
  }

  return null;
};

export default CompanyProfile;
