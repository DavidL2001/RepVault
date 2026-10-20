/**
 * Decimals kept after number arithmetic, to hide floating point noise
 * (0.1 + 0.2 → 0.3, not 0.30000000000000004). Enough for any kg step.
 */
export const MAX_DECIMALS = 3

/** Decimals shown for an estimated 1RM: it's an estimate, so "116.7 kg", not "116.667 kg". */
export const ONE_REP_MAX_DECIMALS = 1
