export type HapticType = 'tap' | 'success' | 'warning';

export const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  /** Crisp single pulse for primary button presses */
  tap: 12,
  /** Celebratory double pulse for completed transactions, payments & verifications */
  success: [18, 45, 30],
  /** Alert double pulse for SOS actions or validation warnings */
  warning: [30, 40, 30],
};

export interface HapticEnvironment {
  userAgent: string;
  userAgentDataMobile?: boolean;
  maxTouchPoints: number;
  hasCoarsePointer: boolean;
  viewportWidth: number;
  vibrate?: (pattern: number | number[]) => boolean;
}

const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

let hapticsEnabled = true;

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

/**
 * Pure, deterministic check for whether the current environment is a mobile device.
 * Ensures desktop browsers (including Chrome desktop which exposes navigator.vibrate)
 * never trigger vibration.
 */
export function isMobileEnvironment(env: HapticEnvironment): boolean {
  if (env.userAgentDataMobile === true) {
    return true;
  }
  if (MOBILE_UA_REGEX.test(env.userAgent)) {
    return true;
  }
  if (env.userAgentDataMobile === false) {
    return false;
  }
  return env.hasCoarsePointer && env.maxTouchPoints > 0 && env.viewportWidth <= 1024;
}

/**
 * Reads runtime browser capabilities safely (SSR / Node-safe).
 */
export function getRuntimeHapticEnvironment(): HapticEnvironment | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };

  const hasCoarsePointer =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;

  return {
    userAgent: nav.userAgent ?? '',
    userAgentDataMobile:
      typeof nav.userAgentData?.mobile === 'boolean'
        ? nav.userAgentData.mobile
        : undefined,
    maxTouchPoints: typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : 0,
    hasCoarsePointer,
    viewportWidth: window.innerWidth,
    vibrate:
      typeof nav.vibrate === 'function' ? nav.vibrate.bind(nav) : undefined,
  };
}

/**
 * Returns true if running on a mobile device that supports the Web Vibrate API.
 */
export function isHapticsSupported(env?: HapticEnvironment | null): boolean {
  const targetEnv = env === undefined ? getRuntimeHapticEnvironment() : env;
  if (!targetEnv || typeof targetEnv.vibrate !== 'function') {
    return false;
  }
  return isMobileEnvironment(targetEnv);
}

/**
 * Triggers haptic feedback via the Web Vibrate API when enabled and running on a mobile device.
 * Safely no-ops on desktop browsers or unsupported environments.
 */
export function triggerHaptic(
  type: HapticType = 'tap',
  env?: HapticEnvironment | null
): boolean {
  if (!hapticsEnabled) {
    return false;
  }
  const targetEnv = env === undefined ? getRuntimeHapticEnvironment() : env;
  if (!targetEnv || typeof targetEnv.vibrate !== 'function') {
    return false;
  }
  if (!isMobileEnvironment(targetEnv)) {
    return false;
  }

  try {
    targetEnv.vibrate(HAPTIC_PATTERNS[type]);
    return true;
  } catch {
    return false;
  }
}

export function hapticTap(): boolean {
  return triggerHaptic('tap');
}

export function hapticSuccess(): boolean {
  return triggerHaptic('success');
}

export function hapticWarning(): boolean {
  return triggerHaptic('warning');
}
