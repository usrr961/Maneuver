/**
 * Advanced compression utilities for QR code data transfer
 * Implements Phase 3 compression techniques from QR Enhancement Roadmap
 */

import * as pako from 'pako';
import type { ScoutingEntry, ScoutingDataEntry, ScoutingDataCollection } from './scoutingTypes';

// Re-export types for consumers of this module
export type { ScoutingEntry, ScoutingDataEntry, ScoutingDataCollection };

// Export local interfaces for external type safety
export interface CompressedEntry {
  id?: string;
  a?: number; // alliance
  s?: number; // scouter (dictionary index)
  sf?: string; // scouter (fallback full string)
  e?: number; // event (dictionary index)
  ef?: string; // event (fallback full string)
  m?: string; // matchNumber
  t?: string; // selectTeam
  p?: number; // start positions (bit packed)
  ac?: number[]; // auto coral counts
  ao?: number[]; // auto other counts
  aa?: number[]; // auto algae counts
  tc?: number[]; // teleop coral counts
  ta?: number[]; // teleop algae counts
  g?: number; // endgame booleans (bit packed)
  c?: string; // comment
}

// Local interfaces for compression

interface CompressedData {
  meta: {
    compressed: boolean;
    version: string;
    scouterDict: string[];
  };
  entries: CompressedEntry[];
}

// Compression dictionaries
const ALLIANCE_DICT = {
  'redAlliance': 0,
  'blueAlliance': 1
} as const;

export const EVENT_DICT = Object.freeze({
  '2025pawar': 0,
  '2025mrcmp': 1,
  '2025txhou': 2,
  '2025casd': 3,
  '2025idbo': 4,
  '2025njfla': 5,
  '2025ontor': 6
} as const);

// Dictionary interfaces for type safety
interface ScouterDictionaries {
  scouterDict: { [key: string]: number };
  scouterReverse: string[];
}

/**
 * Type guard to check if data is a scouting data collection
 */
export function isScoutingDataCollection(data: unknown): data is ScoutingDataCollection {
  return data !== null && 
         typeof data === 'object' && 
         'entries' in data && 
         Array.isArray((data as ScoutingDataCollection).entries);
}

/**
 * Build dynamic scouter dictionary from data
 */
function buildScouterDict(data: ScoutingDataEntry[]): ScouterDictionaries {
  const scouters = new Set<string>();
  
  // Collect all unique scouter initials from entries
  data.forEach(entry => {
    // Handle both flat entries and nested structure with data property
    const scoutingData: Partial<ScoutingEntry> = entry.data || (entry as unknown as ScoutingEntry);
    if (scoutingData.scouterInitials && typeof scoutingData.scouterInitials === 'string') {
      scouters.add(scoutingData.scouterInitials);
    }
  });
  
  // Build dictionary
  const scouterDict: { [key: string]: number } = {};
  const scouterReverse: string[] = Array.from(scouters);
  scouterReverse.forEach((scouter, index) => {
    scouterDict[scouter] = index;
  });
  
  if (import.meta.env.DEV) {
    const previewCount = 5;
    const preview = scouterReverse.slice(0, previewCount);
    console.log(
      `📊 Built scouter dictionary: ${scouterReverse.length} unique scouters. First ${preview.length}:`,
      preview,
      scouterReverse.length > previewCount ? '...' : ''
    );
  }
  
  return { scouterDict, scouterReverse };
}





/**
 * Smart compression using JSON optimization + gzip
 * Preserves original IDs and provides excellent compression ratios
 */
