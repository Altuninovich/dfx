const loadingText = 'Loading...';
const loadingHTML = `<em>${loadingText}</em>`;

let prices = {
    dfx: NaN,
    stDFX: NaN,
    cakeLP: NaN
};

const address = {
    dfx: '0x74b3abb94e9e1ecc25bd77d6872949b4a9b2aacf',
    stDfx: '0x11340dC94E32310FA07CF9ae4cd8924c3cD483fe'
};

function isLoaded(nTd) {
    return nTd.innerText !== loadingText;
}

function formatToUSD(number) {
    return `$${Number(number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function formatToNumber(text) {
    return parseFloat(text.replace(/,/g, '').replace('$', ''));
}

function prepareData(holders) {
    const result = [];

    holders.forEach(holder => {
        const { address, quantity, value, isContract } = holder;

        const contractIcon = '<i class="fas fa-file-contract"></i>';
        const addressAnchor = `<a href="https://bscscan.com/address/${address}" target="_blank">${address}</a><sup>&nbsp;<a href="addressinfo.html?address=${address}" target="_blank"><i class="fas fa-university"></i></a></sup>`

        const dataObject = {
            address: isContract ? `${contractIcon} ${addressAnchor}` : addressAnchor,
            dfx: quantity.toFixed(2),
            stDfx: loadingHTML,
            lpFarming: loadingHTML,
            lpBalance: loadingHTML,
            value: loadingHTML
        };

        result.push(dataObject);
    });

    return result;
}

async function processBalances(table, holders) {
    holders.forEach((holder, index) => {
        fetch(`/api/balanceOf/${holder['address']}`).then(async balanceResponse => {
            const result = (await balanceResponse.json()).result;
            const dfx = table.cell(`:eq(${index})`, 1).data();
            table.cell(`:eq(${index})`, 2).data(result.stDFX.toFixed(2));
            table.cell(`:eq(${index})`, 3).data(result.cakeLPFarming.toFixed(2));
            table.cell(`:eq(${index})`, 4).data(result.cakeLP.toFixed(2));

            await pricesPromise;

            const dfxValue = Number(dfx) * prices.dfx;
            const stDFXValue = result.stDFX * prices.stDFX;
            const cakeLPValue = result.cakeLP * prices.cakeLP;
            const cakeLPFarmingValue = result.cakeLPFarming * prices.cakeLP;
            table.cell(`:eq(${index})`, 5).data(formatToUSD(dfxValue + stDFXValue + cakeLPValue + cakeLPFarmingValue));
        });
    });
}

async function renderTable(holders) {
    const table = $("#dfxTopTable").DataTable({
        data: prepareData(holders),
        order: [[1, 'desc']],
        columns: [
            {
                title: 'Адрес',
                data: 'address',
            },
            {
                title: 'DFX',
                data: 'dfx',
                "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                    tippy(nTd, {
                        onShow(instance) {
                            if (isLoaded(nTd) && !isNaN(prices.dfx)) {
                                instance.setContent(`≈${formatToUSD(nTd.innerText * prices.dfx)}`);
                            } else {
                                instance.setContent(loadingHTML);
                            }
                        },
                        arrow: false,
                        allowHTML: true
                    });
                }
            },
            {
                title: 'stDFX',
                data: 'stDfx',
                "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                    tippy(nTd, {
                        onShow(instance) {
                            if (isLoaded(nTd) && !isNaN(prices.stDFX)) {
                                instance.setContent(`≈${formatToUSD(nTd.innerText * prices.stDFX)}`);
                            } else {
                                instance.setContent(loadingHTML);
                            }
                        },
                        arrow: false,
                        allowHTML: true
                    });
                }
            },
            {
                title: 'LP Farming',
                data: 'lpFarming',
                "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                    tippy(nTd, {
                        onShow(instance) {
                            if (isLoaded(nTd) && !isNaN(prices.cakeLP)) {
                                instance.setContent(`≈${formatToUSD(nTd.innerHTML * prices.cakeLP)}`);
                            } else {
                                instance.setContent(loadingHTML);
                            }
                        },
                        arrow: false,
                        allowHTML: true
                    });
                }
            },
            {
                title: 'LP Balance',
                data: 'lpBalance',
                "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                    tippy(nTd, {
                        onShow(instance) {
                            if (isLoaded(nTd) && !isNaN(prices.cakeLP)) {
                                instance.setContent(`≈${formatToUSD(nTd.innerHTML * prices.cakeLP)}`);
                            } else {
                                instance.setContent(loadingHTML);
                            }
                        },
                        arrow: false,
                        allowHTML: true
                    });
                }
            },
            {
                title: 'Капитал',
                data: 'value'
            }
        ]
    });

    processBalances(table, holders);

    return table;
}

const pricesPromise = fetch('/api/prices').then(async response => {
    prices = (await response.json()).result;
});

fetch(`/api/topholders/${address.dfx}`).then(async dfxResponse => {
    fetch(`/api/topholders/${address.stDfx}`).then(async stDFXResponse => {
        const holders = {
            dfx: null,
            stDFX: null
        };

        await Promise.all([
            dfxResponse.json().then(value => holders.dfx = value),
            stDFXResponse.json().then(value => holders.stDFX = value)
        ]);

        for (let i = 0; i < holders.stDFX.length; i++) {
            const holder = holders.stDFX[i];
            if (holders.dfx.findIndex(x => x.address === holder.address) === -1) {
                holders.dfx.push({
                    "rank": null,
                    "address": holder.address,
                    "quantity": 0,
                    "value": null,
                    "isContract": holder.isContract
                });
            }
        }

        $(document).ready(() => {
            renderTable(holders.dfx);
        });
    });
});