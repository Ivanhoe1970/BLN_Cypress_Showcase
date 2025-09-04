// Cypress constants integration - mirrors your actual app constants
// This file imports the centralized constants from your main application

// ── Gas Thresholds (extracted from your codebase) ──────────────────────
export const GAS_THRESHOLDS = {
    H2S: {
      HIGH: 20,    // ppm
      NORMAL: 0
    },
    CO: {
      HIGH: 25,    // ppm
      NORMAL: 0
    },
    O2: {
      ENRICHMENT: 23.5,  // %
      DEPLETION: 19.5,   // %
      NORMAL: 20.9       // %
    },
    LEL: {
      HIGH: 10,    // %
      NORMAL: 0
    }
  };
  
  // ── Timeouts (from your codebase patterns) ─────────────────────────────
  export const TIMEOUTS = {
    DEVICE_MESSAGE: 120000,           // 2 minutes in ms
    DEVICE_MESSAGE_EVACUATION: 300000, // 5 minutes in ms  
    DISPATCH_FOLLOWUP: 1800000,       // 30 minutes in ms (1800 seconds)
    LOCATION_MAX_AGE_MINUTES: 5,      // Location staleness threshold
    MOVING_MAX_SPEED_KMH: 5,          // Device movement threshold
    PRE_ALERT_THRESHOLD: 24 * 60 * 60 * 1000 // 24 hours in ms
  };
  
  // ── Log Format Validation Patterns ──────────────────────────────────────
  export const LOG_PATTERNS = {
    // Your exact format: [HH:mm:ss MST] Step X: <action>. <outcome> <note> | Op 417
    FULL_LOG_ENTRY: /^\[\d{2}:\d{2}:\d{2}\s(MST|MDT)\]\s+Step\s+\d+:\s+.+\.\s+.+\s+\|\s+Op\s+417$/,
    
    // Timestamp only: [HH:mm:ss MST]
    TIMESTAMP: /^\[\d{2}:\d{2}:\d{2}\s(MST|MDT)\]$/,
    
    // Step identifier: Step X:
    STEP_ID: /Step\s+\d+:/,
    
    // Op 417 suffix
    OP_417: /\|\s+Op\s+417$/
  };