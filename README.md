## What is VisionWeb?

**[VisionWeb Web - Developer Document](https://developers.v.network/reference#visionweb-object)**

VisionWeb aims to deliver a unified, seamless development experience influenced by Ethereum's [Web3](https://github.com/ethereum/web3.js/) implementation. We have taken the core ideas and expanded upon it to unlock the functionality of Vision's unique feature set along with offering new tools for integrating DApps in the browser, Node.js and IoT devices.

## Compatibility

-   Version built for Node.js v6 and above
-   Version built for browsers with more than 0.25% market share

You can access either version specifically from the [dist](dist) folder.

VisionWeb is also compatible with frontend frameworks such as:

-   Angular
-   React
-   Vue.

You can also ship VisionWeb in a Chrome extension.

## Installation

### Node.js

```bash
npm install visionwebx
```

or

```bash
yarn add visionwebx
```

### Browser

First, don't use the release section of this repo, it has not updated in a long time.

Then easiest way to use VisionWeb in a browser is to install it as above and copy the dist file to your working folder. For example:

```
cp node_modules/visionwebx/dist/VisionWeb.js ./js/visionwebx.js
```

so that you can call it in your HTML page as

```
<script src="./js/visionwebx.js"><script>
```

## Creating an Instance

First off, in your javascript file, define VisionWeb:

```js
const VisionWeb = require("visionwebx");
```

When you instantiate VisionWeb you can define

-   fullNode
-   solidityNode
-   eventServer
-   privateKey

you can also set a

-   fullHost

which works as a jolly. If you do so, though, the more precise specification has priority.
Supposing you are using a server which provides everything, you can instantiate VisionWeb as:

```js
const visionWeb = new VisionWeb({
    fullHost: "full host",
    privateKey: "your private key",
});
```

For retro-compatibility, though, you can continue to use the old approach, where any parameter is passed separately:

```js
const visionWeb = new VisionWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);
```

If you are, for example, using a server as full and solidity node, and another server for the events, you can set it as:

```js
const visionWeb = new VisionWeb({
    fullHost: "full host",
    eventServer: "event server",
    privateKey: "your private key",
});
```

If you are using different servers for anything, you can do

```js
const visionWeb = new VisionWeb({
    fullNode: "full node",
    solidityNode: "solidity node",
    eventServer: "event server",
    privateKey: "your private key",
});
```

## Contributions

In order to contribute you can

-   fork this repo and clone it locally
-   install the dependencies — `npm i`
-   do your changes to the code
-   build the VisionWeb dist files — `npm run build`
-   run a local private network using Vision Quickstart
-   run the tests — `npm test:node`
-   push your changes and open a pull request

## Licence

VisionWeb is distributed under a MIT licence.

---
