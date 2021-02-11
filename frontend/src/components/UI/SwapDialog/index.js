
import React, { useState, useCallback, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, Grid, useMediaQuery } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle';
import { MaxUint256 } from '@ethersproject/constants';
import { useSnackbar } from 'notistack';
import Chip from '@material-ui/core/Chip';

import CircleButton from 'components/UI/Buttons/CircleButton';
import RadiusButton from 'components/RadiusButton';
import { MemoizedOutlinedTextField } from 'components/UI/OutlinedTextField';
import ProgressBar from 'components/UI/ProgressBar';
import ClimbLoading from 'components/ClimbLoading';
import CustomizedStepper from 'components/UI/CustomizedStepper';
import { marsTokenInstance } from 'services/marsTokenInstance';
import { presaleInstance } from 'services/presaleInstance';
import { busdTokenInstance } from 'services/busdTokenInstance';
import { presaleContractAddress } from 'constants/contractAddresses';
// import { busdContractAddress } from 'constants/contractAddresses';
import { marsTokenContractAddress } from 'constants/contractAddresses'
import { isEmpty, delay } from 'utils/utility';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        border: `solid 0.5px ${theme.palette.text.secondary}`,
        margin: theme.spacing(0.5),
        borderRadius: '20px'
    },
    dialogTitleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row !important'
    },
    dialogActions: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(3),
        marginRight: -theme.spacing(2 / 8)
    },
    avatar: {
        backgroundColor: 'transparent',
        border: `2px solid ${theme.palette.text.secondary}`,
        height: theme.spacing(9),
        width: theme.spacing(9),
        marginRight: theme.spacing(1)
    },
    chipConatiner: {
        padding: theme.spacing(2.5, 1, 2.5, 1)
    },
    chip: {
        margin: theme.spacing(.5),
        backgroundColor: theme.palette.text.hoverText
    },
    titleLine: {
        marginBottom: theme.spacing(2.5)
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%'
    },
    button: {
        border: 'none',
        background: 'linear-gradient(125deg, #06352d, #36f3d2 80%)',
        width: '100% !important'
    },
    dialogActionContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: 0,
        padding: theme.spacing(3)
    },
    selectContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 8
    },
    loading: {
        width: 'auto !important',
        height: 'auto !important'

    }
}));
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SwapDialog = ({ onClose, account, chainId, library }) => {
    const classes = useStyles();
    const presaleTotalCount = 150000;
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [tokenPrice, setTokenPrice] = useState(10);
    const marsToken = marsTokenInstance(account, chainId, library);
    const presale = presaleInstance(account, chainId, library);
    const busdToken = busdTokenInstance(account, chainId, library);
    const [activeStep, setActiveStep] = useState(0);
    const [tokenSaleProgress, setTokenSaleProgress] = useState(0);
    const [yourMARSBalance, setYourMARSBalance] = useState(0);
    const [yourBUSDBalance, setYourBUSDBalance] = useState(0);
    const isSm = useMediaQuery(theme.breakpoints.down('sm'), {
        defaultMatches: true,
    });

    const [open] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [state, setState] = useState({
        busdValue: 0,
        marsValue: 0
    });

    useEffect(() => {
        try {
            const initialize = async () => {
                const tokenRate = await presale.getRewardTokenCount() / 1e18
                setTokenPrice(tokenRate);
                const marsTokenBanlance = await marsToken.balanceOf(marsTokenContractAddress) / 1e18
                const yourMNTNBalance = await marsToken.balanceOf(account) / 1e18
                const yourBUSDBalance = await busdToken.balanceOf(account) / 1e18
                setTokenSaleProgress(parseFloat((presaleTotalCount - marsTokenBanlance) / presaleTotalCount).toFixed(6))
                setYourMARSBalance(yourMNTNBalance);
                setYourBUSDBalance(yourBUSDBalance);
            }
    
            if (!isEmpty(presale) && !isEmpty(marsToken) && !isEmpty(account)) {
                initialize();
            }
        }
        catch (error) {
            console.log('kevin inital data error ===>', error)
        }

    }, [presale, account, marsToken, busdToken])

    const inputChangeHandler = useCallback(event => {
        const { name, value } = event.target;
        if (name === 'busdValue') {
            setState(prevState => ({
                ...prevState, [name]: value, 'marsValue': value / tokenPrice
            }));
        } else {
            setState(prevState => ({
                ...prevState, [name]: value, 'busdValue': value * tokenPrice
            }));
        }
    }, [tokenPrice]);

    const approveHandler = async () => {
        if (state.busdValue <= 0) {
            enqueueSnackbar(`BUSD is insufficient to buy MARS`, { variant: 'error' });
            return
        }
        setLoadingStatus(true)
        try {
            let loop = true;
            let tx = null;
            const allowedTokens = await busdToken.allowance(account, presaleContractAddress)
            if (parseInt(allowedTokens) / 1e18 <= state.busdValue) {
                const { hash: approveHash } = await busdToken.approve(`${presaleContractAddress}`, MaxUint256);
                while (loop) {
                    tx = await library.getTransactionReceipt(approveHash);
                    console.log('kevin transaction tx', tx)
                    if (isEmpty(tx)) {
                        await delay(300)
                    } else {
                        loop = false
                    }
                }
                if (tx.status === 1) {
                    setLoadingStatus(false)
                    setActiveStep(1)
                    return;
                }
            }
            else {
                setLoadingStatus(false)
                setActiveStep(1)
            }
        }
        catch (error) {
            enqueueSnackbar(`Approve error ${error?.data?.message}`, { variant: 'error' });
            setLoadingStatus(false)
            console.log('kevin===>', error)
        }
    }

    const swapHandler = async () => {
        if (state.busdValue <= 0) {
            enqueueSnackbar(`BUSD is insufficient to buy ASTROH`, { variant: 'error' });
            return
        }

        setLoadingStatus(true)
        try {
            let loop = true;
            let tx = null;
            const { hash: depositHash } = await presale.deposit(`${state.busdValue * 1e18}`);

            while (loop) {
                tx = await library.getTransactionReceipt(depositHash);
                console.log('kevin deposit transaction tx', tx)
                if (isEmpty(tx)) {
                    await delay(300)
                } else {
                    loop = false
                }
            }
            if (tx.status === 1) {
                setActiveStep(0)
                setLoadingStatus(false)
                enqueueSnackbar(`Swap has been successfully processed!`, { variant: 'success' });
                return;
            }
        }
        catch (error) {
            console.log('kevin===>', error)
            enqueueSnackbar(`Swap error ${error?.data?.message}`, { variant: 'error' });
            setLoadingStatus(false)
            setActiveStep(0)
        }
    }

    const chipClickHandler = () => {
        setState(prevState => ({
            ...prevState, 'busdValue': yourBUSDBalance, 'marsValue': yourBUSDBalance / tokenPrice
        }));
    }

    return (
        <div>
            <Dialog classes={{ paper: classes.root }}
                disableEnforceFocus fullScreen={isSm ? true : false}
                maxWidth={'lg'} open={open}
                TransitionComponent={Transition} >
                <DialogTitle>
                    <div className={classes.dialogTitleContainer}>
                        <Typography variant='h6' color='textSecondary'>Your Wallet :
                            <b style={{ color: '#F0B90B' }}> {yourBUSDBalance.toFixed(3)} </b> (BUSD) , <b style={{ color: '#E93929' }}>{yourMARSBalance.toFixed(3)}</b> (ASTROH) </Typography>
                        <CircleButton
                            style={{ backgroundColor: '#1B1F2E' }} onClick={onClose}
                            icon={<CloseIcon style={{ color: theme.palette.text.primary }} fontSize='default' />} />
                    </div>
                </DialogTitle>
                <DialogContent classes={{ root: classes.dialogContent }}>
                    <Typography component='div' variant='body1'
                        style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        BUY ASTROH TOKENS WITH BUSD
                        <Typography color='textSecondary' variant='h6' >
                            MAX: 50000 BUSD
                        </Typography>
                    </Typography>
                    <Grid container spacing={2} alignItems='center' justify='center' direction={isSm ? 'column' : 'row'}>
                        <Grid item xs={12} md={5} style={{ width: '100%' }}>
                            <MemoizedOutlinedTextField
                                placeholder='BUSD'
                                name={'busdValue'}
                                type="number"
                                value={state.busdValue}
                                onChange={inputChangeHandler}
                                endAdornment={<> <Chip label="MAX" onClick={chipClickHandler} clickable color="primary" /><img width='42px' height='40px' src='/assets/images/BUSD.png' alt='BUSD' /> </>}
                            /></Grid>
                        <Grid item xs={12} md={2} container alignItems='center' justify='center' style={{ width: '100%' }}>
                            {loadingStatus ? <ClimbLoading width={32} classes={{ root: classes.loading }} />
                                :
                                <>
                                    {isSm ?
                                        <SwapVertIcon fontSize='large' />
                                        :
                                        <SwapHorizIcon fontSize='large' />
                                    }
                                </>
                            }
                        </Grid>
                        <Grid item xs={12} md={5} style={{ width: '100%' }}>
                            <MemoizedOutlinedTextField
                                placeholder='ASTROH'
                                type="number"
                                name={'marsValue'}
                                value={state.marsValue}
                                onChange={inputChangeHandler}
                                endAdornment={<img width='42px' height='30px' src='/assets/images/ASTROH.png' alt='MARS' />}
                            />
                        </Grid>
                        <Grid item xs={12} style={{ width: '100%' }}>
                            <CustomizedStepper
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions disableSpacing classes={{ root: classes.dialogActionContainer }} >
                    <RadiusButton
                        loading={loadingStatus}
                        onClick={() => activeStep === 0 ? approveHandler() : swapHandler()} variant='outlined'
                        className={classes.button} fullWidth={true}>
                        {activeStep === 0
                            ? <VerifiedUserIcon style={{ marginRight: 8 }} />
                            : <SwapHorizontalCircleIcon style={{ marginRight: 8 }} />}
                        <Typography variant='h6'>
                            {activeStep === 0 ? 'Approve' : 'Swap'}
                        </Typography>
                    </RadiusButton>
                    <Grid item xs={12} style={{ width: '100%', marginTop: 20 }}>
                        <ProgressBar tokenSaleProgress={parseFloat(tokenSaleProgress)} />
                    </Grid>
                </DialogActions >
            </Dialog>
        </div>
    );
}

export default SwapDialog;