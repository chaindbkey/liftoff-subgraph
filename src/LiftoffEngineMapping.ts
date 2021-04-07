import { log, Bytes } from "@graphprotocol/graph-ts";
import { zero, addressZero } from "./utils/constants";
import { TokenSale, Ignitor } from "../generated/schema";
import {
  LaunchToken,
  Spark,
  Ignite,
  ClaimReward,
  ClaimRefund,
  UndoIgnite,
  UpdateEndTime
} from "../generated/LiftoffEngine/LiftoffEngine";

export function handleLaunchToken(event: LaunchToken): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale != null) {
    log.info("tokenSale exits {}", [tokenSaleId]);
    return;
  }

  tokenSale = new TokenSale(tokenSaleId);
  tokenSale.tokenId = event.params.tokenId;
  tokenSale.ipfsHash = "";
  tokenSale.startTime = event.params.startTime.toI32();
  tokenSale.endTime = event.params.endTime.toI32();
  tokenSale.softCap = event.params.softCap;
  tokenSale.hardCap = event.params.hardCap;
  tokenSale.totalSupply = event.params.totalSupply;
  tokenSale.totalIgnited = zero;
  tokenSale.rewardSupply = zero;
  tokenSale.dev = event.params.dev;
  tokenSale.deployed = Bytes.fromHexString(addressZero) as Bytes;
  tokenSale.pair = Bytes.fromHexString(addressZero) as Bytes;
  tokenSale.isSparked = false;
  tokenSale.name = event.params.name;
  tokenSale.symbol = event.params.symbol;

  tokenSale.save();
}

export function handleSpark(event: Spark): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  tokenSale.deployed = event.params.deployed;
  tokenSale.rewardSupply = event.params.rewardSupply;
  tokenSale.isSparked = true;

  tokenSale.save();
}

export function handleIgnite(event: Ignite): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  let igniteId =
    "ignite_" + tokenSaleId + "_" + event.params.igniter.toHexString();

  let igniter = Ignitor.load(igniteId);
  if (igniter == null) {
    igniter = new Ignitor(igniteId);
    igniter.ignited = zero;
    igniter.address = event.params.igniter;
    igniter.hasClaimed = false;
    igniter.hasRefunded = false;
    igniter.tokenSale = tokenSaleId;
  }

  igniter.ignited = igniter.ignited.plus(event.params.toIgnite);
  igniter.save();

  tokenSale.totalIgnited = tokenSale.totalIgnited.plus(event.params.toIgnite);
  tokenSale.save();
}

export function handleClaimReward(event: ClaimReward): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  let igniteId =
    "ignite_" + tokenSaleId + "_" + event.params.igniter.toHexString();
  let igniter = Ignitor.load(igniteId);

  if (igniter == null) {
    log.info("cannot find igniter {}", [igniteId]);
    return;
  }

  igniter.hasClaimed = true;
  igniter.save();
}

export function handleClaimRefund(event: ClaimRefund): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  let igniteId =
    "ignite_" + tokenSaleId + "_" + event.params.igniter.toHexString();
  let igniter = Ignitor.load(igniteId);

  if (igniter == null) {
    log.info("cannot find igniter {}", [igniteId]);
    return;
  }

  tokenSale.totalIgnited = tokenSale.totalIgnited.minus(igniter.ignited);
  tokenSale.save();

  igniter.ignited = zero;
  igniter.hasRefunded = true;
  igniter.save();
}

export function handleUpdateEndTime(event: UpdateEndTime): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  tokenSale.endTime = event.params.endTime.toI32();
  tokenSale.save();
}

export function handleUndoIgnite(event: UndoIgnite): void {
  let tokenSaleId = event.params._tokenSaleId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  let igniteId =
    "ignite_" + tokenSaleId + "_" + event.params.igniter.toHexString();
  let igniter = Ignitor.load(igniteId);

  if (igniter == null) {
    log.info("cannot find igniter {}", [igniteId]);
    return;
  }

  igniter.ignited = zero;
  igniter.save();

  tokenSale.totalIgnited = tokenSale.totalIgnited.minus(
    event.params.wadUnIgnited
  );
  tokenSale.save();
}
