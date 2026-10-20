/**
 * Decimals kept after number arithmetic, to hide floating point noise
 * (0.1 + 0.2 → 0.3, not 0.30000000000000004). Enough for any kg step.
 */
export const MAX_DECIMALS = 3
