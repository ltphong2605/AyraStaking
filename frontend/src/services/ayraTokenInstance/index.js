
import { Contract } from '@ethersproject/contracts'

import { ayraABI } from '../../abis/ayra';
import { ayraTokenContractAddress } from '../../constants/contractAddresses';

const ayraTokenInstance = (account, chainId, library) => {
    if (chainId) {
        return new Contract(ayraTokenContractAddress, ayraABI, library.getSigner(account));
    }
    return null
}

export {
    ayraTokenInstance
}
