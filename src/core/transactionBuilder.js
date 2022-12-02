import VisionWeb from "index";
import utils from "utils";
import { AbiCoder } from "utils/ethersUtils";
import Validator from "utils/validator";
import { ADDRESS_PREFIX_REGEX } from "config/address";
import injectpromise from "injectpromise";

let self;

//helpers

function toHex(value) {
    return VisionWeb.address.toHex(value);
}

function fromUtf8(value) {
    return self.visionWeb.fromUtf8(value);
}

function resultManager(transaction, callback) {
    if (transaction.Error) return callback(transaction.Error);

    if (transaction.result && transaction.result.message) {
        return callback(self.visionWeb.toUtf8(transaction.result.message));
    }

    return callback(null, transaction);
}

export default class TransactionBuilder {
    constructor(visionWeb = false) {
        if (!visionWeb || !visionWeb instanceof VisionWeb)
            throw new Error("Expected instance of VisionWeb");
        self = this;
        this.visionWeb = visionWeb;
        this.injectPromise = injectpromise(this);
        this.validator = new Validator(visionWeb);
    }

    sendVs(
        to = false,
        amount = 0,
        from = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(from)) {
            callback = from;
            from = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(from)) {
            options = from;
            from = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.sendVs, to, amount, from, options);

        // accept amounts passed as strings
        amount = parseInt(amount);

