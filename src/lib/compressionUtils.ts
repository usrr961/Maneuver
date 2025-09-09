/**
 * Advanced compression utilities for QR code data transfer
 * Implements Phase 3 compression techniques from QR Enhancement Roadmap
 */

import * as pako from 'pako';

// Type definitions
interface ScoutingEntry {
  matchNumber?: string;
  alliance?: 'redAlliance' | 'blueAlliance';
  scouterInitials?: string;
  selectTeam?: string;
  startPoses0?: boolean;
  startPoses1?: boolean;
  startPoses2?: boolean;
  startPoses3?: boolean;
  startPoses4?: boolean;
  startPoses5?: boolean;
  autoCoralPlaceL1Count?: number;
  autoCoralPlaceL2Count?: number;
  autoCoralPlaceL3Count?: number;
  autoCoralPlaceL4Count?: number;
  autoCoralPlaceDropMissCount?: number;
  autoCoralPickPreloadCount?: number;
  autoCoralPickStationCount?: number;
  autoCoralPickMark1Count?: number;
  autoCoralPickMark2Count?: number;
  autoCoralPickMark3Count?: number;
  autoAlgaePlaceNetShot?: number;
  autoAlgaePlaceNetMiss?: number;
  autoAlgaePlaceProcessorShot?: number;
  autoAlgaePlaceProcessorMiss?: number;
  autoAlgaePickGroundCount?: number;
  autoPassedStartLine?: boolean;
  teleopCoralPlaceL1Count?: number;
  teleopCoralPlaceL2Count?: number;
  teleopCoralPlaceL3Count?: number;
  teleopCoralPlaceL4Count?: number;
  teleopCoralPlaceDropMissCount?: number;
  teleopCoralPickStationCount?: number;
  teleopCoralPickGroundCount?: number;
  teleopAlgaePlaceNetShot?: number;
  teleopAlgaePlaceNetMiss?: number;
  teleopAlgaePlaceProcessorShot?: number;
  teleopAlgaePlaceProcessorMiss?: number;
  teleopAlgaePickStationCount?: number;
  teleopAlgaePickGroundCount?: number;
  teleopAlgaePickCarpetCount?: number;
  shallowClimbAttempted?: boolean;
  deepClimbAttempted?: boolean;
  parkAttempted?: boolean;
  climbFailed?: boolean;
  playedDefense?: boolean;
  brokeDown?: boolean;
  comment?: string;
  eventName?: string;
}

// Compression dictionaries
const ALLIANCE_DICT = {
  'redAlliance': 0,
  'blueAlliance': 1
} as const;

const EVENT_DICT = {
  '2025pawar': 0,
  '2025mrcmp': 1,
  '2025txhou': 2,
  '2025casd': 3,
  '2025idbo': 4,
  '2025njfla': 5,
  '2025ontor': 6
} as const;

// Dynamic scouter dictionary (built from data)
let SCOUTER_DICT: { [key: string]: number } = {};
let SCOUTER_REVERSE: string[] = [];

/**
 * Build dynamic scouter dictionary from data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildScouterDict(data: any[]): void {
  const scouters = new Set<string>();
  
  // Collect all unique scouter initials from entries
  data.forEach(entry => {
    // Handle both flat entries and nested structure with data property
    const scoutingData = entry.data || entry;
    if (scoutingData.scouterInitials && typeof scoutingData.scouterInitials === 'string') {
      scouters.add(scoutingData.scouterInitials);
    }
  });
  
  // Build dictionary
  SCOUTER_DICT = {};
  SCOUTER_REVERSE = Array.from(scouters);
  SCOUTER_REVERSE.forEach((scouter, index) => {
    SCOUTER_DICT[scouter] = index;
  });
  
  console.log(`📊 Built scouter dictionary: ${SCOUTER_REVERSE.length} unique scouters:`, SCOUTER_REVERSE);
}

/**
 * Pack boolean flags into a single byte
 * Up to 8 boolean values can be packed into 1 byte
 */
function packBooleans(booleans: boolean[]): number {
  let packed = 0;
  for (let i = 0; i < Math.min(booleans.length, 8); i++) {
    if (booleans[i]) {
      packed |= (1 << i);
    }
  }
  return packed;
}

