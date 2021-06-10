const { default: axios } = require('axios');
const JSDom = require('jsdom').JSDOM;

function toNumber(number) {
    return Number(number.replace(/,/g, '').match(/[+-]?([0-9]*[.])?[0-9]+/)[0]);
}

function parseHoldersPage(token, minDfx, page) {
    let result = [];

    return new Promise((resolve, reject) => {
        axios.get(`https://bscscan.com/token/generic-tokenholders2?a=${token}&p=${page}`).then(response => {
            const document = new JSDom(response.data).window.document;
            const table = document.querySelector("#maintable > div:nth-child(3) > table > tbody");

            for (let i = 0; i < table.childNodes.length; i++) {
                const node = table.childNodes[i];

                if (node.nodeType == node.TEXT_NODE)
                    continue;

                const quantity = Number(node.childNodes[2].textContent.replace(/,/g, ''));

                if (quantity < minDfx)
                    break;

                result.push({
                    rank: node.childNodes[0].textContent,
                    address: node.childNodes[1].firstChild.lastChild.href.split('=')[1],
                    quantity: quantity,
                    value: node.childNodes[4].textContent,
                    isContract: node.childNodes[1].firstChild.firstChild.nodeName === 'I'
                });
            }

            resolve(result);
        });
    });
}

async function topHolders(token, minDfx) {
    let result = [];
    let pagePromises = [];

    await axios.get(`https://bscscan.com/token/generic-tokenholders2?a=${token}`).then(response => {
        const pages = String(response.data).match(/Page .*>(\d+)<\/strong>/)[1];

        for (let i = 1; i <= pages; i++) {
            pagePromises.push(parseHoldersPage(token, minDfx, i).then(value => {
                result.push(...value);
            }));
        }
    });

    await Promise.all(pagePromises);
    return result;
}

async function tokenInfo(token) {
    const result = {
        price: {
            usd: 0,
            bnb: 0
        },
        marketCap: 0,
        totalSupply: 0,
        totalHolders: 0
    };

    await axios.get(`https://bscscan.com/token/${token}`).then(response => {
        const document = new JSDom(response.data).window.document;

        result.price.usd = toNumber(document.querySelector("#ContentPlaceHolder1_tr_valuepertoken > div > div.col-6.u-ver-divider > span").firstChild.textContent);
        result.price.bnb = toNumber(document.querySelector("#ContentPlaceHolder1_tr_valuepertoken > div > div.col-6.u-ver-divider > span > span.small.text-secondary.text-nowrap").textContent);
        result.marketCap = toNumber(document.querySelector("#pricebutton").textContent);
        result.totalSupply = toNumber(document.querySelector("#ContentPlaceHolder1_divSummary > div.row.mb-4 > div.col-md-6.mb-3.mb-md-0 > div > div.card-body > div.row.align-items-center > div.col-md-8.font-weight-medium > span.hash-tag.text-truncate").textContent);
        result.totalHolders = toNumber(document.querySelector("#ContentPlaceHolder1_tr_tokenHolders > div > div.col-md-8 > div > div").textContent);
    });

    return result;
}

function e() {
    return {
        tokenInfo: tokenInfo,
        topHolders: topHolders
    };
}

module.exports = e();