export function compressScoutingData(data: ScoutingDataCollection | ScoutingDataEntry[], originalJson?: string): Uint8Array {
  if (import.meta.env.DEV) {
    console.log('🔄 Starting smart compression...');
  }
  
  const startTime = performance.now();
  // Cache JSON string to avoid duplicate serialization
  const jsonString = originalJson || JSON.stringify(data);
  const originalSize = jsonString.length;
  
  // Extract entries array from various possible formats
  let entries: ScoutingDataEntry[] = [];
  if (Array.isArray(data)) {
    // Handle case where data is directly an array
    entries = data;
  } else if (data && typeof data === 'object' && 'entries' in data && Array.isArray(data.entries)) {
    entries = data.entries;
  } else {
    console.error('Invalid data format for compression');
    throw new Error('Invalid data format for compression');
  }
  
  // Build scouter dictionary from data
  const { scouterDict, scouterReverse } = buildScouterDict(entries);
  
  // Compress entries using smart JSON optimization
  const compressedEntries = entries.map((entry: ScoutingDataEntry, index: number) => {
    // Handle both flat entries and nested structure with data property
    const scoutingData: Partial<ScoutingEntry> = entry.data || (entry as unknown as ScoutingEntry);
    
    if (import.meta.env.DEV && index === 0) {
      console.log(`🔍 Sample entry structure:`, entry);
      console.log(`🔍 Sample scouting data keys:`, Object.keys(scoutingData || {}));
      console.log(`🔍 Sample scoring fields:`, {
        autoCoralL1: scoutingData?.autoCoralPlaceL1Count,
        teleopCoralL1: scoutingData?.teleopCoralPlaceL1Count,
        autoAlgaeNet: scoutingData?.autoAlgaePlaceNetShot,
        teleopAlgaeNet: scoutingData?.teleopAlgaePlaceNetShot,
        autoPassedStartLine: scoutingData?.autoPassedStartLine
      });
    }
    
    const optimized: Record<string, unknown> = {};
    
    // Preserve original ID - this ensures decompression can restore exact same IDs
    if (entry.id) optimized.id = entry.id;
    
    // Use dictionary compression for categorical fields
    if (scoutingData.alliance) optimized.a = ALLIANCE_DICT[scoutingData.alliance as keyof typeof ALLIANCE_DICT];
    if (scoutingData.scouterInitials && scouterDict[scoutingData.scouterInitials] !== undefined) {
      optimized.s = scouterDict[scoutingData.scouterInitials];
    } else if (scoutingData.scouterInitials) {
      optimized.sf = scoutingData.scouterInitials; // fallback to full string
    }
    if (scoutingData.eventName && EVENT_DICT[scoutingData.eventName as keyof typeof EVENT_DICT] !== undefined) {
      optimized.e = EVENT_DICT[scoutingData.eventName as keyof typeof EVENT_DICT];
    } else if (scoutingData.eventName) {
      optimized.ef = scoutingData.eventName; // fallback
    }
    
    // Compress field names and pack counts efficiently
    if (scoutingData.matchNumber) optimized.m = scoutingData.matchNumber;
    if (scoutingData.selectTeam) optimized.t = scoutingData.selectTeam;
    
    // Pack boolean start positions as a single number
    const poses = (scoutingData.startPoses0 ? 1 : 0) | (scoutingData.startPoses1 ? 2 : 0) | 
                  (scoutingData.startPoses2 ? 4 : 0) | (scoutingData.startPoses3 ? 8 : 0) | 
                  (scoutingData.startPoses4 ? 16 : 0) | (scoutingData.startPoses5 ? 32 : 0);
    if (poses > 0) optimized.p = poses;
    
    // Pack auto coral counts as array (only non-zero values)
    const autoCoral = [
      scoutingData.autoCoralPlaceL1Count || 0, scoutingData.autoCoralPlaceL2Count || 0,
      scoutingData.autoCoralPlaceL3Count || 0, scoutingData.autoCoralPlaceL4Count || 0
    ];
    if (autoCoral.some(c => c > 0)) optimized.ac = autoCoral;
    
    // Pack other auto counts efficiently
    const autoOther = [
      scoutingData.autoCoralPlaceDropMissCount || 0, scoutingData.autoCoralPickPreloadCount || 0,
      scoutingData.autoCoralPickStationCount || 0, scoutingData.autoCoralPickMark1Count || 0,
      scoutingData.autoCoralPickMark2Count || 0, scoutingData.autoCoralPickMark3Count || 0
    ];
    if (autoOther.some(c => c > 0)) optimized.ao = autoOther;
    
    // Pack auto algae counts
    const autoAlgae = [
      scoutingData.autoAlgaePlaceNetShot || 0, scoutingData.autoAlgaePlaceProcessor || 0,
      scoutingData.autoAlgaePlaceDropMiss || 0, scoutingData.autoAlgaePlaceRemove || 0,
      scoutingData.autoAlgaePickReefCount || 0
    ];
    if (autoAlgae.some(c => c > 0)) optimized.aa = autoAlgae;
    
    // Pack teleop coral counts
    const teleopCoral = [
      scoutingData.teleopCoralPlaceL1Count || 0, scoutingData.teleopCoralPlaceL2Count || 0,
      scoutingData.teleopCoralPlaceL3Count || 0, scoutingData.teleopCoralPlaceL4Count || 0,
      scoutingData.teleopCoralPlaceDropMissCount || 0, scoutingData.teleopCoralPickStationCount || 0,
      scoutingData.teleopCoralPickCarpetCount || 0
    ];
    if (teleopCoral.some(c => c > 0)) optimized.tc = teleopCoral;
    
    // Pack teleop algae counts
    const teleopAlgae = [
      scoutingData.teleopAlgaePlaceNetShot || 0, scoutingData.teleopAlgaePlaceProcessor || 0,
      scoutingData.teleopAlgaePlaceDropMiss || 0, scoutingData.teleopAlgaePlaceRemove || 0,
      scoutingData.teleopAlgaePickReefCount || 0, scoutingData.teleopAlgaePickCarpetCount || 0
    ];
    if (teleopAlgae.some(c => c > 0)) optimized.ta = teleopAlgae;
    
    // Pack endgame booleans efficiently (including autoPassedStartLine in bit 64)
    let endgamePacked = 0;
    if (scoutingData.shallowClimbAttempted) endgamePacked |= 1;
    if (scoutingData.deepClimbAttempted) endgamePacked |= 2;
    if (scoutingData.parkAttempted) endgamePacked |= 4;
    if (scoutingData.climbFailed) endgamePacked |= 8;
    if (scoutingData.playedDefense) endgamePacked |= 16;
    if (scoutingData.brokeDown) endgamePacked |= 32;
    if (scoutingData.autoPassedStartLine) endgamePacked |= 64;
    if (endgamePacked > 0) optimized.g = endgamePacked;
    
    // Keep comment
    if (scoutingData.comment) optimized.c = scoutingData.comment;
    
    return optimized;
  });
  
  // Create final compressed structure with metadata
  const compressedStructure = {
    meta: {
      compressed: true,
      version: '1.0',
      scouterDict: scouterReverse
    },
    entries: compressedEntries
  };
  
  // Apply gzip compression to the optimized JSON
  const optimizedJson = JSON.stringify(compressedStructure);
  const gzipCompressed = pako.gzip(optimizedJson);
  const finalSize = gzipCompressed.length;
  
  const compressionTime = performance.now() - startTime;
  const totalReduction = ((1 - finalSize / originalSize) * 100).toFixed(1);
  const jsonReduction = ((1 - optimizedJson.length / originalSize) * 100).toFixed(1);
  
  if (import.meta.env.DEV) {
    console.log(`✅ Smart compression: ${originalSize} → ${finalSize} bytes (${totalReduction}% total reduction)`);
    console.log(`📊 JSON optimization: ${originalSize} → ${optimizedJson.length} bytes (${jsonReduction}% reduction)`);
    console.log(`🗜️ Gzip final: ${optimizedJson.length} → ${finalSize} bytes`);
    console.log(`⏱️ Compression time: ${compressionTime.toFixed(1)}ms`);
  }

  return gzipCompressed;
}

