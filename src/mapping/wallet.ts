import {WalletFactory, Wallet, Transaction, WalletBalance} from "../../generated/schema"
import {Initialized, TransactionExecuted, Deposit, Invoked} from "../../generated/Wallet/TOTPWallet"
import {TransactionExecuted as TransactionExecutedOld } from "../../generated/OldWallet/TOTPWallet"
import {getSummary} from "../entities";
import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Transfer } from "../../generated/ERC20/ERC20"
import { log } from '@graphprotocol/graph-ts'

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

    var wallet = Wallet.load(deposit.address.toHex())
    if (wallet != null) {
        wallet.balance = wallet.balance.plus(deposit.params.value);
        wallet.save()
    }
}

export function onInvoked(invoked: Invoked): void {
    var summary = getSummary();
    summary.totalBalance = summary.totalBalance.minus(invoked.params.value.toBigDecimal().div(BIG_DECIMAL_1E18))
    summary.save()
    
    var wallet = Wallet.load(invoked.address.toHex())
    if (wallet != null) {
        wallet.balance = wallet.balance.minus(invoked.params.value);
        wallet.save()
    }
}

function getBalance(wallet: string, token: Bytes): WalletBalance {
    var id = wallet + ":" + token.toHex();
    let bar = WalletBalance.load(id)
  
    if (bar == null) {
      bar = new WalletBalance(id);
      bar.balance = BIG_INT_ZERO
      bar.wallet = wallet
      bar.token = token
      bar.save()
    }
  
    return bar as WalletBalance
}

export function handleERC20Transfer(transfer: Transfer): void {
    var wallet = Wallet.load(transfer.params.from.toHex())
    //debit
    log.info("erc20transfer lookup {} value={} found={}", [transfer.params.from.toHex(), transfer.params.value.toString(), wallet.id])

    if(wallet != null) {
        var balance = getBalance(wallet.id, transfer.address)        
        balance.balance = balance.balance.minus(transfer.params.value)
        balance.save()
    }

    var walletTo = Wallet.load(transfer.params.to.toHex())
    //credit
    if(walletTo != null) {
        var balanceTo = getBalance(walletTo.id, transfer.address)        
        balanceTo.balance = balanceTo.balance.plus(transfer.params.value)
        balanceTo.save()
    }
}
