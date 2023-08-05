import { Block, StargateClient } from '@cosmjs/stargate';
import { MsgRelayPayment } from '@lavanet/lavajs/main/codegen/pairing/tx';
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
  ChainRelayInfoForBlock,
  DecodedMessage,
  DecodedMessagesForBlock,
  ProcessedRelayInfo,
  TransactionsWrapper,
} from './types';
import { NUMBER_OF_PREVIOUS_HEIGHT_ENTRIES } from './constants';

/**
 * Takes a height number to return an array containing it and ten previous heights
 * @param {number} height number from which to retrieve previous heights
 * @returns {number[]} current height and ten previous heights
 */
export function getPreviousHeights(height: number): number[] {
  // We instantiate an empty number array
  const result: number[] = [];

  // We calculate height number of the earliest entry we want
  let previousHeight = height - NUMBER_OF_PREVIOUS_HEIGHT_ENTRIES;

  while (height >= previousHeight) {
    // And iterate until we have an array containing all number from earliest to current height
    result.push(previousHeight);
    previousHeight++;
  }

  // Then we return the array with current and previous heights
  return result;
}

/**
 * Parse through each height / block to decode relevant transactions and process relay information
 * @param {number[]} array of height numbers
 * @param {StargateClient} client to interact with Cosmos ecosystem
 * @returns {ChainRelayInfoForBlock[]} array of wrapper objects containing block height and relay information for each chain
 */
export async function getGroupedDataByChain(
  heights: number[],
  client: StargateClient,
): Promise<ChainRelayInfoForBlock[]> {
  // We fetch all blocks from each height, using Stargate client
  const blocks = await getBlocksFromHeights(heights, client!);

  // And iterate through each block to get all transactions for each
  const transactionsWrappers = await parseAndGetTransactions(blocks);

  // We decode the relevant messages on the each transaction and group them by block / height number
  const decodedMessagesForBlocks = decodeMessagesAndGroupPerBlock(transactionsWrappers);

  // Return an array of wrapper objects containing block height and relay information for each chain
  return groupDataByChain(decodedMessagesForBlocks);
}

/**
 * Gets block information for each height number provided
 * @param {number[]} array of height numbers
 * @param {StargateClient} client to interact with Cosmos ecosystem
 * @returns {Block[]} array of blocks containing encoded transaction information
 */
export async function getBlocksFromHeights(heights: number[], client: StargateClient): Promise<Block[]> {
  // We iterate through each height number, and return an array of blocks containing encoded transaction information
  return Promise.all(heights.map(async (h) => await client.getBlock(h)));
}

/**
 * Decodes transactions on each block
 * @param {Block[]} array of blocks containing encoded transaction information
 * @returns {TransactionsWrapper[]} array of wrappers containing height number and transactions for respective block
 */
export async function parseAndGetTransactions(blocks: Block[]): Promise<TransactionsWrapper[]> {
  // We iterate through each block, and return wrappers containing the height number and decoded transactions
  return (
    await Promise.all(
      blocks.map(async (block) => {
        return {
          height: block.header.height,
          txs: await decodeTransactionsFromBlock(block),
        };
      }),
    )
  ).flat(1);
}

/**
 * Decodes transactions in a specific block
 * @param {Block} block containing encoded transaction information
 * @returns {Tx[]} array of decoded transaction information
 */
function decodeTransactionsFromBlock(block: Block): Tx[] {
  // We iterate through all transactions in a block and decode them, returning the result
  return block.txs.map((tx) => Tx.decode(tx));
}

/**
 * Decodes relevant messages in each transaction
 * @param {TransactionsWrapper[]} array of wrapper objects containing height number and transactions for respective block
 * @returns {DecodedMessagesForBlock[]} array of wrapper objects containing height number and decoded messages from each transaction
 */
export function decodeMessagesAndGroupPerBlock(transactionsWrappers: TransactionsWrapper[]): DecodedMessagesForBlock[] {
  // We iterate through all transaction wrappers and decode relevant messages, returning the result
  return transactionsWrappers.map((wrapper) => decodeMessagesForBlock(wrapper));
}

/**
 * Decodes relevant messages from a respective transaction
 * @param {TransactionsWrapper} wrapper object containing height number and transactions for respective block
 * @returns {DecodedMessagesForBlock} wrapper object containing height number and decoded messages from each transaction
 */
