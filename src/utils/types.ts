import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

export type TransactionsWrapper = {
  height: number;
  txs: Tx[];
};

export type DecodedMessagesForBlock = {
  height: number;
  messages: DecodedMessage[];
};

export type DecodedMessage = {
  creator: string;
  relays: RawRelay[];
  descriptionString: string;
};

export type RawRelay = {
  specId: string;
  relayNum: RelayNum;
};

export type ProcessedRelayInfo = {
  specId: string;
  relayNum: number;
};

export type RelayNum = {
  low: number;
  high: number;
};

export type ChainRelayInfoForBlock = {
  height: number;
  relayInfo: ProcessedRelayInfo[];
};
