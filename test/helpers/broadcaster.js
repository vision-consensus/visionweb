const visionWebBuilder = require('../helpers/visionWebBuilder');

module.exports = async function (func, pk, transaction) {
    const visionWeb = visionWebBuilder.createInstance();
    if( !transaction) {
        transaction = await func;
    }
    const signedTransaction = await visionWeb.vs.sign(transaction, pk);
    const result = {
        transaction,
        signedTransaction,
        receipt: await visionWeb.vs.sendRawTransaction(signedTransaction)
    };
    return Promise.resolve(result);
}
