
const injectPromise = require('injectpromise')

class BlockLib {

    constructor(visionWeb = false) {
        if (!visionWeb)
            throw new Error('Expected instances of VisionWeb and utils');
        this.visionWeb = visionWeb;
        this.injectPromise = injectPromise(this);
    }

    async getCurrent(callback = false) {

        if (!callback)
            return this.injectPromise(this.getCurrent);

        this.visionWeb.fullNode.request('wallet/getnowblock').then(block => {
            block.fromPlugin = true
            callback(null, block);
        }).catch(err => callback(err));
    }

    pluginInterface() {
        return {
            requires: '^3.0.0',
            fullClass: true
        }
    }
}

module.exports = BlockLib