function decodeMessagesForBlock({ height, txs }: TransactionsWrapper): DecodedMessagesForBlock {
  // We instantiate a wrapper object and give it the input height number, and an array of empty messages
  const result: DecodedMessagesForBlock = { height, messages: [] };

  // And iterate through each transaction from the block
  for (const tx of txs) {
    if (tx.body?.messages[0].typeUrl.includes('MsgRelayPayment')) {
      // If the message is relevant to the exercise (meaning the type must be MsgRelayPayment), we decode the message using lavajs module
      const decodedMsg = MsgRelayPayment.decode(tx.body?.messages[0].value);

      // And push decoded message into the messages array
      result.messages.push(decodedMsg);
    }
  }

  // Then return the populated object
  return result;
}

/**
 * Iterate through input wrapper objects to parse relay information and return new wrappers containing relay information
 * @param {DecodedMessagesForBlock[]} array of wrapper objects containing height number and decoded messages from each transaction
 * @returns {ChainRelayInfoForBlock[]} array of wrapper objects containing block height and relay information for each chain
 */
export function groupDataByChain(input: DecodedMessagesForBlock[]): ChainRelayInfoForBlock[] {
  // We iterate through each wrapper object
  return input.map(({ height, messages }) => {
    // Then group relay information by chain
    const relayInfo = groupRelayInfoByChain(messages);

    // And return object containing block height and relay info grouped by chain
    return { height: height, relayInfo };
  });
}

/**
 * Groups relay information by respective chain (specId)
 * @param {DecodedMessage[]} array of wrapper objects representing decoded messages that contain raw relay information
 * @returns {ProcessedRelayInfo[]} array of relay information per chain (sum of relayNum per unique specId)
 */
function groupRelayInfoByChain(messages: DecodedMessage[]): ProcessedRelayInfo[] {
  // We create an empty array for processed relay information
  const relayInfo: ProcessedRelayInfo[] = [];

  // And iterate through each message, and their respective relay information
  for (const message of messages) {
    for (const relay of message.relays) {
      // We try to find an entry with this relay info's specId in our initial array
      const existingEntry = relayInfo.find((entry) => entry.specId === relay.specId);

      if (!existingEntry) {
        // If an entry isn't found, we sum the relay numbers and push the current entry to the relay information array
        const relayNum = relay.relayNum.low + relay.relayNum.high;
        relayInfo.push({ specId: relay.specId, relayNum });
      } else {
        // If the entry exists, meaning we inserted it in a past iteration of the loop, we sum and update it's existing relay number
        existingEntry.relayNum += relay.relayNum.low + relay.relayNum.high;
      }
    }
  }

  // Return array of processed relay information
  return relayInfo;
}

/**
 * Process relay information from each block and groups it per unique chain
 * @param {ChainRelayInfoForBlock[]} array of wrapper objects containing block height and relay information for each chain
 * @returns {ProcessedRelayInfo[]} array of relay information per chain (sum of relayNum per unique specId)
 */
export function processChainRelayInfo(input: ChainRelayInfoForBlock[]): ProcessedRelayInfo[] {
  // We sort the original input, as well as filtering only the 20 latest block infos (if input length is bigger than 20)
  const orderedInputByBlock = maybeSliceAndSortArray(input);

  // We instantiate a map like object, to save unique entries by their specId
  const resultMap: { [key: string]: ProcessedRelayInfo } = {};

  // And iterate through each wrapper from the input, and their respective relay information
  for (const info of orderedInputByBlock) {
    for (const { specId, relayNum } of info.relayInfo) {
      if (!resultMap[specId]) {
        // If the processed relay info for the specId does not exist, we create a new entry
        resultMap[specId] = { specId, relayNum };
      } else {
        // If the processed relay info already exists, we update the relayNum by adding the current relayNum
        resultMap[specId].relayNum += relayNum;
      }
    }
  }

  // Convert the map of processed relay info objects to an array and return it
  return Object.values(resultMap);
}

/**
 * Slices 20 most recent wrappers from original array, and returns in descending order (by height number)
 * @param {ChainRelayInfoForBlock[]} array of wrapper object containing block height and relay information for each chain
 * @returns {ChainRelayInfoForBlock[]} most recent (maximum 20) wrappers, ordered by height number (descending)
 */
function maybeSliceAndSortArray(input: ChainRelayInfoForBlock[]): ChainRelayInfoForBlock[] {
  // We create a copy of the original input as to not mutate it, and sort by height number
  const mutableRef = Array.from(input).sort((a, b) => b.height - a.height);

  // If more than 20 entries exist in original input, we take only the first 20
  if (input.length > 20) {
    return mutableRef.slice(0, 20);
  }

  // Return ordered and sliced array
  return mutableRef;
}
