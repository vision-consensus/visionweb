
import {utils} from 'ethers';

const keccak256 = utils.keccak256;
const sha256 = utils.sha256;
const toUtf8Bytes = utils.toUtf8Bytes;
const recoverAddress = utils.recoverAddress;
const SigningKey = utils.SigningKey;
const AbiCoder = utils.AbiCoder;
const Fragment = utils.Fragment;
const getAddress = utils.getAddress;

export {
    keccak256,
    sha256,
    toUtf8Bytes,
    recoverAddress,
    SigningKey,
    AbiCoder,
    Fragment,
    getAddress
}
