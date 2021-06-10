// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

const dfx = '0x74b3abb94e9e1ecc25bd77d6872949b4a9b2aacf';

const dfxFarming = '0x9d943fd36add58c42568ea1459411b291ff7035f';
const dfxStaked = '0x11340dc94e32310fa07cf9ae4cd8924c3cd483fe';
const dfxReservoir = '0x77f7B39E166A19f9191d70e1f9910114a9e1C592';
const pancakeSwap = '0xe7ff9aceb3767b4514d403d1486b5d7f1b787989';
const bUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56';

function convertDateToUTC(date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );
}

function fromWei(number) {
    return Number(number) / 10 ** 18;
}

function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day < 10)
        day = '0' + day;
    if (month < 10)
        month = '0' + month;

    return `${day}/${month}/${year}`;
}

function renderGraph(context, data, options = {
    buyLabel: "Покупки",
    sellLabel: "Продажи",
    valueCallback: (value, index, values) => {
        return formatToUSD(value);
    },
    tooltipCallback: (tooltipItem, chart) => {
        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
        return datasetLabel + ': ' + formatToUSD(tooltipItem.yLabel);
    }
}) {
    return new Chart(context, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: options.buyLabel,
                lineTension: 0.3,
                backgroundColor: "rgba(41, 163, 96, 0.05)",
                borderColor: "rgba(41, 163, 96, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(41, 163, 96, 1)",
                pointBorderColor: "rgba(41, 163, 96, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(41, 163, 96, 1)",
                pointHoverBorderColor: "rgba(41, 163, 96, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: data.buyData,
            },
            {
                label: options.sellLabel,
                lineTension: 0.3,
                backgroundColor: "rgba(226, 29, 34, 0.05)",
                borderColor: "rgba(226, 29, 34, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(226, 29, 34, 1)",
                pointBorderColor: "rgba(226, 29, 34, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(226, 29, 34, 1)",
                pointHoverBorderColor: "rgba(226, 29, 34, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: data.sellData,
            }],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        callback: options.valueCallback
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: options.tooltipCallback
                }
            }
        }
    });
}

function processData(transactions, allowedAddresses, buyToAddress, callbacks) {
    const result = {
        labels: [],
        sellData: [],
        buyData: []
    };

    let lastDate = convertDateToUTC(new Date(transactions[transactions.length - 1].timeStamp * 1000));
    let currentDate;
    let sellValue = 0;
    let buyValue = 0;

    for (let i = transactions.length - 1; i >= 0; i--) {
        const tx = transactions[i];
        if (allowedAddresses.every(address => tx.contractAddress !== address))
            continue;

        currentDate = convertDateToUTC(new Date(tx.timeStamp * 1000));
        if (lastDate.getDay() !== currentDate.getDay()) {
            result.labels.push(formatDate(lastDate));
            result.sellData.push(sellValue);
            result.buyData.push(buyValue);
            lastDate = currentDate;
            sellValue = 0;
            buyValue = 0;
        }

        const isBuyTransaction = tx.to === buyToAddress;

        if (tx.tokenSymbol in callbacks) {
            const callback = callbacks[tx.tokenSymbol];
            isBuyTransaction ? buyValue += callback(tx.value) : sellValue += callback(tx.value);
        }
    }

    result.labels.push(formatDate(currentDate));
    result.sellData.push(sellValue);
    result.buyData.push(buyValue);
    return result;
}

async function fetchPieData() {
    const result = {
        farming: (await (await fetch(`/api/balanceOf/${dfxFarming}`)).json()).result.dfx,
        staked: (await (await fetch(`/api/balanceOf/${dfxStaked}`)).json()).result.dfx,
        pancakeSwap: (await (await fetch(`/api/balanceOf/${pancakeSwap}`)).json()).result.dfx,
        reservoir: (await (await fetch(`/api/balanceOf/${dfxReservoir}`)).json()).result.dfx
    };

    return result;
}

