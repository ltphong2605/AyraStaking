
import { Contract } from '@ethersproject/contracts'

import { marsABI } from '../../abis/mars';
import { marsTokenContractAddress } from '../../constants/contractAddresses';

const marsTokenInstance = (account, chainId, library) => {
    if (chainId) {
        return new Contract(marsTokenContractAddress, marsABI, library.getSigner(account));
    }
    return null
}

export {
    marsTokenInstance
}
