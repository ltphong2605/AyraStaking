
import React, { useState, useCallback, useContext } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, Grid, useMediaQuery } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
//import { MaxUint256 } from '@ethersproject/constants';
import { useSnackbar } from 'notistack';

import RadiusButton from 'components/RadiusButton';
import { MemoizedOutlinedTextField } from 'components/UI/OutlinedTextField';
import { ayraTokenInstance } from 'services/ayraTokenInstance';
import { isEmpty, delay } from 'utils/utility';
import { AppContext } from 'contexts';
//import { JsonRpcProvider } from '@ethersproject/providers';
import { serializeError } from 'eth-rpc-errors';
import testUtils from 'react-dom/test-utils';
import { parseEther } from '@ethersproject/units';

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
// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

const PresaleAirdrop = () => {
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { account, library, chainId } = useContext(AppContext);
    const ayraToken = ayraTokenInstance(account, chainId, library);
    const isSm = useMediaQuery(theme.breakpoints.down('sm'), {
        defaultMatches: true,
    });

    const [loadingStakeStatus, setLoadingStakeStatus] = useState(false);
    const [loadingWithdrawStatus, setLoadingWithdrawStatus] = useState(false);
    const [state, setState] = useState({
        stakeValue: 0,
        withdrawValue: 0
    });

    const inputChangeHandler = useCallback(event => {
        const { name, value } = event.target;
        setState(prevState => ({
                ...prevState, [name]: value
        }));
    }, []);

    const stakeHandler = async () => {
        if (state.stakeValue <= 0) {
            enqueueSnackbar(`Stake Amount isn't greater than 0`, { variant: 'error' });
            return;
        } 
        setLoadingStakeStatus(true)
        try {
            let loop = true;
            let tx = null;
            //const { hash: approveHash } = await ayraToken.create(`${state.stakeValue * 1e18}`);
            const { hash: approveHash } = await ayraToken.create(`testw`, `tsw`, `18`, `1000`,{value: parseEther('0.1')});
            //console.log("dd")
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
                setLoadingStakeStatus(false)
                enqueueSnackbar(`Stake has been successfully processed!`, { variant: 'success' });
                return;
            }
        }
        catch (error) {
            // let error_msg = serializeError(error).data.originalError.error.message;
            // enqueueSnackbar(`Stake error - ${error_msg}`, { variant: 'error' });
            setLoadingStakeStatus(false)
            console.log('kevin===>', error)
        }
    }

    const withdrawHandler = async () => {
        if (state.withdrawValue <= 0) {
            enqueueSnackbar(`Withdraw Amount isn't greater than 0`, { variant: 'error' });
            return;
        } 
        setLoadingWithdrawStatus(true)
        try {
            let loop = true;
            let tx = null;
            const { hash: approveHash } = await ayraToken.withdraw(`${state.withdrawValue * 1e18}`);
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
                setLoadingWithdrawStatus(false)
                enqueueSnackbar(`Withdraw has been successfully processed!`, { variant: 'success' });
                return;
            }
        }
        catch (error) {
            let error_msg = serializeError(error).data.originalError.error.message;
            enqueueSnackbar(`Withdraw error - ${error_msg}`, { variant: 'error' });
            setLoadingWithdrawStatus(false)
            console.log('kevin===>', error)
        }
    }

    return (
        <div>
            <Grid container spacing={2} alignItems='center' justify='center' direction={isSm ? 'column' : 'row'}>
                <Grid item xs={12} md={6} style={{ width: '100%' }}>
                    <MemoizedOutlinedTextField
                        placeholder='AYRA'
                        name={'stakeValue'}
                        type="number"
                        value={state.stakeValue}
                        onChange={inputChangeHandler}
                        endAdornment={<> AYRA </>}
                    /></Grid>
                <Grid item xs={12} md={6} style={{ width: '100%'}}>
                    <RadiusButton
                        loading={loadingStakeStatus}
                        onClick = {stakeHandler}
                        className={classes.button} fullWidth={true}>
                        <Typography variant='h6'>
                            STAKE
                        </Typography>
                    </RadiusButton>
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems='center' justify='center' direction={isSm ? 'column' : 'row'}>
                <Grid item xs={12} md={6} style={{ width: '100%' }}>
                    <MemoizedOutlinedTextField
                        placeholder='AYRA'
                        type="number"
                        name={'withdrawValue'}
                        onChange={inputChangeHandler}
                        value={state.withdrawValue}
                        endAdornment="AYRA"
                    />
                </Grid>
                <Grid item xs={12} md={6} style={{ width: '100%'}}>
                    <RadiusButton
                        loading={loadingWithdrawStatus}
                        onClick = {withdrawHandler}
                        className={classes.button} fullWidth={true}>
                        <Typography variant='h6'>
                            WITHDRAW
                        </Typography>
                    </RadiusButton>
                </Grid>
            </Grid>
        </div>
    );
}

export default PresaleAirdrop;