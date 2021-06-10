class Contract {
    constructor(web3, contractInfo) {
        this.contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address);
    }

    fromWei(number) {
        return number / 10 ** 18;
    }
}

module.exports = Contract;