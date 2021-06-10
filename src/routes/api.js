const express = require('express');
const router = express.Router();

const bsc = require('../bsc-api/bsc');
const BSCApi = bsc('1CMUUUMWU2SXGZI7T1PB6EQSRKG4T1KEQV');
const bscParser = require('../bsc-api/parser');

const Web3Api = require('../web3-api/web3Api');

const cachedStorage = require('../utils/cachedStorage');
const { default: axios } = require('axios');
const Storage = new cachedStorage();

router.get('/totalsupply', async (req, res) => {
    Storage.cache(req.url, async () => {
        const result = {
            dfx: 0,
            stDFX: 0,
            cakeLP: 0
        };

        await Promise.all([
            Web3Api.dfxProxy.totalSupply().then(value => result.dfx = value),
            Web3Api.erc20.stDfx.totalSupply().then(value => result.stDFX = value),
            Web3Api.erc20.cakeLP.totalSupply().then(value => result.cakeLP = value)
        ]);
        return result;
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/tokeninfo/:token', async (req, res) => {
    const token = req.params.token;
    Storage.cache(req.url, async () => {
        return (await bscParser.tokenInfo(token));
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/topholders/:token', async (req, res) => {
    const token = req.params.token;
    const minDfx = req.query.minDfx || -1;
    Storage.cache(req.url, async () => {
        return (await bscParser.topHolders(token, minDfx)).sort((a, b) => a.rank - b.rank);
    });

    res.status(200).json(await Storage.take(req.url));
});

router.get('/balanceOf/:address', async (req, res) => {
    const address = req.params.address;

    Storage.cache(req.url, async () => {
        const result = {
            dfx: 0,
            stDFX: 0,
            cakeLPFarming: 0,
            cakeLP: 0
        };

        await Promise.all([
            Web3Api.dfxProxy.balanceOf(address).then(value => result.dfx = value),
            Web3Api.erc20.stDfx.balanceOf(address).then(value => result.stDFX = value),
            Web3Api.dfxFarming.userInfo(address).then(value => result.cakeLPFarming = value.amount),
            Web3Api.erc20.cakeLP.balanceOf(address).then(value => result.cakeLP = value)
        ]);

        return result;
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/prices', async (req, res) => {
    Storage.cache(req.url, async () => {
        const info = {
            dfxPrice: 0,
            totalSupply: {
                dfx: 0,
                stDFX: 0,
                cakeLP: 0
            },
            dfxAmount: {
                pancakeSwap: 0,
                dfxStaked: 0
            }
        }

        await Promise.all([
            axios.get(`http://${req.app.get('host')}/api/tokeninfo/0x74b3abb94e9e1ecc25bd77d6872949b4a9b2aacf`).then(response => {
                info.dfxPrice = response.data.result.price.usd;
            }),
            axios.get(`http://${req.app.get('host')}/api/totalsupply/`).then(response => {
                info.totalSupply = response.data.result;
            }),
            axios.get(`http://${req.app.get('host')}/api/balanceOf/0xe7ff9aceb3767b4514d403d1486b5d7f1b787989`).then(response => {
                info.dfxAmount.pancakeSwap = response.data.result.dfx;
            }),
            axios.get(`http://${req.app.get('host')}/api/balanceOf/0x11340dc94e32310fa07cf9ae4cd8924c3cd483fe`).then(response => {
                info.dfxAmount.dfxStaked = response.data.result.dfx;
            }),
        ]);

        const result = {
            dfx: info.dfxPrice,
            stDFX: info.dfxPrice * info.dfxAmount.dfxStaked / info.totalSupply.stDFX,
            cakeLP: 2 * info.dfxPrice * info.dfxAmount.pancakeSwap / info.totalSupply.cakeLP
        };

        return result;
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/usdBalanceOf/:address', async (req, res) => {
    const address = req.params.address;

    Storage.cache(req.url, async () => {
        const info = {
            userTokens: {
                dfx: 0,
                stDFX: 0,
                cakeLPFarming: 0,
                cakeLP: 0
            },
            prices: {
                dfx: 0,
                stDFX: 0,
                cakeLP: 0
            }
        };

        await Promise.all([
            axios.get(`http://${req.app.get('host')}/api/balanceOf/${address}`).then(response => {
                info.userTokens = response.data.result;
            }),
            axios.get(`http://${req.app.get('host')}/api/prices/`).then(response => {
                info.prices = response.data.result;
            })
        ]);

        const result = {
            dfx: info.prices.dfx * info.userTokens.dfx,
            stDFX: info.prices.stDFX * info.userTokens.stDFX,
            cakeLPFarming: info.prices.cakeLP * info.userTokens.cakeLPFarming,
            cakeLP: info.prices.cakeLP * info.userTokens.cakeLP,
            prices: info.prices
        };

        return result;
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/tx/:address', async (req, res) => {
    const address = req.params.address;
    const limit = req.query.limit || 50;
    Storage.cache(req.url, async () => {
        return await BSCApi.account.getTransactions(address, limit);
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/tx/bep/:address', async (req, res) => {
    const address = req.params.address;
    const limit = req.query.limit || 50;
    Storage.cache(req.url, async () => {
        return await BSCApi.account.getBEPTokenEvents(address, limit);
    });

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

router.get('/balance/:token', async (req, res) => {
    const token = req.params.token;
    const address = req.query.address;
    Storage.cache(req.url, async () => {
        return await BSCApi.account.getTokenBalance(token, address);
    })

    res.status(200).json({
        result: await Storage.take(req.url)
    });
});

module.exports = router;