import { WalletFactory, Wallet } from "../../generated/schema";
// import { CreateWalletEvent } from "../../generated/WalletFactory/WalletFactory";
import { WalletCreated } from "../../generated/WalletFactory/WalletFactory";
import { getSummary } from "../entities";
import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { WalletTemplate } from "../../generated/templates";
import { WalletCreated as WalletCreatedOld } from "../../generated/WalletFactory2/WalletFactory";

function importEvent(wf: Address, walletAddr: Address): void {
  let factory = WalletFactory.load(wf.toHex());
  if (factory == null) {
    factory = new WalletFactory(wf.toHex());
    factory.save();
  }
  let wallet = new Wallet(walletAddr.toHex());
  wallet.factory = wf.toHex();
  wallet.balance = BigInt.fromI32(0);
  //   if (domain.length >= 2) {
  //     wallet.domain = domain.slice(0, 2).join(".");
  //   }
  wallet.save();

  log.info("SEF:NEW_WALLET={} factory={}", [walletAddr.toHex(), wf.toHex()]);

  // for template
  WalletTemplate.create(walletAddr);
  //   OldWallet.create(walletAddr);

  var summary = getSummary();
  summary.walletCount = summary.walletCount.plus(BigInt.fromI32(1));
  summary.save();
}
// export function onWalletCreatedWithDomain(event: WalletCreated): void {
//   importEvent(event.transaction.from, event.params.wallet, event.params.domain);
// }

// export function onWalletCreated(event: WalletCreatedOld): void {
//   importEvent(event.transaction.from, event.params.wallet, []);
// }

// export function onCreateWallet(event: CreateWalletEvent): void {
//   importEvent(event.transaction.from, event.params.wallet);
// }

export function onCreateWallet(event: WalletCreated): void {
  importEvent(event.transaction.from, event.params.wallet);
}