async function fetchGraphData() {
    const data = {
        pancakeSwapDFX: {
            labels: [],
            sellData: [],
            buyData: []
        },
        staking: {
            labels: [],
            sellData: [],
            buyData: []
        },
        stakingUSD: {
            labels: [],
            sellData: [],
            buyData: []
        },
        farming: {
            labels: [],
            sellData: [],
            buyData: []
        },
        farmingUSD: {
            labels: [],
            sellData: [],
            buyData: []
        }
    };

    let prices = {
        dfx: 0,
        stDFX: 0,
        cakeLP: 0
    };

    await fetch(`/api/prices/`).then(async response => {
        prices = (await response.json()).result;
    })

    await Promise.all([
        fetch(`/api/tx/bep/${pancakeSwap}?limit=10000`).then(async response => {
            let json = (await response.json()).result;
            const transactions = json.filter((x) => x.tokenSymbol === "DFX");

            const result = {
                labels: [],
                sellData: [],
                buyData: [],
            };

            let sellValue = 0;
            let buyValue = 0;
            let currentDate;
            let lastDate = convertDateToUTC(new Date(transactions[transactions.length - 1].timeStamp * 1000));

            for (let i = transactions.length - 1; i >= 0; --i) {
                const tx = transactions[i];
                const isDFXBought = tx.from === pancakeSwap;

                currentDate = convertDateToUTC(new Date(tx.timeStamp * 1000));
                if (lastDate.getDay() !== currentDate.getDay()) {
                    result.labels.push(formatDate(lastDate));
                    result.sellData.push(sellValue);
                    result.buyData.push(buyValue);
                    sellValue = 0;
                    buyValue = 0;
                    lastDate = currentDate;
                }
                const indexOfBUSD = json.findIndex(x => x.hash === tx.hash && x.tokenSymbol === "BUSD");

                if (indexOfBUSD !== -1) {
                    if (isDFXBought) {
                        if (json[indexOfBUSD].to === pancakeSwap)
                            buyValue += fromWei(tx.value);
                    } else {
                        if (json[indexOfBUSD].from === pancakeSwap)
                            sellValue += fromWei(tx.value);
                    }
                }
            }

            result.labels.push(formatDate(lastDate));
            result.sellData.push(sellValue);
            result.buyData.push(buyValue);

            data.pancakeSwapDFX = result;
        }),
        fetch(`/api/tx/bep/${dfxStaked}?limit=10000`).then(async response => {
            const jsonResult = (await response.json()).result;
            data.staking = processData(jsonResult, [dfx], dfxStaked, {
                'DFX': (value) => fromWei(value)
            });
            data.stakingUSD = processData(jsonResult, [dfx], dfxStaked, {
                'DFX': (value) => fromWei(value) * prices.dfx
            });
        }),
        fetch(`/api/tx/bep/${dfxFarming}?limit=10000`).then(async response => {
            const jsonResult = (await response.json()).result;
            data.farming = processData(jsonResult, [pancakeSwap], farmingContract, {
                'Cake-LP': (value) => fromWei(value)
            });
            data.farmingUSD = processData(jsonResult, [pancakeSwap], farmingContract, {
                'Cake-LP': (value) => fromWei(value) * prices.cakeLP
            });
        }),
    ]);

    return data;
}

fetchGraphData().then(result => {
    const ctx = {
        pancake: document.getElementById("pancakeChart"),
        staking: document.getElementById("stakingChart"),
        stakingUSD: document.getElementById("stakingUSDChart"),
        farming: document.getElementById("farmingChart"),
        farmingUSD: document.getElementById("farmingUSDChart")
    };

    renderGraph(ctx.pancake, result.pancakeSwapDFX, {
        buyLabel: "Куплено",
        sellLabel: "Продано",
        valueCallback: (value, index, values) => {
            return `${formatNumber(value, 2)} DFX`;
        },
        tooltipCallback: (tooltipItem, chart) => {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return `${datasetLabel}: ${formatNumber(tooltipItem.yLabel, 2)} DFX`;
        }
    });
    document.querySelector("#content > div > div:nth-child(5) > div.card-body > h6").remove();

    renderGraph(ctx.staking, result.staking, {
        buyLabel: "Введено",
        sellLabel: "Выведено",
        valueCallback: (value, index, values) => {
            return `${formatNumber(value, 2)} DFX`;
        },
        tooltipCallback: (tooltipItem, chart) => {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return `${datasetLabel}: ${formatNumber(tooltipItem.yLabel, 2)} DFX`;
        }
    });
    document.querySelector("#content > div > div:nth-child(6) > div.card-body > h6").remove();

    renderGraph(ctx.stakingUSD, result.stakingUSD, {
        buyLabel: "Введено",
        sellLabel: "Выведено",
        valueCallback: (value, index, values) => {
            return formatToUSD(value);
        },
        tooltipCallback: (tooltipItem, chart) => {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + formatToUSD(tooltipItem.yLabel);
        }
    });
    document.querySelector("#content > div > div:nth-child(7) > div.card-body > h6").remove();

    renderGraph(ctx.farming, result.farming, {
        buyLabel: "Введено",
        sellLabel: "Выведено",
        valueCallback: (value, index, values) => {
            return `${formatNumber(value, 2)} LP`;
        },
        tooltipCallback: (tooltipItem, chart) => {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return `${datasetLabel}: ${formatNumber(tooltipItem.yLabel, 2)} LP`;
        }
    });
    document.querySelector("#content > div > div:nth-child(8) > div.card-body > h6").remove();

    renderGraph(ctx.farmingUSD, result.farmingUSD, {
        buyLabel: "Введено",
        sellLabel: "Выведено",
        valueCallback: (value, index, values) => {
            return formatToUSD(value);
        },
        tooltipCallback: (tooltipItem, chart) => {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + formatToUSD(tooltipItem.yLabel);
        }
    });
    document.querySelector("#content > div > div:nth-child(9) > div.card-body > h6").remove();
});

fetchPieData().then(result => {
    const ctx = document.getElementById("myPieChart");
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["DFX Staked", "PancakeSwap", "DFX Reservoir", "DFX Farming"],
            datasets: [{
                data: [result.staked, result.pancakeSwap, result.reservoir, result.farming],
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#f6a23e'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
            },
            legend: {
                display: false
            },
            cutoutPercentage: 80,
        },
    });
});