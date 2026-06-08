/**
 * Platform Adapters Index
 *
 * Import this file to register all platform adapters with the sync engine.
 * Each adapter auto-registers itself via registerAdapter() on import.
 */

import './googleAdsAdapter';
import './metaAdsAdapter';
import './tiktokAdsAdapter';

export { default as googleAdsAdapter } from './googleAdsAdapter';
export { default as metaAdsAdapter } from './metaAdsAdapter';
export { default as tiktokAdsAdapter } from './tiktokAdsAdapter';
