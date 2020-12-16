const assert = require('chai').assert;
const visionWebBuilder = require('./visionWebBuilder');

module.exports = async function (result, string) {

    assert.equal(
        result,
        visionWebBuilder.getInstance().toHex(string).substring(2)
    )
}