/**
 * Decompress scouting data (partial decompression only)
 * Note: This function only performs gzip decompression and returns compressed entries.
 * For full expansion to ScoutingEntry format, use UniversalFountainScanner.tsx which 
 * handles dictionary expansion and field reconstruction.
 */
export function decompressScoutingData(compressedData: Uint8Array): { entries: CompressedEntry[] } {
  if (import.meta.env.DEV) {
    console.log('🔄 Decompressing data...');
  }
  
  // Decompress gzip and parse JSON directly
  const binaryData = pako.ungzip(compressedData);
  const jsonString = new TextDecoder().decode(binaryData);
  const data = JSON.parse(jsonString) as CompressedData;
  
  // Note: This returns compressed entries, not fully expanded ScoutingEntry objects
  // Full decompression with dictionary expansion is handled in UniversalFountainScanner
  
  // Return compressed entries (or empty array if not present)
  return { entries: data.entries || [] };
}



/**
 * Check if data should use compression based on size
 * @param data - Data to check for compression eligibility
 * @param jsonString - Optional pre-computed JSON string to avoid duplicate serialization
 */
export function shouldUseCompression(data: unknown, jsonString?: string): boolean {
  const jsonSize = jsonString ? jsonString.length : JSON.stringify(data).length;
  // Use compression for datasets > 10KB to get meaningful size reductions
  return jsonSize > 10000;
}

/**
 * Get compression statistics for display
 * @param originalData - Original data object
 * @param compressedData - Compressed data
 * @param originalJson - Optional pre-computed JSON string to avoid duplicate serialization
 */
export function getCompressionStats(
  originalData: unknown, 
  compressedData: Uint8Array, 
  originalJson?: string
): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  estimatedQRReduction: string;
} {
  const originalSize = originalJson ? originalJson.length : JSON.stringify(originalData).length;
  const compressedSize = compressedData.length;
  const compressionRatio = compressedSize / originalSize;
  
  // Estimate QR code count reduction (rough calculation based on 2KB per QR code)
  const originalQRs = Math.ceil(originalSize / 2000);
  const compressedQRs = Math.ceil(compressedSize / 2000);
  const estimatedQRReduction = `~${originalQRs} → ${compressedQRs} codes`;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    estimatedQRReduction
  };
}
