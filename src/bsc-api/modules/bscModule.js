const { default: axios } = require("axios");

class BSCModule {
    constructor(bscToken, moduleName) {
        this.apiHost = 'https://api.bscscan.com/api?';
        this.weiValue = 1000000000000000000;
        this.bscToken = bscToken;
        this.moduleName = moduleName;
    }

    getEncodedUrl(params) {
        const allParams = Object.assign({
            apikey: this.bscToken,
            module: this.moduleName
        }, params);

        const arrayOfParams = [];
        for (let p in allParams) {
            arrayOfParams.push(encodeURIComponent(p) + '=' + encodeURIComponent(allParams[p]));
        }

        return `${this.apiHost}${arrayOfParams.join('&')}`;
    }

    request(url) {
        return new Promise((resolve, reject) => {
            axios.get(url).then(response => {
                resolve(JSON.parse(JSON.stringify(response.data)));
            }).catch(reason => reject(reason));
        });
    }

    fromWei(number) {
        return number / this.weiValue;
    }
}

module.exports = BSCModule;