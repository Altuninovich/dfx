const Contract = require("./contract");

class DFXFarming extends Contract {
    constructor(web3) {
        super(web3, {
            abi: require('../abi/dfxFarming.json'),
            address: '0x9d943FD36adD58C42568EA1459411b291FF7035F'
        });
    }

    async userInfo(address) {
        const { amount, rewardDebt } = await this.contract.methods.userInfo(1, address).call();

        return {
            amount: this.fromWei(amount),
            rewardDebt: this.fromWei(rewardDebt)
        };
    }
}

module.exports = DFXFarming;