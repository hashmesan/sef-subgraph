import {WalletFactory, Wallet, Transaction, WalletBalance, Transfer as TransferEntity, TransferSummary} from "../../generated/schema"
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
    tx.wallet = tx.to.toHex();

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
    tx.wallet = tx.to.toHex();

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
    tx.wallet = tx.to.toHex();

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
    summary.totalDeposits = summary.totalDeposits.plus(deposit.params.value.toBigDecimal().div(BIG_DECIMAL_1E18))
    summary.save()

    var wallet = Wallet.load(deposit.address.toHex())
    if (wallet != null) {
        wallet.balance = wallet.balance.plus(deposit.params.value);
        wallet.save()
    }
}

export function onInvoked(invoked: Invoked): void {
    var summary = getSummary();
    summary.totalWithdrawals = summary.totalWithdrawals.plus(invoked.params.value.toBigDecimal().div(BIG_DECIMAL_1E18))
    summary.save()
    
    var wallet = Wallet.load(invoked.address.toHex())
    if (wallet != null) {
        wallet.balance = wallet.balance.minus(invoked.params.value);
        wallet.save()
    }

    if(invoked.params.value.gt(BIG_INT_ZERO)) {
        let transfer = new TransferEntity(invoked.transaction.hash.toHex()  + "-" + invoked.logIndex.toString());
        transfer.transaction = invoked.transaction.hash.toHex();
        transfer.from = invoked.address;
        transfer.to = invoked.params.target;
        transfer.value = invoked.params.value;
        transfer.token = Address.fromString("0x0000000000000000000000000000000000000000");
        transfer.save();    
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

    if(wallet != null || walletTo != null) {
        if(transfer.params.value.gt(BIG_INT_ZERO)) {
            let tx = new TransferEntity(transfer.transaction.hash.toHex()  + "-" + transfer.logIndex.toString());
            tx.transaction = transfer.transaction.hash.toHex();
            tx.from = transfer.params.from;
            tx.to = transfer.params.to;
            tx.value = transfer.params.value;
            tx.token = transfer.address; 
            tx.save();    

            const summary_id = transfer.params.to.toHex() + "-" + transfer.address.toHex();
            let summary = TransferSummary.load(summary_id);
            if(summary == null) {
                summary = new TransferSummary(summary_id);
                summary.value = BIG_INT_ZERO;
                summary.token = transfer.address;
                summary.address = transfer.params.to;
            }
            summary.value = summary.value.plus(transfer.params.value);
            summary.save();
        } 
    }
}
