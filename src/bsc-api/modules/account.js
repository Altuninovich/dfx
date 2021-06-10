const BSCModule = require('./bscModule');
const axios = require('axios').default;

class Account extends BSCModule {
    constructor(bscToken) {
        super(bscToken, 'account');
    }

    async getBNBBalance(address) {
        const url = this.getEncodedUrl({
            action: 'balance',
            address: address,
            tag: 'latest'
        });

        const response = await this.request(url);
        return this.fromWei(response.result);
    }

    async getTransactions(address, limit, page = 1) {
        const url = this.getEncodedUrl({
            action: 'txlist',
            address: address,
            startblock: 1,
            endblock: 99999999,
            page: page,
            offset: limit,
            sort: 'desc'
        });

        const response = await this.request(url);
        return response.result;
    }

    async getBEPTokenEvents(address, limit, page = 1) {
        const url = this.getEncodedUrl({
            action: 'tokentx',
            address: address,
            startblock: 1,
            endblock: 99999999,
            page: page,
            offset: limit,
            sort: 'desc'
        });

        const response = await this.request(url);
        return response.result;
    }

    async getTokenBalance(token, address) {
        const url = this.getEncodedUrl({
            action: 'tokenbalance',
            contractaddress: token,
            address: address,
            tag: 'latest'
        });

        const response = await this.request(url);
        return this.fromWei(response.result);
    }
}

module.exports = Account;