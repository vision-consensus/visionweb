const chai = require('chai');
const assert = chai.assert;

const assertThrow = require('../helpers/assertThrow');
const visionWebBuilder = require('../helpers/visionWebBuilder');
const wait = require('../helpers/wait');
const { PRIVATE_KEY,
    CONSUME_USER_RESOURCE_PERCENT,
    DEPOSIT_FEE,
    WITHDRAW_FEE,
    MAPPING_FEE,
    FEE_LIMIT,
    TOKEN_ID,
    CONTRACT_ADDRESS20,
    CONTRACT_ADDRESS721,
    ADDRESS20_MAPPING,
    ADDRESS721_MAPPING,
    HASH20,
    HASH721,
    RETRY_MAPPING_FEE,
    RETRY_DEPOSIT_FEE,
    RETRY_WITHDRAW_FEE,
    VRC721_ID,
    NONCE,
    SIDE_CHAIN } = require('../helpers/config');

describe("VisionWeb.sidechain", function () {
    describe('#deposit', function () {
        describe('#depositVs()', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('deposit vs from main chain to side chain', async function () {
                const callValue = 10000000;
                const txID = await visionWeb.sidechain.depositVs(callValue, DEPOSIT_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
            });

            it('depositVs with the defined private key', async function () {
                const callValue = 10000000;
                const options = {};
                const txID = await visionWeb.sidechain.depositVs(callValue, DEPOSIT_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('depositVs with permissionId in options object', async function () {
                const callValue = 10000000;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVs(callValue, DEPOSIT_FEE, FEE_LIMIT, options);
                assert.equal(txID.length, 64);
            });

            it('depositVs with permissionId in options object and the defined private key', async function () {
                const callValue = 10000000;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVs(callValue, DEPOSIT_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('should throw if an invalid vs number is passed', async function () {
                await assertThrow(
                    visionWeb.sidechain.depositVs(1000.01, DEPOSIT_FEE, FEE_LIMIT),
                    'Invalid callValue provided'
                );
            });

            it('should throw if an invalid fee limit is passed', async function () {
                await assertThrow(
                    visionWeb.sidechain.depositVs(10000, DEPOSIT_FEE, 0),
                    'Invalid feeLimit provided'
                );
            });

            it('should check the balance of mainchain and sidechain after depositVs', async function() {
                const callValue = 10000000;
                const dataBefore = await visionWeb.sidechain.sidechain.vs.getAccount();
                const balanceBefore = dataBefore.balance;
                const txID = await visionWeb.sidechain.depositVs(callValue, DEPOSIT_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
                await wait(90);
                const dataAfter = await visionWeb.sidechain.sidechain.vs.getAccount();
                const balanceAfter = dataAfter.balance;
                assert.equal(balanceBefore + callValue, balanceAfter);
            });
        });

        describe('#depositVrc10()', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('deposit vrc10 from main chain to side chain', async function () {
                const tokenValue = 10;
                const txID = await visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
            });

            it('depositVrc10 with the defined private key', async function () {
                const tokenValue = 10;
                const options = {};
                const txID = await visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('depositVrc10 with permissionId in options object', async function () {
                const tokenValue = 10;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT, options);
                assert.equal(txID.length, 64);
            });

            it('depositVrc10 with permissionId in options object and the defined private key', async function () {
                const tokenValue = 10;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('should throw if an invalid token id is passed', async function () {
                const tokenId = -10;
                await assertThrow(
                    visionWeb.sidechain.depositVrc10(tokenId, 100, DEPOSIT_FEE, FEE_LIMIT),
                    'Invalid tokenId provided'
                )
            });

            it('should throw if an invalid token value is passed', async function () {
                const tokenValue = 100.01;
                await assertThrow(
                    visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, 1000000),
                    'Invalid tokenValue provided'
                );
            });

            it('should throw if an invalid fee limit is passed', async function () {
                const feeLimit = 10000000000
                await assertThrow(
                    visionWeb.sidechain.depositVrc10(TOKEN_ID, 100, DEPOSIT_FEE, feeLimit),
                    'Invalid feeLimit provided'
                );
            });

            it('should check the VRC10 balance of mainchain and sidechain after depositVrc10', async function() {
                const tokenValue = 10;
                const dataBefore = await visionWeb.sidechain.sidechain.vs.getAccount();
                const balanceBefore = dataBefore.assetV2.filter((item)=> item.key == TOKEN_ID)[0].value;
                const txID = await visionWeb.sidechain.depositVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
                await wait(80);
                const dataAfter = await visionWeb.sidechain.sidechain.vs.getAccount();
                const balanceAfter = dataAfter.assetV2.filter((item)=> item.key == TOKEN_ID)[0].value;;
                assert.equal(balanceBefore + tokenValue, balanceAfter);
            });
        });

        describe('#depositVrc20', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('deposit vrc20 from main chain to side chain', async function () {
                const num = 100;
                const txID = await visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20);
                assert.equal(txID.length, 64);
            });

            it('depositVrc20 with the defined private key', async function () {
                const num = 100;
                const options = {};
                const txID = await visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('depositVrc20 with permissionId in options object', async function () {
                const num = 100;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20, options);
                assert.equal(txID.length, 64);
            });

            it('depositVrc20 with permissionId in options object and the defined private key', async function () {
                const num = 100;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('should throw if an invalid num is passed', async function () {
                const num = 100.01;
                await assertThrow(
                    visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20),
                    'Invalid num provided'
                );
            });

            it('should throw if an invalid fee limit is passed', async function () {
                const num = 100;
                const feeLimit = 100000000000;
                await assertThrow(
                    visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, feeLimit, CONTRACT_ADDRESS20),
                    'Invalid feeLimit provided'
                );
            });

            it('should throw if an invalid contract address is passed', async function () {
                await assertThrow(
                    visionWeb.sidechain.depositVrc20(100, DEPOSIT_FEE, FEE_LIMIT, 'aaaaaaaaaa'),
                    'Invalid contractAddress address provided'
                );
            });

            it('should check the vrc20 balance after depositVrc20', async function () {
                const num = 100;
                const options = {};
                // only mapping once
                // can check the mapping contract address in sidechain via call mainToSideContractMap(address) of mainchain gateway
                // const mappingResult = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT,  options);
                // check the vrc20 balance of mainchain before deposit
                const contractInstance = await visionWeb.contract().at(CONTRACT_ADDRESS20);
                const address = visionWeb.address.fromPrivateKey(PRIVATE_KEY);
                const dataBefore = await contractInstance.balanceOf(address).call();
                const balanceBefore = parseInt(dataBefore._hex, 16);

                // approve vrc20
                // const approveResult = await visionWeb.sidechain.approveVrc20(100000, FEE_LIMIT, CONTRACT_ADDRESS20);

                const txID = await visionWeb.sidechain.depositVrc20(num, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS20);
                await wait(80);
                const dataAfter = await contractInstance.balanceOf(address).call();
                const balanceAfter = parseInt(dataAfter._hex, 16);

                assert.equal(balanceBefore + num, balanceAfter);
            });

        });

        describe('#depositVrc721', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('deposit vrc721 from main chain to side chain', async function () {
                const txID = await visionWeb.sidechain.depositVrc721(VRC721_ID, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS721);
                assert.equal(txID.length, 64);
            });

            it('should check the vrc20 balance after depositVrc721', async function () {
                const num = 100;
                const options = {};
                // only mapping once
                // can check the mapping contract address in sidechain via call mainToSideContractMap(address) of mainchain gateway
                // const mappingResult = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT,  options);
                // check the vrc20 balance of mainchain before deposit
                const contractInstance = await visionWeb.contract().at(CONTRACT_ADDRESS20);
                const address = visionWeb.address.fromPrivateKey(PRIVATE_KEY);
                const dataBefore = await contractInstance.balanceOf(address).call();
                const balanceBefore = parseInt(dataBefore._hex, 16);

                // approve vrc20
                // const approveResult = await visionWeb.sidechain.approveVrc20(100000, FEE_LIMIT, CONTRACT_ADDRESS20);

                const txID = await visionWeb.sidechain.depositVrc721(VRC721_ID, DEPOSIT_FEE, FEE_LIMIT, CONTRACT_ADDRESS721);
                await wait(80);
                const dataAfter = await contractInstance.balanceOf(address).call();
                const balanceAfter = parseInt(dataAfter._hex, 16);

                assert.equal(balanceBefore + num, balanceAfter);
            });
        });
    });

    describe('#mappingVrc', function () {
        const visionWeb = visionWebBuilder.createInstanceSide();
        it('mappingVrc20', async function () {
            const txID = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });

        it('mappingVrc20 with the defined private key', async function () {
            const options = {};
            const txID = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT, options, PRIVATE_KEY);
            assert.equal(txID.length, 64);
        });

        it('mappingVrc20 with permissionId in options object', async function () {
            const options = { permissionId: 0 };
            const txID = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT, options);
            assert.equal(txID.length, 64);
        });

        it('mappingVrc20 with permissionId in options object and the defined private key', async function () {
            const options = { permissionId: 0 };
            const txID = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT, options, PRIVATE_KEY);
            assert.equal(txID.length, 64);
        });

        it('should throw if an invalid vsHash', async function () {
            const vsHash = '';
            await assertThrow(
                visionWeb.sidechain.mappingVrc20(vsHash, MAPPING_FEE, FEE_LIMIT),
                'Invalid vsHash provided'
            );
        });

        it('should throw if an invalid fee limit is passed', async function () {
            const feeLimit = 100000000000;
            await assertThrow(
                visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, feeLimit),
                'Invalid feeLimit provided'
            );
        });

        it('check the transaction result after mapping VRC20', async function () {
            const mappingResult = await visionWeb.sidechain.mappingVrc20(HASH20, MAPPING_FEE, FEE_LIMIT);
            while(true) {
                let checkResult = await visionWeb.vs.getTransactionInfo(mappingResult);
                if (checkResult && checkResult.result) {
                    break;
                }
            }
        });

        it('should get the mapping address after mappingVrc20', async function() {
            const sideGatawayInstance = await visionWeb.sidechain.sidechain.contract().at(SIDE_CHAIN.sideOptions.sideGatewayAddress);
            const result = await sideGatawayInstance.mainToSideContractMap(CONTRACT_ADDRESS20).call();
            assert.isTrue(visionWeb.isAddress(result));
        });

        it('mappingVrc721', async function () {
            const txID = await visionWeb.sidechain.mappingVrc721(HASH721, MAPPING_FEE, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });

        it('check the transaction result after mapping VRC721', async function () {
            const mappingResult = await visionWeb.sidechain.mappingVrc721(HASH721, MAPPING_FEE, FEE_LIMIT);
            while(true) {
                let checkResult = await visionWeb.vs.getTransactionInfo(mappingResult);
                if (checkResult && checkResult.result) {
                    break;
                }
            }
        });

        it('should get the mapping address after mappingVrc721', async function() {
            const sideGatawayInstance = await visionWeb.sidechain.sidechain.contract().at(SIDE_CHAIN.sideOptions.sideGatewayAddress);
            const result = await sideGatawayInstance.mainToSideContractMap(CONTRACT_ADDRESS721).call();
            assert.isTrue(visionWeb.isAddress(result));
        });
    });

    describe('#withdraw', function () {
        describe('#withdrawVs()', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('withdraw vs from side chain to main chain', async function () {
                const txID = await visionWeb.sidechain.withdrawVs(10000000, WITHDRAW_FEE, 10000000);
                assert.equal(txID.length, 64);
            });

            it('withdrawVs with the defined private key', async function () {
                const callValue = 10000000;
                const options = {};
                const txID = await visionWeb.sidechain.withdrawVs(callValue, WITHDRAW_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('withdrawVs with permissionId in options object', async function () {
                const callValue = 10000000;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.withdrawVs(callValue, WITHDRAW_FEE, FEE_LIMIT, options);
                assert.equal(txID.length, 64);
            });

            it('withdrawVs with permissionId in options object and the defined private key', async function () {
                const callValue = 10000000;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.withdrawVs(callValue, WITHDRAW_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('should throw if an invalid vs number is passed', async function () {
                await assertThrow(
                    visionWeb.sidechain.withdrawVs(1000.01, WITHDRAW_FEE, FEE_LIMIT),
                    'Invalid callValue provided'
                );
            });

            it('should throw if an invalid fee limit is passed', async function () {
                await assertThrow(
                    visionWeb.sidechain.withdrawVs(10000, WITHDRAW_FEE, 0),
                    'Invalid feeLimit provided'
                );
            });

            it('should check the balance of mainchain and sidechain after withdrawVs', async function() {
                const callValue = 10000000;
                const dataBefore = await visionWeb.vs.getAccount();
                const balanceBefore = dataBefore.balance;
                const txID = await visionWeb.sidechain.withdrawVs(callValue, WITHDRAW_FEE, FEE_LIMIT);
                await wait(90);
                const dataAfter = await visionWeb.vs.getAccount();
                const balanceAfter = dataAfter.balance;
                assert.equal(balanceBefore + callValue, balanceAfter);
            });
        });

        describe('#withdrawVrc10()', function () {
            const visionWeb = visionWebBuilder.createInstanceSide();
            it('withdraw vrc10 from side chain to main chain', async function () {
                const tokenValue = 10;
                const txID = await visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, WITHDRAW_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
            });

            it('withdrawVrc10 with the defined private key', async function () {
                const tokenValue = 10;
                const options = {};
                const txID = await visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, WITHDRAW_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('withdrawVrc10 with permissionId in options object', async function () {
                const tokenValue = 10;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, WITHDRAW_FEE, FEE_LIMIT, options);
                assert.equal(txID.length, 64);
            });

            it('withdrawVrc10 with permissionId in options object and the defined private key', async function () {
                const tokenValue = 10;
                const options = { permissionId: 0 };
                const txID = await visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, WITHDRAW_FEE, FEE_LIMIT, options, PRIVATE_KEY);
                assert.equal(txID.length, 64);
            });

            it('should throw if an invalid token id is passed', async function () {
                const tokenId = -10;
                await assertThrow(
                    visionWeb.sidechain.withdrawVrc10(tokenId, 100, WITHDRAW_FEE, 1000000),
                    'Invalid tokenId provided'
                )
            });

            it('should throw if an invalid token value is passed', async function () {
                const tokenValue = 10.01;
                await assertThrow(
                    visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, WITHDRAW_FEE, FEE_LIMIT),
                    'Invalid tokenValue provided'
                );
            });

            it('should throw if an invalid fee limit is passed', async function () {
                const feeLimit = 100000000000;
                await assertThrow(
                    visionWeb.sidechain.withdrawVrc10(TOKEN_ID, 100, WITHDRAW_FEE, feeLimit),
                    'Invalid feeLimit provided'
                );
            });

            it('should check the VRC10 balance of mainchain and sidechain after withdrawVrc10', async function() {
                const tokenValue = 10;
                const dataBefore = await visionWeb.vs.getAccount();
                const balanceBefore = dataBefore.assetV2.filter((item)=> item.key == TOKEN_ID)[0].value;
                const txID = await visionWeb.sidechain.withdrawVrc10(TOKEN_ID, tokenValue, DEPOSIT_FEE, FEE_LIMIT);
                assert.equal(txID.length, 64);
                await wait(90);
                const dataAfter = await visionWeb.vs.getAccount();
                const balanceAfter = dataAfter.assetV2.filter((item)=> item.key == TOKEN_ID)[0].value;;
                assert.equal(balanceBefore + tokenValue, balanceAfter);
            });
        });

        describe('#withdrawVrc', function () {
            describe('#withdrawVrc20', function () {
                const visionWeb = visionWebBuilder.createInstanceSide();
                it('withdraw vrc20 from side chain to main chain', async function () {
                    const num = 10;
                    const txID = await visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING);
                    assert.equal(txID.length, 64);
                });

                it('withdrawVrc20 with the defined private key', async function () {
                    const num = 10;
                    const options = {};
                    const txID = await visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING, options, PRIVATE_KEY);
                    assert.equal(txID.length, 64);
                });

                it('withdrawVrc20 with permissionId in options object', async function () {
                    const num = 10;
                    const options = { permissionId: 0 };
                    const txID = await visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING, options);
                    assert.equal(txID.length, 64);
                });

                it('withdrawVrc20 with permissionId in options object and the defined private key', async function () {
                    const num = 10;
                    const options = { permissionId: 0 };
                    const txID = await visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING, options, PRIVATE_KEY);
                    assert.equal(txID.length, 64);
                });

                it('should throw if an invalid num is passed', async function () {
                    const num = 10.01;
                    await assertThrow(
                        visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING),
                        'Invalid numOrId provided'
                    );
                });

                it('should throw if an invalid fee limit is passed', async function () {
                    const feeLimit = 100000000000;
                    await assertThrow(
                        visionWeb.sidechain.withdrawVrc20(100, WITHDRAW_FEE, feeLimit, ADDRESS20_MAPPING),
                        'Invalid feeLimit provided'
                    );
                });

                it('should throw if an invalid contract address is passed', async function () {
                    await assertThrow(
                        visionWeb.sidechain.withdrawVrc20(100, WITHDRAW_FEE, FEE_LIMIT, 'aaaaaaaaaa'),
                        'Invalid contractAddress address provided'
                    );
                });

                it('should check the vrc20 balance after withdrawVrc20', async function () {
                    const num = 10;
                    const contractInstance = await visionWeb.contract().at(CONTRACT_ADDRESS20);
                    const address = visionWeb.address.fromPrivateKey(PRIVATE_KEY);
                    const dataBefore = await contractInstance.balanceOf(address).call();
                    const balanceBefore = parseInt(dataBefore._hex, 16);
                    const txID = await visionWeb.sidechain.withdrawVrc20(num, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING);

                    await wait(80);

                    const dataAfter = await contractInstance.balanceOf(address).call();
                    const balanceAfter = parseInt(dataAfter._hex, 16);

                    assert.equal(balanceBefore + num, balanceAfter);
                });
            });

            describe('#withdrawVrc721', async function () {
                const visionWeb = visionWebBuilder.createInstanceSide();
                it('withdraw vrc721 from side chain to main chain', async function () {
                    const txID = await visionWeb.sidechain.withdrawVrc721(VRC721_ID, WITHDRAW_FEE, FEE_LIMIT, ADDRESS20_MAPPING);
                    assert.equal(txID.length, 64);
                });
            });
        });
    });

    describe('#injectFund', function() {
        it('excute injectFund', async function() {
            const visionWeb = visionWebBuilder.createInstanceSide();
            const txID = await visionWeb.sidechain.injectFund(1000000, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });
    });


    describe('#retry', function() {
        it('retry mapping', async function() {
            const visionWeb = visionWebBuilder.createInstanceSide();
            const txID = await visionWeb.sidechain.retryMapping(NONCE, RETRY_MAPPING_FEE, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });

        it('retry deposit', async function() {
            const visionWeb = visionWebBuilder.createInstanceSide();
            const txID = await visionWeb.sidechain.retryDeposit(NONCE, RETRY_DEPOSIT_FEE, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });

        it('retry withdraw', async function() {
            const visionWeb = visionWebBuilder.createInstanceSide();
            const txID = await visionWeb.sidechain.retryWithdraw(NONCE, RETRY_WITHDRAW_FEE, FEE_LIMIT);
            assert.equal(txID.length, 64);
        });
    });

})
