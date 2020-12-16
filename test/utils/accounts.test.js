const chai = require('chai');
const {ADDRESS_HEX, ADDRESS_BASE58} = require('../helpers/config');
const visionWebBuilder = require('../helpers/visionWebBuilder');

const assert = chai.assert;

describe('VisionWeb.utils.accounts', function () {

    describe('#generateAccount()', function () {

        it("should generate a new account", async function () {
            const visionWeb = visionWebBuilder.createInstance();

            const newAccount = await visionWeb.utils.accounts.generateAccount();
            assert.equal(newAccount.privateKey.length, 64);
            assert.equal(newAccount.publicKey.length, 130);
            let address = visionWeb.address.fromPrivateKey(newAccount.privateKey);
            assert.equal(address, newAccount.address.base58);

            assert.equal(visionWeb.address.toHex(address), newAccount.address.hex.toLowerCase());
        });
    });
});
