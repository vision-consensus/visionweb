const chai = require('chai');
const visionWebBuilder = require('../helpers/visionWebBuilder');
const VisionWeb = visionWebBuilder.VisionWeb;
const BigNumber = require('bignumber.js');

const assert = chai.assert;

describe('VisionWeb.utils', function () {

    describe("#isValidURL()", function () {

        it('should verify good urls', function () {

            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isValidURL('https://some.example.com:9090/casa?qe=3'))
            assert.isTrue(visionWeb.utils.isValidURL('www.example.com/welcome'))

            assert.isFalse(visionWeb.utils.isValidURL('http:/some.example.com'))

            assert.isFalse(visionWeb.utils.isValidURL(['http://example.com']))

        })

    });

    describe("#isArray()", function () {

        it('should verify that a value is an array', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isArray([]));
            assert.isTrue(visionWeb.utils.isArray([[2], {a: 3}]));

            assert.isFalse(visionWeb.utils.isArray({}));
            assert.isFalse(visionWeb.utils.isArray("Array"));

        })

    });


    describe("#isJson()", function () {

        it('should verify that a value is a JSON string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isJson('[]'));
            assert.isTrue(visionWeb.utils.isJson('{"key":"value"}'));
            assert.isTrue(visionWeb.utils.isJson('"json"'));

            assert.isFalse(visionWeb.utils.isJson({}));
            assert.isFalse(visionWeb.utils.isJson("json"));

        })

    });

    describe("#isBoolean()", function () {

        it('should verify that a value is a JSON string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isBoolean(true));
            assert.isTrue(visionWeb.utils.isBoolean('a' == []));

            assert.isFalse(visionWeb.utils.isBoolean({}));
            assert.isFalse(visionWeb.utils.isBoolean("json"));

        })

    });

    describe("#isBigNumber()", function () {

        it('should verify that a value is a JSON string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            const bigNumber = BigNumber('1234565432123456778765434456777')

            assert.isTrue(visionWeb.utils.isBigNumber(bigNumber));

            assert.isFalse(visionWeb.utils.isBigNumber('0x09e80f665949b63b39f3850127eb29b55267306b69e2104c41c882e076524a1c'));
            assert.isFalse(visionWeb.utils.isBigNumber({}));
            assert.isFalse(visionWeb.utils.isBigNumber("json"));

        })

    });


    describe("#isString()", function () {

        it('should verify that a valyue is a string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isString('str'));
            assert.isTrue(visionWeb.utils.isString(13..toString()));

            assert.isFalse(visionWeb.utils.isString(2));

        })

    });

    describe("#isFunction()", function () {

        it('should verify that a value is a function', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isFunction(new Function()));
            assert.isTrue(visionWeb.utils.isFunction(() => {
            }));
            assert.isTrue(visionWeb.utils.isFunction(visionWeb.utils.isFunction));

            assert.isFalse(visionWeb.utils.isFunction({function: new Function}));

        })

    });

    describe('#isHex()', function () {
        it('should verify that a string is an hex string', function () {

            const visionWeb = visionWebBuilder.createInstance();

            let input = '0x1';
            let expected = true;
            assert.equal(visionWeb.utils.isHex(input), expected);

            input = '0x0';
            expected = true;
            assert.equal(visionWeb.utils.isHex(input), expected);

            input = '0x73616c616d6f6e';
            expected = true;
            assert.equal(visionWeb.utils.isHex(input), expected);

            input = '73616c616d6f';
            expected = true;
            assert.equal(visionWeb.utils.isHex(input), expected);

            input = '0x73616c616d6fsz';
            expected = false;
            assert.equal(visionWeb.utils.isHex(input), expected);

            input = 'x898989';
            expected = false;
            assert.equal(visionWeb.utils.isHex(input), expected);

        });

    });

    describe("#isInteger()", function () {

        it('should verify that a value is an integer', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.isInteger(2345434));
            assert.isTrue(visionWeb.utils.isInteger(-234e4));

            assert.isFalse(visionWeb.utils.isInteger(3.4));
            assert.isFalse(visionWeb.utils.isInteger('integer'));

        })

    });

    describe("#hasProperty()", function () {

        it('should verify that an object has a specific property', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.hasProperty({p: 2}, 'p'));
            assert.isFalse(visionWeb.utils.hasProperty([{p: 2}], 'p'));

            assert.isFalse(visionWeb.utils.hasProperty({a: 2}, 'p'));

        })

    });

    describe("#hasProperties()", function () {

        it('should verify that an object has some specific properties', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.isTrue(visionWeb.utils.hasProperties({p: 2, s: 2}, 'p', 's'));

            assert.isFalse(visionWeb.utils.hasProperties({p: 2, s: 2}, 'p', 'q'));

        })

    });


    describe("#mapEvent()", function () {

        it('should map an event result', function () {
            const visionWeb = visionWebBuilder.createInstance();

            const event = {
                block_number: 'blockNumber',
                block_timestamp: 'blockTimestamp',
                contract_address: 'contractAddress',
                event_name: 'eventName',
                transaction_id: 'transactionId',
                result: 'result',
                resource_Node: 'resourceNode'
            }

            const expected = {
                block: 'blockNumber',
                timestamp: 'blockTimestamp',
                contract: 'contractAddress',
                name: 'eventName',
                transaction: 'transactionId',
                result: 'result',
                resourceNode: 'resourceNode'
            }

            const mapped = visionWeb.utils.mapEvent(event)
            for(let key in mapped) {
                assert.equal(mapped[key], expected[key])
            }

        })

    });

    describe('#parseEvent', function () {
        // TODO
    });

    describe("#padLeft()", function () {

        it('should return the pad left of a string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            assert.equal(visionWeb.utils.padLeft('09e80f', '0', 12), '00000009e80f');
            // assert.equal(visionWeb.utils.padLeft(new Function, '0', 32), '0000000function anonymous() {\n\n}');
            assert.equal(visionWeb.utils.padLeft(3.4e3, '0', 12), '000000003400');

        })

    });

    describe("#ethersUtils()", function () {

        it('should import sha256 from ethers and has a string', function () {
            const visionWeb = visionWebBuilder.createInstance();

            const string = '0x' + Buffer.from('some string').toString('hex');
            const hash = visionWeb.utils.ethersUtils.sha256(string);

            assert.equal(hash, '0x61d034473102d7dac305902770471fd50f4c5b26f6831a56dd90b5184b3c30fc');

        })

    });

});
