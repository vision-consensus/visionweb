const VisionWeb = require('../dist/VisionWeb.node.js');

const HttpProvider = VisionWeb.providers.HttpProvider;

const rpc = 'https://vpioneer.infragrid.v.network'
const FullNode = new HttpProvider(rpc);
const SolidityNode = new HttpProvider(rpc);
const EventServer = new HttpProvider(rpc);
const PrivateKey = "955385863be83547cad20f7dab7ac66d678940bb3da9170ae2c2ed3ef4181543";
const visionWeb = new VisionWeb(rpc, rpc, rpc, PrivateKey);
const abi = require('./nft.json')

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
    const contract = await visionWeb.contract().at('46e09d46a667b3ce73116ab339583102a919330209')
    console.log('contract', contract)
    contract.loadAbi(abi)
    const params = [
      "0xa7847c796Afe862C751cd4591D9487124621064f",
      "0x42AFae5DE103C4290001888B1E0f89425de81E4c",
      "3000000",
      "0x34EFCf7e3AC0cE9dDef2eFEB93f45040F4dC59aD",
      [
          1
      ],
      [
          1
      ],
      0,
      1669171575,
      1671763575,
      "4707069580610372960050568158893336521108078133620597833568",
      666666,
      1,
      "0xe09D46a667B3ce73116aB339583102a919330209",
      "0x6bcec4ab52894b9d1277d8b5561d5fc2fc22a6924c69a60e51e060f57c07bc7f78af2e48d67f25369ce944c18e45fe39d83c0106ffe6e4d0c17f0a205b8c49bb1c"
  ]
    // const params = [
    //   "VRvyUwbTyPjH6fNFHwrAsn84FUPsmEAqY6",
    //   "VGjpyoQffd8F29iTzkwXXPumrNu2KMS9J9",
    //   "3000000",
    //   "VFV8LuPos133Ui76DXD5PGzsbvAS1sJaYn",
    //   [
    //       1
    //   ],
    //   [
    //       1
    //   ],
    //   0,
    //   1669171575,
    //   1671763575,
    //   "4707069580610372960050568158893336521108078133620597833568",
    //   666666,
    //   1,
    //   "VX8shJG1qpc4j8CGNgWtNf3eGqKdvVwVvF",
    //   "0x6bcec4ab52894b9d1277d8b5561d5fc2fc22a6924c69a60e51e060f57c07bc7f78af2e48d67f25369ce944c18e45fe39d83c0106ffe6e4d0c17f0a205b8c49bb1c"
    // ]
    const a = await contract.methods.cancelBasicOrders(params).send()
      console.log(a)
    // const signedTransaction = await visionWeb.transactionBuilder.triggerSmartContract(a.contract_address,a.function_selector,{feeLimit: a.feeLimit, callValue: a.callValue}, a.parameter, 'VRvyUwbTyPjH6fNFHwrAsn84FUPsmEAqY6')
    // .catch(e => {
    //     console.log(e)
    //     return false;
    // });

    // console.log(signedTransaction)
    
    // const signedTransaction = await visionWeb.vs.sign(unSignTransaction, visionWeb.defaultPrivateKey)
    // .catch(e => {
    //     return false;
    // });
    
    // const broadcast = await visionWeb.vs.sendRawTransaction(signedTransaction);

    // console.log(broadcast)
}

main();