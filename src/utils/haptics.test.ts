import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAPTIC_PATTERNS,
  HapticEnvironment,
  isHapticsSupported,
  isMobileEnvironment,
  setHapticsEnabled,
  triggerHaptic,
} from './haptics';

function createEnv(overrides: Partial<HapticEnvironment> = {}): HapticEnvironment {
  return {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    userAgentDataMobile: false,
    maxTouchPoints: 0,
    hasCoarsePointer: false,
    viewportWidth: 1440,
    vibrate: () => true,
    ...overrides,
  };
}

test('isMobileEnvironment returns false on desktop browsers even if vibrate API exists', () => {
  const desktopChrome = createEnv();
  assert.equal(isMobileEnvironment(desktopChrome), false);
  assert.equal(isHapticsSupported(desktopChrome), false);

  const desktopTouchscreen = createEnv({
    userAgentDataMobile: false,
    maxTouchPoints: 10,
    hasCoarsePointer: true,
    viewportWidth: 1280,
  });
  assert.equal(isMobileEnvironment(desktopTouchscreen), false);
});

test('isMobileEnvironment returns true on Android, iOS, and mobile UA-CH devices', () => {
  const android = createEnv({
    userAgent:
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    userAgentDataMobile: true,
    maxTouchPoints: 5,
    hasCoarsePointer: true,
    viewportWidth: 412,
  });
  assert.equal(isMobileEnvironment(android), true);
  assert.equal(isHapticsSupported(android), true);

  const iphone = createEnv({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    userAgentDataMobile: undefined,
    maxTouchPoints: 5,
    hasCoarsePointer: true,
    viewportWidth: 390,
  });
  assert.equal(isMobileEnvironment(iphone), true);
});

test('triggerHaptic invokes navigator.vibrate with expected patterns on mobile only', () => {
  setHapticsEnabled(true);
  const calls: Array<number | number[]> = [];
  const mobileEnv = createEnv({
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) Mobile Safari/537.36',
    userAgentDataMobile: true,
    maxTouchPoints: 5,
    hasCoarsePointer: true,
    viewportWidth: 412,
    vibrate: (pattern) => {
      calls.push(pattern);
      return true;
    },
  });

  assert.equal(triggerHaptic('tap', mobileEnv), true);
  assert.equal(triggerHaptic('success', mobileEnv), true);
  assert.equal(triggerHaptic('warning', mobileEnv), true);
  assert.deepEqual(calls, [
    HAPTIC_PATTERNS.tap,
    HAPTIC_PATTERNS.success,
    HAPTIC_PATTERNS.warning,
  ]);

  const desktopCalls: Array<number | number[]> = [];
  const desktopEnv = createEnv({
    vibrate: (pattern) => {
      desktopCalls.push(pattern);
      return true;
    },
  });
  assert.equal(triggerHaptic('tap', desktopEnv), false);
  assert.equal(triggerHaptic('success', desktopEnv), false);
  assert.equal(desktopCalls.length, 0);
});

test('triggerHaptic respects user preference toggle and gracefully handles missing/throwing vibrate', () => {
  const calls: Array<number | number[]> = [];
  const mobileEnv = createEnv({
    userAgentDataMobile: true,
    vibrate: (pattern) => {
      calls.push(pattern);
      return true;
    },
  });

  setHapticsEnabled(false);
  assert.equal(triggerHaptic('tap', mobileEnv), false);
  assert.equal(calls.length, 0);

  setHapticsEnabled(true);
  const noVibrateEnv = createEnv({
    userAgentDataMobile: true,
    vibrate: undefined,
  });
  assert.equal(triggerHaptic('success', noVibrateEnv), false);

  const throwingEnv = createEnv({
    userAgentDataMobile: true,
    vibrate: () => {
      throw new Error('Blocked by browser policy');
    },
  });
  assert.equal(triggerHaptic('tap', throwingEnv), false);
});