        if (
            this.validator.notValid(
                [
                    {
                        name: "recipient",
                        type: "address",
                        value: to,
                    },
                    {
                        name: "origin",
                        type: "address",
                        value: from,
                    },
                    {
                        names: ["recipient", "origin"],
                        type: "notEqual",
                        msg: "Cannot transfer VS to the same account",
                    },
                    {
                        name: "amount",
                        type: "integer",
                        gt: 0,
                        value: amount,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            to_address: toHex(to),
            owner_address: toHex(from),
            amount: amount,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/createtransaction", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    sendToken(
        to = false,
        amount = 0,
        tokenID = false,
        from = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(from)) {
            callback = from;
            from = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(from)) {
            options = from;
            from = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.sendToken,
                to,
                amount,
                tokenID,
                from,
                options
            );

        amount = parseInt(amount);
        if (
            this.validator.notValid(
                [
                    {
                        name: "recipient",
                        type: "address",
                        value: to,
                    },
                    {
                        name: "origin",
                        type: "address",
                        value: from,
                    },
                    {
                        names: ["recipient", "origin"],
                        type: "notEqual",
                        msg: "Cannot transfer tokens to the same account",
                    },
                    {
                        name: "amount",
                        type: "integer",
                        gt: 0,
                        value: amount,
                    },
                    {
                        name: "token ID",
                        type: "tokenId",
                        value: tokenID,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            to_address: toHex(to),
            owner_address: toHex(from),
            asset_name: fromUtf8(tokenID),
            amount: parseInt(amount),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/transferasset", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    purchaseToken(
        issuerAddress = false,
        tokenID = false,
        amount = 0,
        buyer = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(buyer)) {
            callback = buyer;
            buyer = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(buyer)) {
            options = buyer;
            buyer = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.purchaseToken,
                issuerAddress,
                tokenID,
                amount,
                buyer,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "buyer",
                        type: "address",
                        value: buyer,
                    },
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                    {
                        names: ["buyer", "issuer"],
                        type: "notEqual",
                        msg: "Cannot purchase tokens from same account",
                    },
                    {
                        name: "amount",
                        type: "integer",
                        gt: 0,
                        value: amount,
                    },
                    {
                        name: "token ID",
                        type: "tokenId",
                        value: tokenID,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            to_address: toHex(issuerAddress),
            owner_address: toHex(buyer),
            asset_name: fromUtf8(tokenID),
            amount: parseInt(amount),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/participateassetissue", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    freezeBalance(
        amount = 0,
        duration = 1,
        resource = "PHOTON",
        address = this.visionWeb.defaultAddress.hex,
        freezeBalanceStage = undefined,
        receiverAddress = undefined,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        } else if (utils.isObject(receiverAddress)) {
            options = receiverAddress;
            receiverAddress = undefined;
        }

        if (utils.isFunction(freezeBalanceStage)) {
            callback = freezeBalanceStage;
            freezeBalanceStage = undefined;
        } else if (utils.isObject(freezeBalanceStage)) {
            options = freezeBalanceStage;
            freezeBalanceStage = undefined;
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(address)) {
            options = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (utils.isFunction(duration)) {
            callback = duration;
            duration = 1;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = "PHOTON";
        }

        if (!callback)
            return this.injectPromise(
                this.freezeBalance,
                amount,
                duration,
                resource,
                address,
                freezeBalanceStage,
                receiverAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                    {
                        name: "receiver",
                        type: "address",
                        value: receiverAddress,
                        optional: true,
                    },
                    {
                        name: "amount",
                        type: "integer",
                        gt: 0,
                        value: amount,
                    },
                    {
                        name: "duration",
                        type: "integer",
                        gte: 1,
                        value: duration,
                    },
                    {
                        name: "resource",
                        type: "resource",
                        value: resource,
                        msg: 'Invalid resource provided: Expected "PHOTON","ENTROPY","SPREAD" or "SRGUARANTEE"',
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(address),
            frozen_balance: parseInt(amount),
            frozen_duration: parseInt(duration),
            resource: resource,
        };
        if (freezeBalanceStage && freezeBalanceStage.length > 0) {
            data.freezeBalanceStage = freezeBalanceStage.map(item => ({
                ...item,
                frozen_balance: parseInt(item.frozen_balance)
            }));
        }
        if (
            utils.isNotNullOrUndefined(receiverAddress) &&
            toHex(receiverAddress) !== toHex(address)
        ) {
            data.receiver_address = toHex(receiverAddress);
        }

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/freezebalance", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    unfreezeBalance(
        resource = "PHOTON",
        address = this.visionWeb.defaultAddress.hex,
        receiverAddress = undefined,
        stages = undefined,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (utils.isFunction(stages)) {
            callback = stages;
            stages = undefined;
        } else if (utils.isObject(stages)) {
            options = stages;
            stages = undefined;
        }
        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        } else if (utils.isObject(receiverAddress)) {
            options = receiverAddress;
            receiverAddress = undefined;
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(address)) {
            options = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = "PHOTON";
        }

        if (!callback)
            return this.injectPromise(
                this.unfreezeBalance,
                resource,
                address,
                receiverAddress,
                stages,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                    {
                        name: "receiver",
                        type: "address",
                        value: receiverAddress,
                        optional: true,
                    },
                    {
                        name: "resource",
                        type: "resource",
                        value: resource,
                        msg: 'Invalid resource provided: Expected "PHOTON","ENTROPY","SPREAD" or "SRGUARANTEE"',
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(address),
            resource: resource,
        };

        if (
            utils.isNotNullOrUndefined(receiverAddress) &&
            toHex(receiverAddress) !== toHex(address)
        ) {
            data.receiver_address = toHex(receiverAddress);
        }

        if (stages && stages.length > 0) {
            data.stages = stages;
        }

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/unfreezebalance", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    withdrawBlockRewards(
        address = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(address)) {
            options = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.withdrawBlockRewards,
                address,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(address),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/withdrawbalance", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    applyForSR(
        address = this.visionWeb.defaultAddress.hex,
        url = false,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }
        if (utils.isObject(url) && utils.isValidURL(address)) {
            options = url;
            url = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.applyForSR, address, url, options);

        if (
            this.validator.notValid(
                [
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                    {
                        name: "url",
                        type: "url",
                        value: url,
                        msg: "Invalid url provided",
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(address),
            url: fromUtf8(url),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/createwitness", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    vote(
        votes = {},
        voterAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(voterAddress)) {
            callback = voterAddress;
            voterAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(voterAddress)) {
            options = voterAddress;
            voterAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.vote, votes, voterAddress, options);

        if (
            this.validator.notValid(
                [
                    {
                        name: "voter",
                        type: "address",
                        value: voterAddress,
                    },
                    {
                        name: "votes",
                        type: "notEmptyObject",
                        value: votes,
                    },
                ],
                callback
            )
        )
            return;

        let invalid = false;

        votes = Object.entries(votes).map(([srAddress, voteCount]) => {
            if (invalid) return;

            if (
                this.validator.notValid([
                    {
                        name: "SR",
                        type: "address",
                        value: srAddress,
                    },
                    {
                        name: "vote count",
                        type: "integer",
                        gt: 0,
                        value: voteCount,
                        msg: "Invalid vote count provided for SR: " + srAddress,
                    },
                ])
            )
                return (invalid = true);

            return {
                vote_address: toHex(srAddress),
                vote_count: parseInt(voteCount),
            };
        });

        if (invalid) return;

        const data = {
            owner_address: toHex(voterAddress),
            votes,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/votewitnessaccount", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    createSmartContract(
        options = {},
        issuerAddress = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.createSmartContract,
                options,
                issuerAddress
            );

        const feeLimit = options.feeLimit || this.visionWeb.feeLimit;
        let userFeePercentage = options.userFeePercentage;
        if (typeof userFeePercentage !== "number" && !userFeePercentage) {
            userFeePercentage = 100;
        }
        const originEntropyLimit = options.originEntropyLimit || 10_000_000;
        const callValue = options.callValue || 0;
        const tokenValue = options.tokenValue;
        const tokenId = options.tokenId || options.token_id;

        let {
            abi = false,
            bytecode = false,
            parameters = [],
            name = "",
        } = options;

        if (abi && utils.isString(abi)) {
            try {
                abi = JSON.parse(abi);
            } catch {
                return callback("Invalid options.abi provided");
            }
        }

        if (abi.entrys) abi = abi.entrys;

        if (!utils.isArray(abi))
            return callback("Invalid options.abi provided");

        const payable = abi.some((func) => {
            return func.type == "constructor" && func.payable;
        });

        if (
            this.validator.notValid(
                [
                    {
                        name: "bytecode",
                        type: "hex",
                        value: bytecode,
                    },
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gt: 0,
                        lte: 1_000_000_000,
                    },
                    {
                        name: "callValue",
                        type: "integer",
                        value: callValue,
                        gte: 0,
                    },
                    {
                        name: "userFeePercentage",
                        type: "integer",
                        value: userFeePercentage,
                        gte: 0,
                        lte: 100,
                    },
                    {
                        name: "originEntropyLimit",
                        type: "integer",
                        value: originEntropyLimit,
                        gte: 0,
                        lte: 10_000_000,
                    },
                    {
                        name: "parameters",
                        type: "array",
                        value: parameters,
                    },
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                    {
                        name: "tokenValue",
                        type: "integer",
                        value: tokenValue,
                        gte: 0,
                        optional: true,
                    },
                    {
                        name: "tokenId",
                        type: "integer",
                        value: tokenId,
                        gte: 0,
                        optional: true,
                    },
                ],
                callback
            )
        )
            return;

        if (payable && callValue == 0 && tokenValue == 0)
            return callback(
                "When contract is payable, options.callValue or options.tokenValue must be a positive integer"
            );

        if (!payable && (callValue > 0 || tokenValue > 0))
            return callback(
                "When contract is not payable, options.callValue and options.tokenValue must be 0"
            );

        var constructorParams = abi.find((it) => {
            return it.type === "constructor";
        });

        if (typeof constructorParams !== "undefined" && constructorParams) {
            const abiCoder = new AbiCoder();
            const types = [];
            const values = [];
            constructorParams = constructorParams.inputs;

            if (parameters.length != constructorParams.length)
                return callback(
                    `constructor needs ${constructorParams.length} but ${parameters.length} provided`
                );

            for (let i = 0; i < parameters.length; i++) {
                let type = constructorParams[i].type;
                let value = parameters[i];

                if (!type || !utils.isString(type) || !type.length)
                    return callback("Invalid parameter type provided: " + type);

                if (type == "address")
                    value = toHex(value).replace(ADDRESS_PREFIX_REGEX, "0x");
                else if (type == "address[]")
                    value = value.map((v) =>
                        toHex(v).replace(ADDRESS_PREFIX_REGEX, "0x")
                    );

                types.push(type);
                values.push(value);
            }

            try {
                parameters = abiCoder
                    .encode(types, values)
                    .replace(/^(0x)/, "");
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = "";

        const args = {
            owner_address: toHex(issuerAddress),
            fee_limit: parseInt(feeLimit),
            call_value: parseInt(callValue),
            consume_user_resource_percent: userFeePercentage,
            origin_entropy_limit: originEntropyLimit,
            abi: JSON.stringify(abi),
            bytecode,
            parameter: parameters,
            name,
        };

        // tokenValue and tokenId can cause errors if provided when the vs10 proposal has not been approved yet. So we set them only if they are passed to the method.
        if (utils.isNotNullOrUndefined(tokenValue))
            args.call_token_value = parseInt(tokenValue);
        if (utils.isNotNullOrUndefined(tokenId))
            args.token_id = parseInt(tokenId);
        if (options && options.permissionId)
            args.Permission_id = options.permissionId;

        this.visionWeb.fullNode
            .request("wallet/deploycontract", args, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    triggerSmartContract(...params) {
        if (typeof params[2] !== "object") {
            params[2] = {
                feeLimit: params[2],
                callValue: params[3],
            };
            params.splice(3, 1);
        }
        return this._triggerSmartContract(...params);
    }

    triggerConstantContract(...params) {
        params[2]._isConstant = true;
        return this.triggerSmartContract(...params);
    }

    triggerConfirmedConstantContract(...params) {
        params[2]._isConstant = true;
        params[2].confirmed = true;
        return this.triggerSmartContract(...params);
    }

    _triggerSmartContract(
        contractAddress,
        functionSelector,
        options = {},
        parameters = [],
        issuerAddress = this.visionWeb.defaultAddress.hex,
        inputs,
        callback = false
    ) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }
        if (utils.isFunction(parameters)) {
            callback = parameters;
            parameters = [];
        }
        if (!callback) {
            return this.injectPromise(
                this._triggerSmartContract,
                contractAddress,
                functionSelector,
                options,
                parameters,
                issuerAddress,
                inputs
            );
        }
        if (options._isConstant && !issuerAddress) {
            issuerAddress = '460000000000000000000000000000000000000000'
        }
        let { tokenValue, tokenId, callValue, feeLimit } = Object.assign(
            {
                callValue: 0,
                feeLimit: this.visionWeb.feeLimit,
            },
            options
        );
        if (
            this.validator.notValid(
                [
                    {
                        name: "feeLimit",
                        type: "integer",
                        value: feeLimit,
                        gt: 0,
                        lte: 1_000_000_000,
                    },
                    {
                        name: "callValue",
                        type: "integer",
                        value: callValue,
                        gte: 0,
                    },
                    {
                        name: "parameters",
                        type: "array",
                        value: parameters,
                        optional: true,
                    },
                    {
                        name: "contract",
                        type: "address",
                        value: contractAddress,
                    },
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                        optional: true,
                    },
                    {
                        name: "tokenValue",
                        type: "integer",
                        value: tokenValue,
                        gte: 0,
                        optional: true,
                    },
                    {
                        name: "tokenId",
                        type: "integer",
                        value: tokenId,
                        gte: 0,
                        optional: true,
                    },
                    {
                        name: "function selector",
                        type: "not-empty-string",
                        value: functionSelector,
                    },
                ],
                callback
            )
        )
            return;
        functionSelector = functionSelector.replace("/s*/g", "");

        if (parameters.length) {
            const abiCoder = new AbiCoder();
            
            // deal with address/tuple
            const resolveType = (inputsObj) => { // values, inputs(includes types)
                const typearr = inputsObj?.components || [] // types
                const type = inputsObj?.type
                if(type.indexOf('tuple') > -1) {
                    const newarr = typearr?.map((comp, tindex) => comp?.type?.indexOf('tuple') > -1 ? resolveType(typearr?.[tindex]): comp?.type)
                    return `tuple(${newarr?.join(',')})${type?.indexOf('tuple[') > -1 ? '[]': ''}`
                } 
                else if (/vrcToken/.test()) {
                    return  type.replace(/vrcToken/, "uint256");
                } 
                else return type
            }
            const resolveValue = (arr = [], inputs) => {
                const values = [];
                for (let i = 0; i < arr.length; i++) {
                    let { type, value } = arr[i];
         
                    if (!type || !utils.isString(type) || !type.length){
                        console.error("Invalid parameter type provided: " + type)
                        return 
                    }
        
                    if (type === "address") // address
                        value = toHex(value).replace(ADDRESS_PREFIX_REGEX, "0x");
        
                    else if (type == "address[]") // address array
                        value = value.map((v) =>
                            toHex(v).replace(ADDRESS_PREFIX_REGEX, "0x")
                        );
        
                    else if(type === "tuple") { // tuple
                        const comps = inputs?.[i]?.components || []
                        value =  resolveValue(comps?.map((i,index)=>({type:i?.type, value: value?.[index]})), comps)
                    }
        
                    else if (type.indexOf("tuple[") > -1 ) { // tuple array
                        const comps = inputs?.[i]?.components || []
                        value = value.map(item=>resolveValue(item?.map((j,subindex)=>({type: comps?.[subindex]?.type, value: j})), comps))
                    }
                    values.push(value);
                   
                }
                return values
                
            }
            const types = inputs.map(item=>resolveType(item))
            const values = resolveValue(parameters, inputs)        

            try {
                
                parameters = abiCoder
                .encode(types, values)
                .replace(/^(0x)/, "");
                    
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = "";
        const args = {
            contract_address: toHex(contractAddress),
            owner_address: toHex(issuerAddress),
            function_selector: functionSelector,
            parameter: parameters,
        };
        if (!options._isConstant) {
            args.call_value = parseInt(callValue);
            args.fee_limit = parseInt(feeLimit);
            if (utils.isNotNullOrUndefined(tokenValue))
                args.call_token_value = parseInt(tokenValue);
            if (utils.isNotNullOrUndefined(tokenId))
                args.token_id = parseInt(tokenId);
        }
        if (options.permissionId) {
            args.Permission_id = options.permissionId;
        }
        this.visionWeb[options.confirmed ? "solidityNode" : "fullNode"]
            .request(
                `wallet${options.confirmed ? "solidity" : ""}/trigger${
                    options._isConstant ? "constant" : "smart"
                }contract`,
                args,
                "post"
            )
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    clearABI(
        contractAddress,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (!callback)
            return this.injectPromise(
                this.clearABI,
                contractAddress,
                ownerAddress
            );

        if (!this.visionWeb.isAddress(contractAddress))
            return callback("Invalid contract address provided");

        if (!this.visionWeb.isAddress(ownerAddress))
            return callback("Invalid owner address provided");

        const data = {
            contract_address: toHex(contractAddress),
            owner_address: toHex(ownerAddress),
        };

        if (this.visionWeb.vs.cache.contracts[contractAddress]) {
            delete this.visionWeb.vs.cache.contracts[contractAddress];
        }
        this.visionWeb.fullNode
            .request("wallet/clearabi", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    updateBrokerage(
        brokerage,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (!callback)
            return this.injectPromise(
                this.updateBrokerage,
                brokerage,
                ownerAddress
            );

        if (!utils.isNotNullOrUndefined(brokerage))
            return callback("Invalid brokerage provided");

        if (!utils.isInteger(brokerage) || brokerage < 0 || brokerage > 100)
            return callback("Brokerage must be an integer between 0 and 100");

        if (!this.visionWeb.isAddress(ownerAddress))
            return callback("Invalid owner address provided");

        const data = {
            brokerage: parseInt(brokerage),
            owner_address: toHex(ownerAddress),
        };

        this.visionWeb.fullNode
            .request("wallet/updateBrokerage", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    createToken(
        options = {},
        issuerAddress = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createToken, options, issuerAddress);

        const {
            name = false,
            abbreviation = false,
            description = false,
            url = false,
            totalSupply = 0,
            vsRatio = 1, // How much VS will `tokenRatio` cost?
            tokenRatio = 1, // How many tokens will `vsRatio` afford?
            saleStart = Date.now(),
            saleEnd = false,
            freePhoton = 0, // The creator's "donated" photon for use by token holders
            freePhotonLimit = 0, // Out of `totalFreePhoton`, the amount each token holder get
            frozenAmount = 0,
            frozenDuration = 0,
            // for now there is no default for the following values
            voteScore,
            precision,
        } = options;

        if (
            this.validator.notValid(
                [
                    {
                        name: "Supply amount",
                        type: "positive-integer",
                        value: totalSupply,
                    },
                    {
                        name: "VS ratio",
                        type: "positive-integer",
                        value: vsRatio,
                    },
                    {
                        name: "Token ratio",
                        type: "positive-integer",
                        value: tokenRatio,
                    },
                    {
                        name: "token abbreviation",
                        type: "not-empty-string",
                        value: abbreviation,
                    },
                    {
                        name: "token name",
                        type: "not-empty-string",
                        value: name,
                    },
                    {
                        name: "token description",
                        type: "not-empty-string",
                        value: description,
                    },
                    {
                        name: "token url",
                        type: "url",
                        value: url,
                    },
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                    {
                        name: "sale start timestamp",
                        type: "integer",
                        value: saleStart,
                        gte: Date.now(),
                    },
                    {
                        name: "sale end timestamp",
                        type: "integer",
                        value: saleEnd,
                        gt: saleStart,
                    },
                    {
                        name: "Free photon amount",
                        type: "integer",
                        value: freePhoton,
                        gte: 0,
                    },
                    {
                        name: "Free photon limit",
                        type: "integer",
                        value: freePhotonLimit,
                        gte: 0,
                    },
                    {
                        name: "Frozen supply",
                        type: "integer",
                        value: frozenAmount,
                        gte: 0,
                    },
                    {
                        name: "Frozen duration",
                        type: "integer",
                        value: frozenDuration,
                        gte: 0,
                    },
                ],
                callback
            )
        )
            return;

        if (
            utils.isNotNullOrUndefined(voteScore) &&
            (!utils.isInteger(voteScore) || voteScore <= 0)
        )
            return callback(
                "voteScore must be a positive integer greater than 0"
            );

        if (
            utils.isNotNullOrUndefined(precision) &&
            (!utils.isInteger(precision) || precision <= 0 || precision > 6)
        )
            return callback(
                "precision must be a positive integer > 0 and <= 6"
            );

        const data = {
            owner_address: toHex(issuerAddress),
            name: fromUtf8(name),
            abbr: fromUtf8(abbreviation),
            description: fromUtf8(description),
            url: fromUtf8(url),
            total_supply: parseInt(totalSupply),
            vs_num: parseInt(vsRatio),
            num: parseInt(tokenRatio),
            start_time: parseInt(saleStart),
            end_time: parseInt(saleEnd),
            free_asset_photon_limit: parseInt(freePhoton),
            public_free_asset_photon_limit: parseInt(freePhotonLimit),
            frozen_supply: {
                frozen_amount: parseInt(frozenAmount),
                frozen_days: parseInt(frozenDuration),
            },
        };
        if (
            this.visionWeb.fullnodeSatisfies(">=3.5.0") &&
            !(parseInt(frozenAmount) > 0)
        ) {
            delete data.frozen_supply;
        }
        if (precision && !isNaN(parseInt(precision))) {
            data.precision = parseInt(precision);
        }
        if (voteScore && !isNaN(parseInt(voteScore))) {
            data.vote_score = parseInt(voteScore);
        }
        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/createassetissue", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    updateAccount(
        accountName = false,
        address = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(address)) {
            options = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (!callback) {
            return this.injectPromise(
                this.updateAccount,
                accountName,
                address,
                options
            );
        }

        if (
            this.validator.notValid(
                [
                    {
                        name: "Name",
                        type: "not-empty-string",
                        value: accountName,
                    },
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            account_name: fromUtf8(accountName),
            owner_address: toHex(address),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/updateaccount", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    setAccountId(
        accountId,
        address = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.visionWeb.defaultAddress.hex;
        }

        if (!callback) {
            return this.injectPromise(this.setAccountId, accountId, address);
        }

        if (
            accountId &&
            utils.isString(accountId) &&
            accountId.startsWith("0x")
        ) {
            accountId = accountId.slice(2);
        }

        if (
            this.validator.notValid(
                [
                    {
                        name: "accountId",
                        type: "hex",
                        value: accountId,
                    },
                    {
                        name: "accountId",
                        type: "string",
                        lte: 32,
                        gte: 8,
                        value: accountId,
                    },
                    {
                        name: "origin",
                        type: "address",
                        value: address,
                    },
                ],
                callback
            )
        )
            return;

        this.visionWeb.fullNode
            .request(
                "wallet/setaccountid",
                {
                    account_id: accountId,
                    owner_address: toHex(address),
                },
                "post"
            )
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    updateToken(
        options = {},
        issuerAddress = this.visionWeb.defaultAddress.hex,
        callback = false
    ) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(issuerAddress)) {
            options = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.updateToken, options, issuerAddress);

        const {
            description = false,
            url = false,
            freePhoton = 0, // The creator's "donated" photon for use by token holders
            freePhotonLimit = 0, // Out of `totalFreePhoton`, the amount each token holder get
        } = options;

        if (
            this.validator.notValid(
                [
                    {
                        name: "token description",
                        type: "not-empty-string",
                        value: description,
                    },
                    {
                        name: "token url",
                        type: "url",
                        value: url,
                    },
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                    {
                        name: "Free photon amount",
                        type: "positive-integer",
                        value: freePhoton,
                    },
                    {
                        name: "Free photon limit",
                        type: "positive-integer",
                        value: freePhotonLimit,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(issuerAddress),
            description: fromUtf8(description),
            url: fromUtf8(url),
            new_limit: parseInt(freePhoton),
            new_public_limit: parseInt(freePhotonLimit),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/updateasset", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    sendAsset(...args) {
        return this.sendToken(...args);
    }

    purchaseAsset(...args) {
        return this.purchaseToken(...args);
    }

    createAsset(...args) {
        return this.createToken(...args);
    }

    updateAsset(...args) {
        return this.updateToken(...args);
    }

    /**
     * Creates a proposal to modify the network.
     * Can only be created by a current Super Representative.
     */
    createProposal(
        parameters = false,
        issuerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(issuerAddress)) {
            options = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.createProposal,
                parameters,
                issuerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                ],
                callback
            )
        )
            return;

        const invalid = "Invalid proposal parameters provided";

        if (!parameters) return callback(invalid);

        if (!utils.isArray(parameters)) parameters = [parameters];

        for (let parameter of parameters) {
            if (!utils.isObject(parameter)) return callback(invalid);
        }

        let data = {
            owner_address: toHex(issuerAddress),
        };

        let ParametersWith45 = parameters.filter(function (obj) {
            return obj.key === 45 || obj.key === 46 || obj.key === 59;
        });
        let ParametersWithout45 = parameters.filter(function (obj) {
            return obj.key !== 45 && obj.key !== 46 && obj.key !== 59;
        });
        if(ParametersWith45.length){
            data.string_parameters = ParametersWith45;
        }
        if(ParametersWithout45.length){
            data.parameters = ParametersWithout45;
        }

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }
        this.visionWeb.fullNode
            .request("wallet/proposalcreate", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Deletes a network modification proposal that the owner issued.
     * Only current Super Representative can vote on a proposal.
     */
    deleteProposal(
        proposalID = false,
        issuerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(issuerAddress)) {
            options = issuerAddress;
            issuerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.deleteProposal,
                proposalID,
                issuerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "issuer",
                        type: "address",
                        value: issuerAddress,
                    },
                    {
                        name: "proposalID",
                        type: "integer",
                        value: proposalID,
                        gte: 0,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(issuerAddress),
            proposal_id: parseInt(proposalID),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/proposaldelete", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Adds a vote to an issued network modification proposal.
     * Only current Super Representative can vote on a proposal.
     */
    voteProposal(
        proposalID = false,
        isApproval = false,
        voterAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(voterAddress)) {
            callback = voterAddress;
            voterAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(voterAddress)) {
            options = voterAddress;
            voterAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.voteProposal,
                proposalID,
                isApproval,
                voterAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "voter",
                        type: "address",
                        value: voterAddress,
                    },
                    {
                        name: "proposalID",
                        type: "integer",
                        value: proposalID,
                        gte: 0,
                    },
                    {
                        name: "has approval",
                        type: "boolean",
                        value: isApproval,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(voterAddress),
            proposal_id: parseInt(proposalID),
            is_add_approval: isApproval,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/proposalapprove", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Create an exchange between a token and VS.
     * Token Name should be a CASE SENSITIVE string.
     */
    createVSExchange(
        tokenName,
        tokenBalance,
        vsBalance,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.createVSExchange,
                tokenName,
                tokenBalance,
                vsBalance,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "token name",
                        type: "not-empty-string",
                        value: tokenName,
                    },
                    {
                        name: "token balance",
                        type: "positive-integer",
                        value: tokenBalance,
                    },
                    {
                        name: "vs balance",
                        type: "positive-integer",
                        value: vsBalance,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            first_token_id: fromUtf8(tokenName),
            first_token_balance: tokenBalance,
            second_token_id: "5f", // Constant for VS.
            second_token_balance: vsBalance,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/exchangecreate", data, "post")
            .then((resources) => {
                callback(null, resources);
            })
            .catch((err) => callback(err));
    }

    /**
     * Create an exchange between a token and another token.
     * DO NOT USE THIS FOR VS.
     * Token Names should be a CASE SENSITIVE string.
     */
    createTokenExchange(
        firstTokenName,
        firstTokenBalance,
        secondTokenName,
        secondTokenBalance,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.createTokenExchange,
                firstTokenName,
                firstTokenBalance,
                secondTokenName,
                secondTokenBalance,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "first token name",
                        type: "not-empty-string",
                        value: firstTokenName,
                    },
                    {
                        name: "second token name",
                        type: "not-empty-string",
                        value: secondTokenName,
                    },
                    {
                        name: "first token balance",
                        type: "positive-integer",
                        value: firstTokenBalance,
                    },
                    {
                        name: "second token balance",
                        type: "positive-integer",
                        value: secondTokenBalance,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            first_token_id: fromUtf8(firstTokenName),
            first_token_balance: firstTokenBalance,
            second_token_id: fromUtf8(secondTokenName),
            second_token_balance: secondTokenBalance,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/exchangecreate", data, "post")
            .then((resources) => {
                callback(null, resources);
            })
            .catch((err) => callback(err));
    }

    /**
     * Adds tokens into a bancor style exchange.
     * Will add both tokens at market rate.
     * Use "_" for the constant value for VS.
     */
    injectExchangeTokens(
        exchangeID = false,
        tokenName = false,
        tokenAmount = 0,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.injectExchangeTokens,
                exchangeID,
                tokenName,
                tokenAmount,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "token name",
                        type: "not-empty-string",
                        value: tokenName,
                    },
                    {
                        name: "token amount",
                        type: "integer",
                        value: tokenAmount,
                        gte: 1,
                    },
                    {
                        name: "exchangeID",
                        type: "integer",
                        value: exchangeID,
                        gte: 0,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: fromUtf8(tokenName),
            quant: parseInt(tokenAmount),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/exchangeinject", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Withdraws tokens from a bancor style exchange.
     * Will withdraw at market rate both tokens.
     * Use "_" for the constant value for VS.
     */
    withdrawExchangeTokens(
        exchangeID = false,
        tokenName = false,
        tokenAmount = 0,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.withdrawExchangeTokens,
                exchangeID,
                tokenName,
                tokenAmount,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "token name",
                        type: "not-empty-string",
                        value: tokenName,
                    },
                    {
                        name: "token amount",
                        type: "integer",
                        value: tokenAmount,
                        gte: 1,
                    },
                    {
                        name: "exchangeID",
                        type: "integer",
                        value: exchangeID,
                        gte: 0,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: fromUtf8(tokenName),
            quant: parseInt(tokenAmount),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/exchangewithdraw", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Trade tokens on a bancor style exchange.
     * Expected value is a validation and used to cap the total amt of token 2 spent.
     * Use "_" for the constant value for VS.
     */
    tradeExchangeTokens(
        exchangeID = false,
        tokenName = false,
        tokenAmountSold = 0,
        tokenAmountExpected = 0,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.tradeExchangeTokens,
                exchangeID,
                tokenName,
                tokenAmountSold,
                tokenAmountExpected,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "token name",
                        type: "not-empty-string",
                        value: tokenName,
                    },
                    {
                        name: "tokenAmountSold",
                        type: "integer",
                        value: tokenAmountSold,
                        gte: 1,
                    },
                    {
                        name: "tokenAmountExpected",
                        type: "integer",
                        value: tokenAmountExpected,
                        gte: 1,
                    },
                    {
                        name: "exchangeID",
                        type: "integer",
                        value: exchangeID,
                        gte: 0,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: this.visionWeb.fromAscii(tokenName),
            quant: parseInt(tokenAmountSold),
            expected: parseInt(tokenAmountExpected),
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/exchangetransaction", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Update userFeePercentage.
     */
    updateSetting(
        contractAddress = false,
        userFeePercentage = false,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.updateSetting,
                contractAddress,
                userFeePercentage,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "contract",
                        type: "address",
                        value: contractAddress,
                    },
                    {
                        name: "userFeePercentage",
                        type: "integer",
                        value: userFeePercentage,
                        gte: 0,
                        lte: 100,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            contract_address: toHex(contractAddress),
            consume_user_resource_percent: userFeePercentage,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/updatesetting", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    /**
     * Update entropy limit.
     */
    updateEntropyLimit(
        contractAddress = false,
        originEntropyLimit = false,
        ownerAddress = this.visionWeb.defaultAddress.hex,
        options,
        callback = false
    ) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        } else if (utils.isObject(ownerAddress)) {
            options = ownerAddress;
            ownerAddress = this.visionWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(
                this.updateEntropyLimit,
                contractAddress,
                originEntropyLimit,
                ownerAddress,
                options
            );

        if (
            this.validator.notValid(
                [
                    {
                        name: "owner",
                        type: "address",
                        value: ownerAddress,
                    },
                    {
                        name: "contract",
                        type: "address",
                        value: contractAddress,
                    },
                    {
                        name: "originEntropyLimit",
                        type: "integer",
                        value: originEntropyLimit,
                        gte: 0,
                        lte: 10_000_000,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            contract_address: toHex(contractAddress),
            origin_entropy_limit: originEntropyLimit,
        };

        if (options && options.permissionId) {
            data.Permission_id = options.permissionId;
        }

        this.visionWeb.fullNode
            .request("wallet/updateentropylimit", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    checkPermissions(permissions, type) {
        if (permissions) {
            if (
                permissions.type !== type ||
                !permissions.permission_name ||
                !utils.isString(permissions.permission_name) ||
                !utils.isInteger(permissions.threshold) ||
                permissions.threshold < 1 ||
                !permissions.keys
            ) {
                return false;
            }
            for (let key of permissions.keys) {
                if (
                    !this.visionWeb.isAddress(key.address) ||
                    !utils.isInteger(key.weight) ||
                    key.weight > permissions.threshold ||
                    key.weight < 1 ||
                    (type === 2 && !permissions.operations)
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    updateAccountPermissions(
        ownerAddress = this.visionWeb.defaultAddress.hex,
        ownerPermissions = false,
        witnessPermissions = false,
        activesPermissions = false,
        callback = false
    ) {
        if (utils.isFunction(activesPermissions)) {
            callback = activesPermissions;
            activesPermissions = false;
        }

        if (utils.isFunction(witnessPermissions)) {
            callback = witnessPermissions;
            witnessPermissions = activesPermissions = false;
        }

        if (utils.isFunction(ownerPermissions)) {
            callback = ownerPermissions;
            ownerPermissions = witnessPermissions = activesPermissions = false;
        }

        if (!callback)
            return this.injectPromise(
                this.updateAccountPermissions,
                ownerAddress,
                ownerPermissions,
                witnessPermissions,
                activesPermissions
            );

        if (!this.visionWeb.isAddress(ownerAddress))
            return callback("Invalid ownerAddress provided");

        if (!this.checkPermissions(ownerPermissions, 0)) {
            return callback("Invalid ownerPermissions provided");
        }

        if (!this.checkPermissions(witnessPermissions, 1)) {
            return callback("Invalid witnessPermissions provided");
        }

        if (!Array.isArray(activesPermissions)) {
            activesPermissions = [activesPermissions];
        }

        for (let activesPermission of activesPermissions) {
            if (!this.checkPermissions(activesPermission, 2)) {
                return callback("Invalid activesPermissions provided");
            }
        }

        const data = {
            owner_address: ownerAddress,
        };
        if (ownerPermissions) {
            data.owner = ownerPermissions;
        }
        if (witnessPermissions) {
            data.witness = witnessPermissions;
        }
        if (activesPermissions) {
            data.actives =
                activesPermissions.length === 1
                    ? activesPermissions[0]
                    : activesPermissions;
        }

        this.visionWeb.fullNode
            .request("wallet/accountpermissionupdate", data, "post")
            .then((transaction) => resultManager(transaction, callback))
            .catch((err) => callback(err));
    }

    async newTxID(transaction, callback) {
        if (!callback) return this.injectPromise(this.newTxID, transaction);

        this.visionWeb.fullNode
            .request("wallet/getsignweight", transaction, "post")
            .then((newTransaction) => {
                newTransaction = newTransaction.transaction.transaction;
                if (typeof transaction.visible === "boolean") {
                    newTransaction.visible = transaction.visible;
                }
                callback(null, newTransaction);
            })
            .catch((err) => callback("Error generating a new transaction id."));
    }

    async alterTransaction(transaction, options = {}, callback = false) {
        if (!callback)
            return this.injectPromise(
                this.alterTransaction,
                transaction,
                options
            );

        if (transaction.signature)
            return callback(
                "You can not extend the expiration of a signed transaction."
            );

        if (options.data) {
            if (options.dataFormat !== "hex")
                options.data = this.visionWeb.toHex(options.data);
            options.data = options.data.replace(/^0x/, "");
            if (options.data.length === 0)
                return callback("Invalid data provided");
            transaction.raw_data.data = options.data;
        }

        if (options.extension) {
            options.extension = parseInt(options.extension * 1000);
            if (
                isNaN(options.extension) ||
                transaction.raw_data.expiration + options.extension <=
                    Date.now() + 3000
            )
                return callback("Invalid extension provided");
            transaction.raw_data.expiration += options.extension;
        }

        this.newTxID(transaction, callback);
    }

    async extendExpiration(transaction, extension, callback = false) {
        if (!callback)
            return this.injectPromise(
                this.extendExpiration,
                transaction,
                extension
            );

        this.alterTransaction(transaction, { extension }, callback);
    }

    async addUpdateData(
        transaction,
        data,
        dataFormat = "utf8",
        callback = false
    ) {
        if (utils.isFunction(dataFormat)) {
            callback = dataFormat;
            dataFormat = "utf8";
        }

        if (!callback)
            return this.injectPromise(
                this.addUpdateData,
                transaction,
                data,
                dataFormat
            );

        this.alterTransaction(transaction, { data, dataFormat }, callback);
    }
    /**
     * Create a market sell asset.
     * Token Names should be a CASE SENSITIVE string.
     * "5f" constant for Vs.
     */
    async createMarketSellAsset(
        ownerAddress = this.visionWeb.defaultAddress.hex,
        sellTokenName = false,
        sellTokenQuantity = false,
        buyTokenName = false,
        buyTokenQuantity = false,
        callback = false
    ) {
        if (!callback) {
            return this.injectPromise(
                this.createMarketSellAsset,
                ownerAddress,
                sellTokenName,
                sellTokenQuantity,
                buyTokenName,
                buyTokenQuantity
            );
        }
        if (
            this.validator.notValid(
                [
                    { name: "owner", type: "address", value: ownerAddress },
                    {
                        name: "sell token name",
                        type: "not-empty-string",
                        value: sellTokenName,
                    },
                    {
                        name: "sell token quantity",
                        type: "positive-integer",
                        value: sellTokenQuantity,
                    },
                    {
                        name: "buy token name",
                        type: "not-empty-string",
                        value: buyTokenName,
                    },
                    {
                        name: "buy token quantity",
                        type: "positive-integer",
                        value: buyTokenQuantity,
                    },
                ],
                callback
            )
        )
            return;
        const data = {
            owner_address: toHex(ownerAddress),
            sell_token_id: fromUtf8(sellTokenName),
            sell_token_quantity: sellTokenQuantity,
            buy_token_id: fromUtf8(buyTokenName),
            buy_token_quantity: buyTokenQuantity,
        };
        this.visionWeb.fullNode
            .request("wallet/marketsellasset", data, "post")
            .then((resources) => {
                callback(null, resources);
            })
            .catch((err) => callback(err));
    }
    /**
     * Cancel a market order.
     */
    async cancelMarketOrder(
        ownerAddress = this.visionWeb.defaultAddress.hex,
        orderId = false,
        callback = false
    ) {
        if (!callback) {
            return this.injectPromise(
                this.cancelMarketOrder,
                ownerAddress,
                orderId
            );
        }
        if (
            this.validator.notValid(
                [
                    { name: "owner", type: "address", value: ownerAddress },
                    {
                        name: "order id",
                        type: "not-empty-string",
                        value: orderId,
                    },
                ],
                callback
            )
        )
            return;

        const data = {
            owner_address: toHex(ownerAddress),
            order_id: orderId,
        };
        this.visionWeb.fullNode
            .request("wallet/marketcancelorder", data, "post")
            .then((resources) => {
                callback(null, resources);
            })
            .catch((err) => callback(err));
    }
}
