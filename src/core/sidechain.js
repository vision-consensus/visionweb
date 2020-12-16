import injectpromise from "injectpromise";
import Validator from "utils/validator";

export default class SideChain {
    constructor(
        sideOptions,
        VisionWeb = false,
        mainchain = false,
        privateKey = false
    ) {
        this.mainchain = mainchain;
        const {
            fullHost,
            fullNode,
            solidityNode,
            eventServer,
            mainGatewayAddress,
            sideGatewayAddress,
            sideChainId,
        } = sideOptions;
        this.sidechain = new VisionWeb(
            fullHost || fullNode,
            fullHost || solidityNode,
            fullHost || eventServer,
            privateKey
        );
        this.isAddress = this.mainchain.isAddress;
        this.utils = this.mainchain.utils;
        this.setMainGatewayAddress(mainGatewayAddress);
        this.setSideGatewayAddress(sideGatewayAddress);
        this.setChainId(sideChainId);
        this.injectPromise = injectpromise(this);
        this.validator = new Validator(this.sidechain);

        const self = this;
        this.sidechain.vs.sign = (...args) => {
            return self.sign(...args);
        };
        this.sidechain.vs.multiSign = (...args) => {
            return self.multiSign(...args);
        };
    }
    setMainGatewayAddress(mainGatewayAddress) {
        if (!this.isAddress(mainGatewayAddress))
            throw new Error("Invalid main gateway address provided");
        this.mainGatewayAddress = mainGatewayAddress;
    }

    setSideGatewayAddress(sideGatewayAddress) {
        if (!this.isAddress(sideGatewayAddress))
            throw new Error("Invalid side gateway address provided");
        this.sideGatewayAddress = sideGatewayAddress;
    }

    setChainId(sideChainId) {
        if (!this.utils.isString(sideChainId) || !sideChainId)
            throw new Error("Invalid side chainId provided");
        this.chainId = sideChainId;
    }

    signTransaction(priKeyBytes, transaction) {
        if (typeof priKeyBytes === "string") {
            priKeyBytes = this.utils.code.hexStr2byteArray(priKeyBytes);
        }
        let chainIdByteArr = this.utils.code.hexStr2byteArray(this.chainId);

        let byteArr = this.utils.code
            .hexStr2byteArray(transaction.txID)
            .concat(chainIdByteArr);
        let byteArrHash = this.sidechain.utils.ethersUtils.sha256(byteArr);

        const signature = this.utils.crypto.ECKeySign(
            this.utils.code.hexStr2byteArray(byteArrHash.replace(/^0x/, "")),
            priKeyBytes
        );

        if (Array.isArray(transaction.signature)) {
            if (!transaction.signature.includes(signature))
                transaction.signature.push(signature);
        } else transaction.signature = [signature];
        return transaction;
    }

    async multiSign(
        transaction = false,
        privateKey = this.sidechain.defaultPrivateKey,
        permissionId = false,
        callback = false
    ) {
        if (this.utils.isFunction(permissionId)) {
            callback = permissionId;
            permissionId = 0;
        }

        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
            permissionId = 0;
        }

        if (!callback)
            return this.injectPromise(
                this.multiSign,
                transaction,
                privateKey,
                permissionId
            );

        if (
            !this.utils.isObject(transaction) ||
            !transaction.raw_data ||
            !transaction.raw_data.contract
        )
            return callback("Invalid transaction provided");

