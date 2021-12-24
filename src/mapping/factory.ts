import { WalletFactory, Wallet } from "../../generated/schema";
import { CreateWallet } from "../../generated/WalletFactory/WalletFactory";
import { getSummary } from "../entities";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { WalletTemplate } from "../../generated/templates";

export function onCreateWallet(event: CreateWallet): void {
  const factoryHex = event.transaction.from.toHex();
  const walletAddress: Address = event.params.wallet;
  const walletAddressHex = walletAddress.toHex();
  const domain: Array<string> = event.params.domain;

  let factory = WalletFactory.load(factoryHex);
  if (factory == null) {
    factory = new WalletFactory(factoryHex);
    factory.save();
  }
  let wallet = new Wallet(walletAddressHex);
  wallet.factory = factoryHex;
  wallet.balance = BigInt.fromI32(0);
  wallet.domain = domain.slice(0, 2).join(".");

  wallet.save();

  log.info("NOBANK:NEW_WALLET={} factory={}", [walletAddressHex, factoryHex]);

  // for template
  WalletTemplate.create(walletAddress);

  var summary = getSummary();
  summary.walletCount = summary.walletCount.plus(BigInt.fromI32(1));
  summary.save();
}
