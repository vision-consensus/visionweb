const visionWebBuilder = require('./visionWebBuilder');
const visionWeb = visionWebBuilder.createInstance();

const amount = process.argv[2] || 10;

(async function () {
    await visionWebBuilder.newTestAccounts(amount)
})()

