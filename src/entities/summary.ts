import {Summary} from "../../generated/schema"
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_INT_ZERO = BigInt.fromI32(0)

export function getSummary(): Summary {
    let bar = Summary.load("1")
  
    if (bar === null) {
      bar = new Summary('1');
      bar.walletCount = BIG_INT_ZERO
      bar.txCount = BIG_INT_ZERO
      bar.feePaid = BIG_DECIMAL_ZERO
      bar.feeCollected = BIG_DECIMAL_ZERO
      bar.currentBlock = BIG_INT_ZERO
      bar.totalBalance = BIG_DECIMAL_ZERO
      bar.save()
    }
  
    return bar as Summary
  }
  