        if (
            !transaction.raw_data.contract[0].Permission_id &&
            permissionId > 0
        ) {
            // set permission id
            transaction.raw_data.contract[0].Permission_id = permissionId;

            // check if private key insides permission list
            const address = this.sidechain.address
                .toHex(this.sidechain.address.fromPrivateKey(privateKey))
                .toLowerCase();
            const signWeight = await this.sidechain.vs.getSignWeight(
                transaction,
                permissionId
            );

            if (signWeight.result.code === "PERMISSION_ERROR") {
                return callback(signWeight.result.message);
            }

            let foundKey = false;
            signWeight.permission.keys.map((key) => {
                if (key.address === address) foundKey = true;
            });

            if (!foundKey)
                return callback(privateKey + " has no permission to sign");

            if (
                signWeight.approved_list &&
                signWeight.approved_list.indexOf(address) != -1
            ) {
                return callback(privateKey + " already sign transaction");
            }

            // reset transaction
            if (signWeight.transaction && signWeight.transaction.transaction) {
                transaction = signWeight.transaction.transaction;
                transaction.raw_data.contract[0].Permission_id = permissionId;
            } else {
                return callback("Invalid transaction provided");
            }
        }
        // sign
        try {
            return callback(
                null,
                this.signTransaction(privateKey, transaction)
            );
        } catch (ex) {
            callback(ex);
        }
    }

    async sign(
        transaction = false,
        privateKey = this.sidechain.defaultPrivateKey,
        useVisionHeader = true,
        multisig = false,
        callback = false
    ) {
        if (this.utils.isFunction(multisig)) {
            callback = multisig;
            multisig = false;
        }

        if (this.utils.isFunction(useVisionHeader)) {
            callback = useVisionHeader;
            useVisionHeader = true;
            multisig = false;
        }

        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.sidechain.defaultPrivateKey;
            useVisionHeader = true;
            multisig = false;
        }

        if (!callback)
            return this.injectPromise(
                this.sign,
                transaction,
                privateKey,
                useVisionHeader,
                multisig
            );

        // Message signing
        if (this.utils.isString(transaction)) {
            if (!this.utils.isHex(transaction))
                return callback("Expected hex message input");

            try {
                const signatureHex = this.sidechain.vs.signString(
                    transaction,
                    privateKey,
                    useVisionHeader
                );
                return callback(null, signatureHex);
            } catch (ex) {
                callback(ex);
            }
        }

        if (!this.utils.isObject(transaction))
            return callback("Invalid transaction provided");

        if (!multisig && transaction.signature)
            return callback("Transaction is already signed");

        try {
            if (!multisig) {
                const address = this.sidechain.address
                    .toHex(this.sidechain.address.fromPrivateKey(privateKey))
                    .toLowerCase();
                if (
                    address !==
                    this.sidechain.address.toHex(
                        transaction.raw_data.contract[0].parameter.value
                            .owner_address
                    )
                )
                    return callback(
                        "Private key does not match address in transaction"
                    );
            }
            return callback(
                null,
                this.signTransaction(privateKey, transaction)
            );
        } catch (ex) {
            callback(ex);
        }
    }

    /**
     * deposit asset to sidechain
     */
    async depositVs(
        callValue,
        depositFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.depositVs,
                callValue,
                depositFee,
                feeLimit,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "callValue",
                        type: "integer",
                        value: callValue,
                        gte: 0,
                    },
                    {
                        name: "depositFee",
                        type: "integer",
                        value: depositFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            callValue: Number(callValue) + Number(depositFee),
            feeLimit,
            ...options,
        };
        try {
            const contractInstance = await this.mainchain
                .contract()
                .at(this.mainGatewayAddress);
            const result = await contractInstance
                .depositVS()
                .send(options, privateKey);
            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async depositVrc10(
        tokenId,
        tokenValue,
        depositFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.depositVrc10,
                tokenId,
                tokenValue,
                depositFee,
                feeLimit,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "tokenValue",
                        type: "integer",
                        value: tokenValue,
                        gte: 0,
                    },
                    {
                        name: "depositFee",
                        type: "integer",
                        value: depositFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                    {
                        name: "tokenId",
                        type: "integer",
                        value: tokenId,
                        gte: 0,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            tokenId,
            tokenValue,
            feeLimit,
            ...options,
            callValue: depositFee,
        };
        try {
            const contractInstance = await this.mainchain
                .contract()
                .at(this.mainGatewayAddress);
            const result = await contractInstance
                .depositVRC10(tokenId, tokenValue)
                .send(options, privateKey);
            callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async depositVrc(
        functionSelector,
        num,
        fee,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.depositVrc,
                functionSelector,
                num,
                fee,
                feeLimit,
                contractAddress,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "functionSelector",
                        type: "not-empty-string",
                        value: functionSelector,
                    },
                    {
                        name: "num",
                        type: "integer",
                        value: num,
                        gte: 0,
                    },
                    {
                        name: "fee",
                        type: "integer",
                        value: fee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                    {
                        name: "contractAddress",
                        type: "address",
                        value: contractAddress,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            feeLimit,
            ...options,
            callValue: fee,
            tokenId: "",
            tokenValue: 0,
        };
        try {
            let result = null;
            if (functionSelector === "approve") {
                const approveInstance = await this.mainchain
                    .contract()
                    .at(contractAddress);
                result = await approveInstance
                    .approve(this.mainGatewayAddress, num)
                    .send(options, privateKey);
            } else {
                const contractInstance = await this.mainchain
                    .contract()
                    .at(this.mainGatewayAddress);
                switch (functionSelector) {
                    case "depositVRC20":
                        result = await contractInstance
                            .depositVRC20(contractAddress, num)
                            .send(options, privateKey);
                        break;
                    case "depositVRC721":
                        result = await contractInstance
                            .depositVRC721(contractAddress, num)
                            .send(options, privateKey);
                        break;
                    case "retryDeposit":
                        result = await contractInstance
                            .retryDeposit(num)
                            .send(options, privateKey);
                        break;
                    case "retryMapping":
                        result = await contractInstance
                            .retryMapping(num)
                            .send(options, privateKey);
                        break;
                    default:
                        break;
                }
            }
            callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async approveVrc20(
        num,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "approve";
        return this.depositVrc(
            functionSelector,
            num,
            0,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    async approveVrc721(
        id,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "approve";
        return this.depositVrc(
            functionSelector,
            id,
            0,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    async depositVrc20(
        num,
        depositFee,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "depositVRC20";
        return this.depositVrc(
            functionSelector,
            num,
            depositFee,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    async depositVrc721(
        id,
        depositFee,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "depositVRC721";
        return this.depositVrc(
            functionSelector,
            id,
            depositFee,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    /**
     * mapping asset VRC20 or VRC721 to DAppChain
     */
    async mappingVrc(
        vsHash,
        mappingFee,
        feeLimit,
        functionSelector,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.mappingVrc,
                vsHash,
                mappingFee,
                feeLimit,
                functionSelector,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "vsHash",
                        type: "not-empty-string",
                        value: vsHash,
                    },
                    {
                        name: "mappingFee",
                        type: "integer",
                        value: mappingFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        vsHash = vsHash.startsWith("0x") ? vsHash : "0x" + vsHash;
        options = {
            feeLimit,
            ...options,
            callValue: mappingFee,
        };
        try {
            const contractInstance = await this.mainchain
                .contract()
                .at(this.mainGatewayAddress);
            let result = null;
            if (functionSelector === "mappingVRC20") {
                result = await contractInstance
                    .mappingVRC20(vsHash)
                    .send(options, privateKey);
            } else if (functionSelector === "mappingVRC721") {
                result = await contractInstance
                    .mappingVRC721(vsHash)
                    .send(options, privateKey);
            } else {
                callback(new Error("type must be vrc20 or vrc721"));
            }
            callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async mappingVrc20(
        vsHash,
        mappingFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "mappingVRC20";
        return this.mappingVrc(
            vsHash,
            mappingFee,
            feeLimit,
            functionSelector,
            options,
            privateKey,
            callback
        );
    }

    async mappingVrc721(
        vsHash,
        mappingFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "mappingVRC721";
        return this.mappingVrc(
            vsHash,
            mappingFee,
            feeLimit,
            functionSelector,
            options,
            privateKey,
            callback
        );
    }

    /**
     * withdraw vs from sidechain to mainchain
     */
    async withdrawVs(
        callValue,
        withdrawFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.withdrawVs,
                callValue,
                withdrawFee,
                feeLimit,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "callValue",
                        type: "integer",
                        value: callValue,
                        gte: 0,
                    },
                    {
                        name: "withdrawFee",
                        type: "integer",
                        value: withdrawFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            callValue: Number(callValue) + Number(withdrawFee),
            feeLimit,
            ...options,
        };
        try {
            const contractInstance = await this.sidechain
                .contract()
                .at(this.sideGatewayAddress);
            const result = await contractInstance
                .withdrawVS()
                .send(options, privateKey);
            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async withdrawVrc10(
        tokenId,
        tokenValue,
        withdrawFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.withdrawVrc10,
                tokenId,
                tokenValue,
                withdrawFee,
                feeLimit,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "tokenId",
                        type: "integer",
                        value: tokenId,
                        gte: 0,
                    },
                    {
                        name: "tokenValue",
                        type: "integer",
                        value: tokenValue,
                        gte: 0,
                    },
                    {
                        name: "withdrawFee",
                        type: "integer",
                        value: withdrawFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            tokenValue,
            tokenId,
            callValue: withdrawFee,
            feeLimit,
            ...options,
        };
        try {
            const contractInstance = await this.sidechain
                .contract()
                .at(this.sideGatewayAddress);
            const result = await contractInstance
                .withdrawVRC10(tokenId, tokenValue)
                .send(options, privateKey);
            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async withdrawVrc(
        functionSelector,
        numOrId,
        withdrawFee,
        feeLimit,
        contractAddress,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }
        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.withdrawVrc,
                functionSelector,
                numOrId,
                withdrawFee,
                feeLimit,
                contractAddress,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "functionSelector",
                        type: "not-empty-string",
                        value: functionSelector,
                    },
                    {
                        name: "numOrId",
                        type: "integer",
                        value: numOrId,
                        gte: 0,
                    },
                    {
                        name: "withdrawFee",
                        type: "integer",
                        value: withdrawFee,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                    {
                        name: "contractAddress",
                        type: "address",
                        value: contractAddress,
                    },
                ],
                callback
            )
        ) {
            return;
        }
        options = {
            feeLimit,
            ...options,
            callValue: withdrawFee,
        };
        const parameters = [
            {
                type: "uint256",
                value: numOrId,
            },
        ];

        try {
            const address = privateKey
                ? this.sidechain.address.fromPrivateKey(privateKey)
                : this.sidechain.defaultAddress.base58;
            const transaction = await this.sidechain.transactionBuilder.triggerSmartContract(
                contractAddress,
                functionSelector,
                options,
                parameters,
                this.sidechain.address.toHex(address)
            );
            if (!transaction.result || !transaction.result.result) {
                return callback(
                    "Unknown error: " +
                        JSON.stringify(transaction.transaction, null, 2)
                );
            }

            const signedTransaction = await this.sidechain.vs.sign(
                transaction.transaction,
                privateKey
            );

            if (!signedTransaction.signature) {
                if (!privateKey)
                    return callback("Transaction was not signed properly");

                return callback("Invalid private key provided");
            }

            const broadcast = await this.sidechain.vs.sendRawTransaction(
                signedTransaction
            );
            if (broadcast.code) {
                const err = {
                    error: broadcast.code,
                    message: broadcast.code,
                };
                if (broadcast.message)
                    err.message = this.sidechain.toUtf8(broadcast.message);
                return callback(err);
            }

            if (!options.shouldPollResponse)
                return callback(null, signedTransaction.txID);

            const checkResult = async (index = 0) => {
                if (index == 20) {
                    return callback({
                        error: "Cannot find result in solidity node",
                        transaction: signedTransaction,
                    });
                }

                const output = await this.sidechain.vs.getTransactionInfo(
                    signedTransaction.txID
                );

                if (!Object.keys(output).length) {
                    return setTimeout(() => {
                        checkResult(index + 1);
                    }, 3000);
                }

                if (output.result && output.result == "FAILED") {
                    return callback({
                        error: this.sidechain.toUtf8(output.resMessage),
                        transaction: signedTransaction,
                        output,
                    });
                }

                if (!this.utils.hasProperty(output, "contractResult")) {
                    return callback({
                        error:
                            "Failed to execute: " +
                            JSON.stringify(output, null, 2),
                        transaction: signedTransaction,
                        output,
                    });
                }

                if (options.rawResponse) return callback(null, output);

                let decoded = decodeOutput(
                    this.outputs,
                    "0x" + output.contractResult[0]
                );

                if (decoded.length === 1) decoded = decoded[0];

                return callback(null, decoded);
            };

            checkResult();
        } catch (ex) {
            return callback(ex);
        }
    }

    async withdrawVrc20(
        num,
        withdrawFee,
        feeLimit,
        contractAddress,
        options,
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "withdrawal(uint256)";
        return this.withdrawVrc(
            functionSelector,
            num,
            withdrawFee,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    async withdrawVrc721(
        id,
        withdrawFee,
        feeLimit,
        contractAddress,
        options,
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "withdrawal(uint256)";
        return this.withdrawVrc(
            functionSelector,
            id,
            withdrawFee,
            feeLimit,
            contractAddress,
            options,
            privateKey,
            callback
        );
    }

    async injectFund(
        num,
        feeLimit,
        options,
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        if (this.utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mainchain.defaultPrivateKey;
        }

        if (this.utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (!callback) {
            return this.injectPromise(
                this.injectFund,
                num,
                feeLimit,
                options,
                privateKey
            );
        }
        if (
            this.validator.notValid(
                [
                    {
                        name: "num",
                        type: "integer",
                        value: num,
                        gte: 0,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gte: 0,
                        lte: 1_000_000_000,
                    },
                ],
                callback
            )
        ) {
            return;
        }

        try {
            const address = this.sidechain.address.fromPrivateKey(privateKey);
            const hexAddress = this.sidechain.address.toHex(address);
            const transaction = await this.sidechain.fullNode.request(
                "/wallet/fundinject",
                {
                    owner_address: hexAddress,
                    amount: num,
                },
                "post"
            );

            const signedTransaction = await this.sidechain.vs.sign(
                transaction,
                privateKey
            );

            if (!signedTransaction.signature) {
                if (!privateKey)
                    return callback("Transaction was not signed properly");

                return callback("Invalid private key provided");
            }

            const broadcast = await this.sidechain.vs.sendRawTransaction(
                signedTransaction
            );
            if (broadcast.code) {
                const err = {
                    error: broadcast.code,
                    message: broadcast.code,
                };
                if (broadcast.message)
                    err.message = this.mainchain.toUtf8(broadcast.message);
                return callback(err);
            }
            return callback(null, signedTransaction.txID);
        } catch (ex) {
            return callback(ex);
        }
    }

    async retryWithdraw(
        nonce,
        retryWithdrawFee,
        feeLimit,
        options = {},
        privateKey = this.sidechain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "retryWithdraw(uint256)";
        return this.withdrawVrc(
            functionSelector,
            nonce,
            retryWithdrawFee,
            feeLimit,
            this.sideGatewayAddress,
            options,
            privateKey,
            callback
        );
    }

    async retryDeposit(
        nonce,
        retryDepositFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "retryDeposit";
        return this.depositVrc(
            functionSelector,
            nonce,
            retryDepositFee,
            feeLimit,
            this.mainGatewayAddress,
            options,
            privateKey,
            callback
        );
    }

    async retryMapping(
        nonce,
        retryMappingFee,
        feeLimit,
        options = {},
        privateKey = this.mainchain.defaultPrivateKey,
        callback = false
    ) {
        const functionSelector = "retryMapping";
        return this.depositVrc(
            functionSelector,
            nonce,
            retryMappingFee,
            feeLimit,
            this.mainGatewayAddress,
            options,
            privateKey,
            callback
        );
    }
}
