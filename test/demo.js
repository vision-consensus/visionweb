const VisionWeb = require('../dist/VisionWeb.node.js');

const HttpProvider = VisionWeb.providers.HttpProvider;

const rpc = 'https://vtest.infragrid.v.network'
const FullNode = new HttpProvider(rpc);
const SolidityNode = new HttpProvider(rpc);
const EventServer = new HttpProvider(rpc);
const PrivateKey = "";
const visionWeb = new VisionWeb(rpc, rpc, rpc, PrivateKey);


async function main() {
    // const balance = await visionWeb.vs.getBalance('VLamiuQzTcXrJnRM5R1qfZhTbPUdghKR8g');
    const balance = await visionWeb.vs.getAccountResources('VLamiuQzTcXrJnRM5R1qfZhTbPUdghKR8g');
    // let unSignTransaction = await visionWeb.transactionBuilder.freezeBalance(
    //     visionWeb.toVdt(1),
    //     35,
    //     'PHOTON',
    //     visionWeb.defaultAddress.hex,
    //     [
    //         {stage: 1, frozen_balance: 1}
    //     ]
    // ).catch(e => {
    //     console.log(e)
    // })
    
    // const signedTransaction = await visionWeb.vs.sign(unSignTransaction, visionWeb.defaultPrivateKey)
    // .catch(e => {
    //     return false;
    // });
    
    // const broadcast = await visionWeb.vs.sendRawTransaction(signedTransaction);

    // console.log(broadcast)
}

main();