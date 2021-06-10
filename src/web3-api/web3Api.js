const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');

const DFXFarming = require('./contracts/dfxFarming');
const DFXProxy = require('./contracts/dfxProxy');
const ERC20 = require('./contracts/erc20');

function e() {
    return {
        dfxProxy: new DFXProxy(web3),
        dfxFarming: new DFXFarming(web3),
        erc20: {
            stDfx: new ERC20(web3, '0x11340dC94E32310FA07CF9ae4cd8924c3cD483fe'),
            cakeLP: new ERC20(web3, '0xe7ff9aceb3767b4514d403d1486b5d7f1b787989')
        }
    };
}

module.exports = e();