/**
 * Advanced binary compression for scouting entries
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compressEntry(entry: any): Uint8Array {
  const data = entry.data || entry;
  const buffer = new ArrayBuffer(200); // Conservative estimate
  const view = new DataView(buffer);
  let offset = 0;
  
  const writeString = (str: string) => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    view.setUint16(offset, encoded.length, true);
    offset += 2;
    new Uint8Array(buffer, offset, encoded.length).set(encoded);
    offset += encoded.length;
  };
  
  // Write match number as string (variable length)
  writeString(entry.matchNumber || '');

  // Write alliance as compressed value (1 byte)
  const allianceCode = entry.alliance ? ALLIANCE_DICT[entry.alliance as keyof typeof ALLIANCE_DICT] ?? 255 : 255;
  view.setUint8(offset++, allianceCode);

  // Write scouter initials as dictionary index (1 byte if < 256 scouters)
  const scouterCode = entry.scouterInitials ? SCOUTER_DICT[entry.scouterInitials] ?? 255 : 255;
  view.setUint8(offset++, scouterCode);
  if (scouterCode === 255) {
    writeString(entry.scouterInitials || ''); // Fallback to full string
  }

  // Write team number as string
  writeString(entry.selectTeam || '');

  // Pack starting position booleans (6 booleans -> 1 byte)
  const startPoses = [
    entry.startPoses0, entry.startPoses1, entry.startPoses2,
    entry.startPoses3, entry.startPoses4, entry.startPoses5
  ].map(Boolean);
  view.setUint8(offset++, packBooleans(startPoses));

  // Write auto coral place counts (4 bytes for 4 counts, each 0-255)
  view.setUint8(offset++, Math.min(entry.autoCoralPlaceL1Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPlaceL2Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPlaceL3Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPlaceL4Count || 0, 255));

  // Write other auto counts
  view.setUint8(offset++, Math.min(entry.autoCoralPlaceDropMissCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPickPreloadCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPickStationCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPickMark1Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPickMark2Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoCoralPickMark3Count || 0, 255));

  // Write auto algae data
  view.setUint8(offset++, Math.min(entry.autoAlgaePlaceNetShot || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoAlgaePlaceNetMiss || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoAlgaePlaceProcessorShot || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoAlgaePlaceProcessorMiss || 0, 255));
  view.setUint8(offset++, Math.min(entry.autoAlgaePickGroundCount || 0, 255));

  // Write teleop coral counts
  view.setUint8(offset++, Math.min(entry.teleopCoralPlaceL1Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPlaceL2Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPlaceL3Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPlaceL4Count || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPlaceDropMissCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPickStationCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopCoralPickGroundCount || 0, 255));

  // Write teleop algae data
  view.setUint8(offset++, Math.min(entry.teleopAlgaePlaceNetShot || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePlaceNetMiss || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePlaceProcessorShot || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePlaceProcessorMiss || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePickStationCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePickGroundCount || 0, 255));
  view.setUint8(offset++, Math.min(entry.teleopAlgaePickCarpetCount || 0, 255));

  // Pack endgame booleans (7 booleans + autoPassedStartLine -> 1 byte)
  const endgameBools = [
    entry.shallowClimbAttempted, entry.deepClimbAttempted, entry.parkAttempted,
    entry.climbFailed, entry.playedDefense, entry.brokeDown, entry.autoPassedStartLine
  ].map(Boolean);
  view.setUint8(offset++, packBooleans(endgameBools));

  // Write comment as string
  writeString(entry.comment || '');

  // Write event name as compressed value
  const eventCode = entry.eventName ? EVENT_DICT[entry.eventName as keyof typeof EVENT_DICT] ?? 255 : 255;
  view.setUint8(offset++, eventCode);
  if (eventCode === 255) {
    writeString(entry.eventName || ''); // Fallback to full string
  }

  return new Uint8Array(buffer, 0, offset);
}

/**
 * Smart compression using JSON optimization + gzip
 * Preserves original IDs and provides excellent compression ratios
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compressScoutingData(data: any): Uint8Array {
  console.log('🔄 Starting smart compression...');
  
  const startTime = performance.now();
  const originalSize = JSON.stringify(data).length;
  
  // Extract entries array from various possible formats
  let entries: unknown[] = [];
  if (data.entries && Array.isArray(data.entries)) {
    entries = data.entries;
  } else if (Array.isArray(data)) {
    entries = data;
  } else {
    console.error('Invalid data format for compression');
    throw new Error('Invalid data format for compression');
  }
  
  // Build scouter dictionary from data
  buildScouterDict(entries);
  
  // Compress entries using smart JSON optimization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compressedEntries = entries.map((entry: any, index: number) => {
    // Handle both flat entries and nested structure with data property
    const scoutingData = entry.data || entry;
    
    if (index === 0) {
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
    
    // Preserve original ID if present
    if (entry.id) optimized.id = entry.id;
    
    // Use dictionary compression for categorical fields
    if (scoutingData.alliance) optimized.a = ALLIANCE_DICT[scoutingData.alliance as keyof typeof ALLIANCE_DICT];
    if (scoutingData.scouterInitials && SCOUTER_DICT[scoutingData.scouterInitials] !== undefined) {
      optimized.s = SCOUTER_DICT[scoutingData.scouterInitials];
    } else if (scoutingData.scouterInitials) {
      optimized.sf = scoutingData.scouterInitials; // fallback to full string
    }
    if (scoutingData.eventName && EVENT_DICT[scoutingData.eventName] !== undefined) {
      optimized.e = EVENT_DICT[scoutingData.eventName];
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
      scoutingData.autoAlgaePlaceNetShot || 0, scoutingData.autoAlgaePlaceNetMiss || 0,
      scoutingData.autoAlgaePlaceProcessorShot || 0, scoutingData.autoAlgaePlaceProcessorMiss || 0,
      scoutingData.autoAlgaePickGroundCount || 0
    ];
    if (autoAlgae.some(c => c > 0)) optimized.aa = autoAlgae;
    
    // Pack teleop coral counts
    const teleopCoral = [
      scoutingData.teleopCoralPlaceL1Count || 0, scoutingData.teleopCoralPlaceL2Count || 0,
      scoutingData.teleopCoralPlaceL3Count || 0, scoutingData.teleopCoralPlaceL4Count || 0,
      scoutingData.teleopCoralPlaceDropMissCount || 0, scoutingData.teleopCoralPickStationCount || 0,
      scoutingData.teleopCoralPickGroundCount || 0
    ];
    if (teleopCoral.some(c => c > 0)) optimized.tc = teleopCoral;
    
    // Pack teleop algae counts
    const teleopAlgae = [
      scoutingData.teleopAlgaePlaceNetShot || 0, scoutingData.teleopAlgaePlaceNetMiss || 0,
      scoutingData.teleopAlgaePlaceProcessorShot || 0, scoutingData.teleopAlgaePlaceProcessorMiss || 0,
      scoutingData.teleopAlgaePickStationCount || 0, scoutingData.teleopAlgaePickGroundCount || 0,
      scoutingData.teleopAlgaePickCarpetCount || 0
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
      scouterDict: SCOUTER_REVERSE
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
  
  console.log(`✅ Smart compression: ${originalSize} → ${finalSize} bytes (${totalReduction}% total reduction)`);
  console.log(`📊 JSON optimization: ${originalSize} → ${optimizedJson.length} bytes (${jsonReduction}% reduction)`);
  console.log(`🗜️ Gzip final: ${optimizedJson.length} → ${finalSize} bytes`);
  console.log(`⏱️ Compression time: ${compressionTime.toFixed(1)}ms`);

  return gzipCompressed;
}

/**
 * Decompress scouting data
 */
