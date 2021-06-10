const BSCModule = require('./bscModule');

class Stats extends BSCModule {
    constructor(bscToken) {
        super(bscToken, 'stats');
    }

    async getTotalSupply(tokenAddress) {
        const url = this.getEncodedUrl({
            action: 'tokensupply',
            contractaddress: tokenAddress
        });

        const response = await this.request(url);
        return this.fromWei(response.result);
    }
}

module.exports = Stats;