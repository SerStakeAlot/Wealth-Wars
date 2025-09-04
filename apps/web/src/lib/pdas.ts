import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from "./anchorClient";

export const seeds = {
  config: Buffer.from("config"),
  amm: Buffer.from("amm"),
  policy: Buffer.from("policy"),
  treasuryAuth: Buffer.from("treasury_auth"),
  player: (owner: PublicKey) => [Buffer.from("player"), owner.toBuffer()],
  era: (config: PublicKey, stampLe8: Buffer) => [Buffer.from("era"), config.toBuffer(), stampLe8],
  playerEra: (era: PublicKey, owner: PublicKey) => [Buffer.from("player_era"), era.toBuffer(), owner.toBuffer()],
};

export function pdaConfig() {
  return PublicKey.findProgramAddressSync([seeds.config], PROGRAM_ID)[0];
}
export function pdaAmm() {
  return PublicKey.findProgramAddressSync([seeds.amm], PROGRAM_ID)[0];
}
export function pdaPolicy() {
  return PublicKey.findProgramAddressSync([seeds.policy], PROGRAM_ID)[0];
}
export function pdaTreasuryAuth() {
  return PublicKey.findProgramAddressSync([seeds.treasuryAuth], PROGRAM_ID)[0];
}
export function pdaPlayer(owner: PublicKey) {
  return PublicKey.findProgramAddressSync(seeds.player(owner), PROGRAM_ID)[0];
}
export function pdaEra(config: PublicKey, nowSec: number) {
  const le8 = Buffer.alloc(8);
  le8.writeBigInt64LE(BigInt(nowSec));
  return PublicKey.findProgramAddressSync(seeds.era(config, le8), PROGRAM_ID)[0];
}
export function pdaPlayerEra(era: PublicKey, owner: PublicKey) {
  return PublicKey.findProgramAddressSync(seeds.playerEra(era, owner), PROGRAM_ID)[0];
}
