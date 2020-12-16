const chai = require('chai');
const assert = chai.assert;
const wait = require('../../helpers/wait');
const assertThrow = require('../../helpers/assertThrow');
const broadcaster = require('../../helpers/broadcaster');
const _ = require('lodash');
const visionWebBuilder = require('../../helpers/visionWebBuilder');
const VisionWeb = visionWebBuilder.VisionWeb;

const testRevertContract = require('../../fixtures/contracts').testRevert;
const testSetValContract = require('../../fixtures/contracts').testSetVal;

describe('#contract.method', function () {

    let accounts;
    let visionWeb;
    let emptyAccount;

    before(async function () {
        visionWeb = visionWebBuilder.createInstance();
        // ALERT this works only with Vision Quickstart:
        accounts = await visionWebBuilder.getTestAccounts(-1);
        emptyAccount = await VisionWeb.createAccount();
    });

    describe('#send()', function () {

        let testRevert
        let testSetVal

        before(async function () {
            const tx = await broadcaster(visionWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            }, accounts.b58[0]), accounts.pks[0])
            testRevert = await visionWeb.contract().at(tx.transaction.contract_address)

            const tx2 = await broadcaster(visionWeb.transactionBuilder.createSmartContract({
                abi: testSetValContract.abi,
                bytecode: testSetValContract.bytecode
            }, accounts.b58[0]), accounts.pks[0])
            testSetVal = await visionWeb.contract().at(tx2.transaction.contract_address)
        })

        it("should set accounts[2] as the owner and check it with getOwner(1)", async function () {
            await testRevert.setOwner(accounts.b58[2]).send()
            assert.equal(await testRevert.getOwner(1).call(), accounts.hex[2])
        })

        it("should revert if trying to set TSeFTBYCy3r2kZNYsj86G6Yz6rsmPdYdFs as the owner", async function () {
            this.timeout(30000)
            await assertThrow(testRevert.setOwner('TSeFTBYCy3r2kZNYsj86G6Yz6rsmPdYdFs').send({shouldPollResponse: true}),
                null,
                'REVERT'
            )
        });

        it("should set the val to 123", async function () {
            this.timeout(30000)
            let result = await testSetVal.set(123).send({
                shouldPollResponse: true,
                keepTxID: true
            })
            assert.equal(result[0].length, 64)
            assert.equal(result[1].toNumber(), 123)
        });

    });

    describe('#call()', function () {

        let testRevert

        before(async function () {
            const tx = await broadcaster(visionWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            }, accounts.b58[0]), accounts.pks[0])
            testRevert = await visionWeb.contract().at(tx.transaction.contract_address)
            await testRevert.setOwner(accounts.b58[2]).send()
        })

        it("should getOwner(1) and get accounts[2]", async function () {
            assert.equal(await testRevert.getOwner(1).call(), accounts.hex[2])
        })

        it("should revert if call getOwner(2)", async function () {
            await assertThrow(testRevert.getOwner(2).call()
            )
        })

        it("should revert if call getOwner2()", async function () {
            await assertThrow(testRevert.getOwner2(2).call()
            )
        })

    });

});
