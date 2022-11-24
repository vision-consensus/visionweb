const { maxSatisfying } = require('semver');
const VisionWeb = require('../dist/VisionWeb.node.js');

// console.log(VisionWeb.address.fromEth('0x609395874f03E676603E7A173bCA2eB30012d7cc'))
// console.log(VisionWeb.isEthAddress('VGx21ymGwuW9ybAcjRyJFA1qB8Ep8qpezQ'))
const HttpProvider = VisionWeb.providers.HttpProvider;
  
const FullNode = new HttpProvider("https://vpioneer.infragrid.v.network/");
const SolidityNode = new HttpProvider("https://vpioneer.infragrid.v.network/");
const EventServer = new HttpProvider("https://vpioneer.infragrid.v.network/");
const PrivateKey = "c1b826ab4467e61c1604b6fe37765a12209cc45ec7d05b8b28e6cea3ecc7d9ca";
const visionWeb = new VisionWeb(FullNode, SolidityNode, EventServer, PrivateKey);

visionWeb.vs.sign('0x7b226163636f756e7441646472657373223a225642585875726e613971796763705146694d703174416a6e6f747531484735484878222c22746f6b656e4964223a225659794479354d4471507a53583968584435434541694b3339375a78746b47705a63227d')
    .then(res => {
        console.log(res)
    })