export function decompressScoutingData(compressedData: Uint8Array): { entries: ScoutingEntry[] } {
  console.log('🔄 Decompressing data...');
  
  // Decompress gzip
  const binaryData = pako.ungzip(compressedData);
  
  // Read header length
  const headerLength = new DataView(binaryData.buffer, binaryData.byteOffset).getUint32(0, true);
  let offset = 4;
  
  // Read and parse header
  const headerBytes = new Uint8Array(binaryData.buffer, binaryData.byteOffset + offset, headerLength);
  offset += headerLength;
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  
  // Restore scouter dictionary
  SCOUTER_REVERSE = header.scouterDict || [];
  SCOUTER_DICT = {};
  SCOUTER_REVERSE.forEach((scouter, index) => {
    SCOUTER_DICT[scouter] = index;
  });
  
  // Decompress entries (this is simplified - in reality we'd need to store entry lengths)
  // For now, we'll use a different approach or store length prefixes
  const entries: ScoutingEntry[] = [];
  
  // Note: This is a simplified version. In production, we'd need to store entry lengths
  // or use a different serialization approach for variable-length entries
  console.warn('⚠️ Decompression not fully implemented - this is a POC');
  
  return { entries };
}

/**
 * Check if data should use compression based on size
 */
export function shouldUseCompression(data: unknown): boolean {
  const jsonSize = JSON.stringify(data).length;
  // Use compression for datasets > 10KB to get meaningful size reductions
  return jsonSize > 10000;
}

/**
 * Get compression statistics for display
 */
export function getCompressionStats(originalData: unknown, compressedData: Uint8Array): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  estimatedQRReduction: string;
} {
  const originalSize = JSON.stringify(originalData).length;
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
