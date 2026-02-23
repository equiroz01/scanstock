// This runs before jest-expo preset
// Polyfill structuredClone for Node < 17
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock expo winter modules globals
global.__ExpoImportMetaRegistry = {};
