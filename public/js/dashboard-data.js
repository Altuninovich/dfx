const weiValue = 10 ** 18;
const pancakeContract = '0xe7ff9aceb3767b4514d403d1486b5d7f1b787989';
const farmingContract = '0x9d943fd36add58c42568ea1459411b291ff7035f';
const stakingContract = '0x11340dc94e32310fa07cf9ae4cd8924c3cd483fe';

const totalSupplyEl = document.getElementById('total-supply');
const dfxPerDay = document.getElementById('dfx-per-day');
const farmingPerDay = document.getElementById('farming-per-day');
const stakingPerDay = document.getElementById('staking-per-day');

function formatToUsd(number) {
    return (number).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

function formatNumber(number, fixed = 1) {
    const formatter = new Intl.NumberFormat('en');
    return formatter.format(number.toFixed(fixed));
}

function exactSymbol(number) {
    return number > 0 ? `+${number}` : number;
}

function relDiff(a, b) {
    if (a < b) {
        return 100 * Math.abs((b - a) / a);
    } else {
        return -100 * Math.abs((a - b) / a);
    }
}

async function fetchData() {
    fetch('/api/totalsupply').then(async (response) => {
        if (response.ok) {
            const json = await response.json();
            totalSupplyEl.innerText = formatNumber(json.result.dfx);
        };
    });

    fetch(`/api/tx/bep/${pancakeContract}?limit=10000`).then(async (response) => {
        if (response.ok) {
            const json = (await response.json()).result;
            const currentTimeStamp = new Date().getTime() / 1000;

            let totalThisDay = 0;
            let totalDayBefore = 0;

            let index;

            for (index = 0; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24) {
                    break;
                }

                let isIn = obj.to == pancakeContract;
                const value = obj.value / weiValue;
                if (isIn) {
                    totalThisDay += value;
                } else {
                    totalThisDay -= value;
                }
            }

            for (; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24 * 2) {
                    break;
                }

                let isIn = obj.to == pancakeContract;
                const value = obj.value / weiValue;

                if (isIn) {
                    totalDayBefore += value;
                } else {
                    totalDayBefore -= value;
                }
            }

            const diffInPercent = relDiff(totalDayBefore, totalThisDay);
            const span = `<sup style="color: ${diffInPercent > 0 ? "green" : "red"}">${exactSymbol(diffInPercent.toFixed(1))}%</sup>`;

            dfxPerDay.innerHTML = `${formatNumber(totalThisDay)}${span}`;
        }
    });

    fetch(`/api/tx/bep/${farmingContract}?limit=10000`).then(async (response) => {
        if (response.ok) {
            const json = (await response.json()).result;
            const currentTimeStamp = new Date().getTime() / 1000;

            let totalThisDay = 0;
            let totalDayBefore = 0;

            let index;

            for (index = 0; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24) {
                    break;
                }

                if (obj.tokenSymbol !== 'DFX') {
                    continue;
                }

                let isIn = obj.to == farmingContract;
                const value = obj.value / weiValue;
                if (isIn) {
                    totalThisDay += value;
                } else {
                    totalThisDay -= value;
                }
            }

            for (; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24 * 2) {
                    break;
                }

                if (obj.tokenSymbol !== 'DFX') {
                    continue;
                }

                let isIn = obj.to == farmingContract;
                const value = obj.value / weiValue;

                if (isIn) {
                    totalDayBefore += value;
                } else {
                    totalDayBefore -= value;
                }
            }

            const diffInPercent = relDiff(totalDayBefore, totalThisDay);
            const span = `<sup style="color: ${diffInPercent > 0 ? "green" : "red"}">${exactSymbol(diffInPercent.toFixed(1))}%</sup>`;

            farmingPerDay.innerHTML = `${formatNumber(totalThisDay)}${span}`;
        }
    });

    fetch(`/api/tx/bep/${stakingContract}?limit=10000`).then(async (response) => {
        if (response.ok) {
            const json = (await response.json()).result;
            const currentTimeStamp = new Date().getTime() / 1000;

            let totalThisDay = 0;
            let totalDayBefore = 0;

            let index;

            for (index = 0; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24) {
                    break;
                }

                let isIn = obj.to == stakingContract;
                const value = obj.value / weiValue;
                if (isIn) {
                    totalThisDay += value;
                } else {
                    totalThisDay -= value;
                }
            }

            for (; index < json.length; index++) {
                const obj = json[index];

                if (obj.timeStamp < currentTimeStamp - 60 * 60 * 24 * 2) {
                    break;
                }

                let isIn = obj.to == stakingContract;
                const value = obj.value / weiValue;

                if (isIn) {
                    totalDayBefore += value;
                } else {
                    totalDayBefore -= value;
                }
            }

            const diffInPercent = relDiff(totalDayBefore, totalThisDay);
            const span = `<sup style="color: ${diffInPercent > 0 ? "green" : "red"}">${exactSymbol(diffInPercent.toFixed(1))}%</sup>`;

            stakingPerDay.innerHTML = `${formatNumber(totalThisDay)}${span}`;
        }
    });

    setTimeout(fetchData, 15000);
}

fetchData();