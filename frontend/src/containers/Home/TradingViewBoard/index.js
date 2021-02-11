import React,{ useState, useCallback, useEffect }  from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMediaQuery, Grid } from '@material-ui/core';
import { useSnackbar } from 'notistack';

import ContainedButton from 'components/UI/Buttons/ContainedButton';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import SectionHeader from 'components/UI/SectionHeader';
import { MemoizedOutlinedTextField } from 'components/UI/OutlinedTextField';

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
    tradingBoard: {
        width: '100%',
        height: '100%',
        [theme.breakpoints.down('sm')]: {
            height: 360,
            width: '100%'
        },
    },
    referral: {
        backgroundColor: theme.palette.error.light
    }
}));

const Hero = props => {
    const { setIsSwapDialog, account, className, ...rest } = props;
    const classes = useStyles();
    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'), {
        defaultMatches: true,
    });
    const [state, setState] = useState({
        bepaddress: 0,
    });
    const { enqueueSnackbar } = useSnackbar();

    const getReferrallink = () => {
        if (account) {
            console.log("get referral link")
            //setIsSwapDialog(true)
        }
        else {
            enqueueSnackbar('Please connect your wallet', { variant: 'warning' })
        }
    }
    const inputChangeHandler = useCallback(event => {
        const { name, value } = event.target;
        setState(prevState => ({
                ...prevState, [name]: value
        }));
    }, []);
    return (
        <div className={clsx(classes.root, className)} {...rest}>
            <Grid
                container
                justify="space-between"
                spacing={4}
                direction={isMd ? 'row' : 'column-reverse'}
            >
                <Grid
                    item
                    container
                    alignItems="center"
                    xs={12}
                    md={5}
                    data-aos={'fade-up'}>
                    <SectionHeader
                        title={
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <span style={{ color: theme.palette.text.hoverText, fontSize:'34px' }}>
                                Refer your friends and claim bonus
                                    <br />
                                </span>
                                <span style={{ color: theme.palette.text.primary, fontSize: 18, fontWeight: '300', textAlign: 'justify', lineHeight: 1.8 }}>
                                        Enter Address BSC Adderess                                    
                                    <br />
                                    <br />
                                </span>
                                <span>
                                    <MemoizedOutlinedTextField
                                        placeholder='Enter your BEP20 address'
                                        type="text"
                                        name={'bepaddress'}
                                        value={state.marsValue}
                                        onChange={inputChangeHandler}
                                    />
                                </span>
                            </div>
                        }
                        ctaGroup={[
                            <ContainedButton className={classes.referral} onClick={getReferrallink} variant="contained" size="large">
                                GET REFERRAL LINK
                            </ContainedButton>,
                        ]}
                        align={"center"}
                        disableGutter
                        titleVariant="h3"
                    />
                </Grid>
                <Grid
                    item
                    container
                    justify="flex-start"
                    alignItems="center"
                    xs={12}
                    md={6}
                    data-aos={'fade-up'}>
                    <div className={classes.tradingBoard}>
                        <TradingViewWidget
                            symbol="BNB"
                            theme={Themes.DARK}
                            locale="fr"
                            autosize />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

Hero.propTypes = {
    /**
     * External classes
     */
    className: PropTypes.string,
};

export default Hero;
