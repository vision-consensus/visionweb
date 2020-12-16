const chai = require("chai");
const { FULL_NODE_API } = require("../helpers/config");
const assertThrow = require("../helpers/assertThrow");
const visionWebBuilder = require("../helpers/visionWebBuilder");
const VisionWeb = visionWebBuilder.VisionWeb;
const GetNowBlock = require("../helpers/GetNowBlock");
const BlockLib = require("../helpers/BlockLib");
const jlog = require("../helpers/jlog");

const assert = chai.assert;

describe("VisionWeb.core.plugin", async function () {
    let visionWeb;

    before(async function () {
        visionWeb = visionWebBuilder.createInstance();
    });

    describe("#constructor()", function () {
        it("should have been set a full instance in visionWeb", function () {
            assert.instanceOf(visionWeb.plugin, VisionWeb.Plugin);
        });
    });

    describe("#plug GetNowBlock into visionWeb.vs", async function () {
        it("should register the plugin GetNowBlock", async function () {
            const someParameter = "someValue";

            let result = visionWeb.plugin.register(GetNowBlock, {
                someParameter,
            });
            assert.isTrue(result.skipped.includes("_parseToken"));
            assert.isTrue(result.plugged.includes("getCurrentBlock"));
            assert.isTrue(result.plugged.includes("getLatestBlock"));

            result = await visionWeb.vs.getCurrentBlock();
            assert.isTrue(result.fromPlugin);
            assert.equal(result.blockID.length, 64);
            assert.isTrue(/^00000/.test(result.blockID));

            result = await visionWeb.vs.getSomeParameter();
            assert.equal(result, someParameter);
        });
    });

    describe("#plug BlockLib into visionWeb at first level", async function () {
        it("should register the plugin and call a method using a promise", async function () {
            let result = visionWeb.plugin.register(BlockLib);
            assert.equal(result.libs[0], "BlockLib");
            result = await visionWeb.blockLib.getCurrent();
            assert.isTrue(result.fromPlugin);
            assert.equal(result.blockID.length, 64);
            assert.isTrue(/^00000/.test(result.blockID));
        });

        it("should register and call a method using callbacks", async function () {
            visionWeb.plugin.register(BlockLib);
            return new Promise((resolve) => {
                visionWeb.blockLib.getCurrent((err, result) => {
                    assert.isTrue(result.fromPlugin);
                    assert.equal(result.blockID.length, 64);
                    assert.isTrue(/^00000/.test(result.blockID));
                    resolve();
                });
            });
        });

        it("should not register if visionWeb is instantiated with the disablePlugins option", async function () {
            let visionWeb2 = visionWebBuilder.createInstance({
                disablePlugins: true,
            });
            let result = visionWeb2.plugin.register(BlockLib);
            assert.isTrue(typeof result.error === "string");
        });
    });
});
