const Account = require("./modules/account");
const Stats = require("./modules/stats");

function e(bscToken) {
    return {
        account: new Account(bscToken),
        stats: new Stats(bscToken)
    };
};

module.exports = e;