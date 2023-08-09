import { useCallback, useEffect, useMemo, useState } from 'react';
import { StargateClient } from '@cosmjs/stargate';
import { INTERVAL_FOR_SYNC_DATA_IN_MILLISECONDS, LAVA_RPC } from './utils/constants';
import { getGroupedDataByChain, getPreviousHeights, processChainRelayInfo } from './utils/functions';
import { ChainRelayInfoForBlock, ProcessedRelayInfo } from './utils/types';
import Background from './components/Background';
import Header from './components/Header';
import Table from './components/Table';
import './App.css';

/**
 * Functional component to render main app page
 * @returns {JSX.Element} rendering of main app page
 */
const App = (): JSX.Element => {
  /**
   * Necessary app state
   * Custom types are further explained in `src/utils/functions.ts` documentation
   */
  const [client, setClient] = useState<StargateClient>();
  const [chainRelayInfoForBlock, setChainRelayInfoForBlock] = useState<ChainRelayInfoForBlock[]>([]);
  const [data, setData] = useState<ProcessedRelayInfo[]>([]);
  const [hasCalledBootstrap, setHasCalledBootstrap] = useState<boolean>(false);
  const [currentHeight, setCurrentHeight] = useState<number>();

  /**
   * Memoized value of whether the app should bootstrap initial data (regarding 20 most recent blocks) or not
   * @returns {boolean} boolean determining if app should do initial bootstrap or not
   */
  const isBootstrapRequired = useMemo((): boolean => {
    // We check if data array has no entries, chainRelayInfoForBlock has no entries, and currentHeight is null (not initialized)
    // And return if every one of those conditions are truthy
    return [data.length === 0, chainRelayInfoForBlock.length === 0, !currentHeight].every((truthy) => truthy);
  }, [data, chainRelayInfoForBlock, currentHeight]);

  /**
   * Memoized callback that sets currentHeight state and fetches relay information for each chain
   * @param {number[]} heights from which to fetch information
   * @returns {ChainRelayInfoForBlock[]} array of wrapper objects containing block height and relay information for each chain
   */
  const callGetGroupedDataByChain = useCallback(
    async (heights: number[]): Promise<ChainRelayInfoForBlock[]> => {
      // We set the most recent height (array should be ordered in a descending manner)
      setCurrentHeight(heights[0]);

      // If client isn't initialized, we return an empty array
      if (!client) return [];

      // We call method that parses through block data to decode relevant transactions and process relay information
      return getGroupedDataByChain(heights, client);
    },
    [client],
  );

  /**
   * Memoized callback that sets chainRelayInfoForBlock state, processes relay information from each block, groups it per unique chain and sets it to data state
   * @param {ChainRelayInfoForBlock[]} array of wrapper objects containing block height and relay information for each chain
   * @returns {void}
   */
  const callProcessChainRelayInfo = useCallback((data: ChainRelayInfoForBlock[]): void => {
    // We set the chain relay info state with the data we get as input
    setChainRelayInfoForBlock(data);

    // Process and group it per each unique chain
    const groupedData = processChainRelayInfo(data);

    // And set that as data to be rendered
    setData(groupedData);
  }, []);

  /**
   * Start up StargateClient
   */
  useEffect(() => {
    // We create function that starts up StargateClient and sets it to client state
    async function startStargateClient() {
      setClient(await StargateClient.connect(LAVA_RPC));
    }

    // And call it
    startStargateClient();

    // We create function that terminates client connection
    async function disconnectClient() {
      if (client) {
        client.disconnect();
      }
    }

    // And on component unmount, we make sure to close the connection
    return () => {
      disconnectClient();
    };
  }, [client]);

  /**
   * Fetch initial data
   */
  useEffect(() => {
    // We create function for bootstrapping necessary data for initial app load
    async function bootstrapData() {
      // If no bootstrap is required, or the client isn't initialized, we do an early return
      if (!isBootstrapRequired || !client) return;
      try {
        // We fetch the latest height from the client
        const latestHeight = await client.getHeight();

        // And proceed to get the previous 19 height numbers (since we want to display data for most recent 20 blocks)
        const heights = await getPreviousHeights(latestHeight);

        // We then proceed to get the data for each block / height
        const groupedDataByChain = await callGetGroupedDataByChain(heights);

        // Process it
        callProcessChainRelayInfo(groupedDataByChain);

        // And set this state to true, so we know app has been bootstrapped and this logic doesn't need to re-run
        setHasCalledBootstrap(true);
      } catch (e) {
        // We handle error by logging to console
        console.error('Error fetching data:', e);
      }
    }

    // We call the bootstrapping function
    bootstrapData();
  }, [client, data, isBootstrapRequired, callGetGroupedDataByChain, callProcessChainRelayInfo]);

  /**
   * Sync data
   */
  useEffect(() => {
    // We create function for syncing data when necessary
    const syncData = async () => {
      try {
        // If we haven't called bootstrapping function, or client isn't initialized, we do an early return
        if (!hasCalledBootstrap || !client) return;

        // We fetch the latest height from the client
        const latestHeight = await client.getHeight();

        // And only if the latest height is different from the current height we previously stored do we execute the flow for syncing data
        if (currentHeight !== latestHeight) {
          // We proceed to get the data for latest block / height
          const groupedDataByChain = await callGetGroupedDataByChain([latestHeight]);

          // And process it the previous collected data alongside the new entry for latest block
          const newRelayInfoForBlock = [...chainRelayInfoForBlock, ...groupedDataByChain];
          callProcessChainRelayInfo(newRelayInfoForBlock);
        }
      } catch (e) {
        // We handle error by logging to console
        console.error('Error fetching data:', e);
      }
    };

    // We set an interval to fetch data every X seconds
    const interval = setInterval(syncData, INTERVAL_FOR_SYNC_DATA_IN_MILLISECONDS);

    // And on component unmount, we make sure to clean up the interval
    return () => {
      clearInterval(interval);
    };
  }, [
    client,
    chainRelayInfoForBlock,
    currentHeight,
    callGetGroupedDataByChain,
    callProcessChainRelayInfo,
    hasCalledBootstrap,
  ]);

  return (
    <>
      <Header currentHeight={currentHeight} />
      <Table data={data} hasCalledBootstrap={hasCalledBootstrap} />
      <Background />
    </>
  );
};

export default App;
