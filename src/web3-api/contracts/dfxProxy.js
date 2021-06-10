const Contract = require("./contract");

class DFXProxy extends Contract {
    constructor(web3) {
        super(web3, {
            abi: require('../abi/dfxProxy.json'),
            address: '0x74B3abB94e9e1ECc25Bd77d6872949B4a9B2aACF'
        });
    }

    async totalSupply() {
        return this.fromWei(await this.contract.methods.totalSupply().call());
    }

    async balanceOf(address) {
        return this.fromWei(await this.contract.methods.balanceOf(address).call());
    }
}

module.exports = DFXProxy;