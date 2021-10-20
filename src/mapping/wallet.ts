import {WalletFactory, Wallet, Transaction} from "../../generated/schema"
import {Initialized, TransactionExecuted, Deposit, Invoked} from "../../generated/Wallet/TOTPWallet"
import {TransactionExecuted as TransactionExecutedOld } from "../../generated/OldWallet/TOTPWallet"
import {getSummary} from "../entities";
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
export const BIG_DECIMAL_1E18 = BigDecimal.fromString('1e18')
export const BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')
export const BIG_INT_ZERO = BigInt.fromI32(0)

import {
    ethereum
} from "@graphprotocol/graph-ts"



export function onMetaTransaction(event: TransactionExecuted): void {
    let tx = new Transaction(event.transaction.hash.toHex());
    tx.blockNumber = event.block.number;
    tx.blockTime = event.block.timestamp;
    tx.from = event.transaction.from;
    tx.to = event.transaction.to;
    tx.value = event.transaction.value;
    tx.data = event.transaction.input;
    tx.gasUsed = event.transaction.gasUsed;
    tx.gasPrice = event.transaction.gasPrice;
    tx.refundAddress = event.params.refundAddress;
    tx.refundFee = event.params.refundFee;
    tx.metaSuccess = event.params.success;
    tx.isMeta = true;

    var summary = getSummary();
    summary.txCount = summary.txCount.plus(BigInt.fromI32(1))
    var feePaid = event.transaction.gasPrice.toBigDecimal().div(BIG_DECIMAL_1E18).times(event.transaction.gasUsed.toBigDecimal())
    var refundFee = event.params.refundFee.toBigDecimal().div(BIG_DECIMAL_1E18)
    summary.feePaid.plus(feePaid)
    summary.feeCollected.plus(refundFee)
    summary.save();
    //var decoded = getFunction(event.transaction.input.toHex());

    tx.save();
}

export function onMetaTransaction2(event: TransactionExecutedOld): void {
    let tx = new Transaction(event.transaction.hash.toHex());
    tx.blockNumber = event.block.number;
    tx.blockTime = event.block.timestamp;
    tx.from = event.transaction.from;
    tx.to = event.transaction.to;
    tx.value = event.transaction.value;
    tx.data = event.transaction.input;
    tx.gasUsed = event.transaction.gasUsed;
    tx.gasPrice = event.transaction.gasPrice;
    tx.refundAddress = Address.fromString('0x0000000000000000000000000000000000000000');
    tx.refundFee = BIG_INT_ZERO;
    tx.metaSuccess = event.params.success;
    tx.isMeta = true;

    var summary = getSummary();
    summary.txCount = summary.txCount.plus(BigInt.fromI32(1))
    var feePaid = event.transaction.gasPrice.toBigDecimal().div(BIG_DECIMAL_1E18).times(event.transaction.gasUsed.toBigDecimal())
    summary.feePaid.plus(feePaid)
    summary.save();

    tx.save();
}

export function onInitialized(event: Initialized): void {
    let tx = new Transaction(event.transaction.hash.toHex());
    tx.blockNumber = event.block.number;
    tx.blockTime = event.block.timestamp;
    tx.from = event.transaction.from;
    tx.to = event.transaction.to;
    tx.value = event.transaction.value;
    tx.data = event.transaction.input;
    tx.gasUsed = event.transaction.gasUsed;
    tx.gasPrice = event.transaction.gasPrice;
    tx.refundAddress = event.params.refundAddress;
    tx.refundFee = event.params.refundFee;
    tx.metaSuccess = true;
    tx.isMeta = false;

    var summary = getSummary();
    summary.txCount.plus(BigInt.fromI32(1))
    var feePaid = event.transaction.gasPrice.toBigDecimal().div(BIG_DECIMAL_1E18).times(event.transaction.gasUsed.toBigDecimal())
    var refundFee = event.params.refundFee.toBigDecimal().div(BIG_DECIMAL_1E18)
    summary.feePaid.plus(feePaid)
    summary.feeCollected.plus(refundFee)
    summary.save();

    tx.save();
}

export function handleBlock(block: ethereum.Block): void {
    var summary = getSummary();
    summary.currentBlock = block.number;
    summary.save();
}

export function onDeposit(deposit: Deposit): void {
    var summary = getSummary();
    summary.totalBalance = summary.totalBalance.plus(deposit.params.value.toBigDecimal().div(BIG_DECIMAL_1E18))
    summary.save()
}

export function onInvoked(invoked: Invoked): void {
    var summary = getSummary();
    summary.totalBalance = summary.totalBalance.minus(invoked.params.value.toBigDecimal().div(BIG_DECIMAL_1E18))
    summary.save()
}