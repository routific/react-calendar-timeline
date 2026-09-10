/**
 * Container resize detector — same ResizeObserver implementation as window.js.
 * Kept as a separate module for consumers that previously imported
 * `resize-detector/container` with element-resize-detector.
 */
export { default } from './window';
