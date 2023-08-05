/**
 * Ideally we would set Lava RPC endpoint as an environment variable as to not expose sensitive information in the code
 * But since the project should be plug-and-play, without any extra configuration, we kept it as a regular constant variable
 */
export const LAVA_RPC = 'https://g.w.lavanet.xyz:443/gateway/lav1/rpc-http/dd82ea1dbdb0ab61141ffbc68b8d22d3';

export const NUMBER_OF_PREVIOUS_HEIGHT_ENTRIES = 19;
export const INTERVAL_FOR_SYNC_DATA_IN_MILLISECONDS = 300;
export const MOBILE_VIEW_WIDTH = 768;
