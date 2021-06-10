const Contract = require("./contract");

class ERC20 extends Contract {
    constructor(web3, token) {
        super(web3, {
            abi: require('../abi/erc20.json'),
            address: token
        });
    }

    async balanceOf(address) {
        return this.fromWei(await this.contract.methods.balanceOf(address).call());
    }

    async totalSupply() {
        return this.fromWei(await this.contract.methods.totalSupply().call());
    }
}

module.exports = ERC20;