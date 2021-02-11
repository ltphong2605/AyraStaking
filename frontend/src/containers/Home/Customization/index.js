
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMediaQuery, Grid } from '@material-ui/core';

import ContainedButton from 'components/UI/Buttons/ContainedButton';
import Image from 'components/UI/Image';
import SectionHeader from 'components/UI/SectionHeader';

const useStyles = makeStyles(theme => ({
  root: {},
  image: {
    boxShadow:
      '25px 60px 125px -25px rgba(80,102,144,.1), 16px 40px 75px -40px rgba(0,0,0,.2)',
    borderRadius: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 500,
    },
  },
  lastGrid: {
    [theme.breakpoints.up('sm')]: {
      marginTop: '0%',
    },
  },
}));

const Customization = props => {
  const { className, ...rest } = props;
  const classes = useStyles();

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  const viewHandler = () => {
    window.open('https://climbtoken.gitbook.io/climb-token/', '_blank');
  }

  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <SectionHeader
        label="Investment Diversification"
        title="White Paper"
        subtitle="Edit 1 Climb Token Finance a decentralized exchange running on Binance Smart Chain and Pancake swap exchange, with lots of other features that let you earn and win tokens. Just holding our token will make profits, but if you want more you can do staking and farming with good returns and low risk."
        align="center"
        ctaGroup={[
          <ContainedButton variant="contained" color="primary" style={{ backgroundColor: theme.palette.text.hoverText }} size="large">
            Download
          </ContainedButton>,
          <ContainedButton onClick={viewHandler} variant="outlined" color="primary" size="large">
            View
          </ContainedButton>,
        ]}
      />
      <Grid container spacing={isMd ? 4 : 2}>
        <Grid item xs={12} sm={6}>
          <Grid container justif="center" alignItems="center">
            <Image
              src="assets/images/dashboard-screenshot.jpg"
              alt="A Funding Portal"
              className={classes.image}
              data-aos="fade-up"
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid
            container
            justif="center"
            alignItems="center"
            className={classes.lastGrid}
          >
            <Image
              src="assets/images/dashboard-screenshot1.jpg"
              alt="A Funding Portal"
              className={classes.image}
              data-aos="fade-up"
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

Customization.propTypes = {
  /**
   * External classes
   */
  className: PropTypes.string,
};

export default Customization;
