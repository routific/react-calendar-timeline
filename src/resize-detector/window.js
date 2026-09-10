/**
 * Attach a resize listener to a component. When an element is provided and
 * ResizeObserver is available, observes the element directly (catches both
 * window and container-level resizes). Falls back to window 'resize' event
 * in SSR / jsdom / environments without ResizeObserver.
 */
const listeners = new WeakMap();

function addListener(component, element) {
  if (listeners.has(component)) {
    removeListener(component);
  }

  if (element && typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const borderBox = entry.borderBoxSize && entry.borderBoxSize[0];
      const containerWidth = borderBox
        ? Math.round(borderBox.inlineSize)
        : Math.round(entry.contentRect.width);
      component.resize(undefined, containerWidth);
    });
    observer.observe(element, { box: 'border-box' });
    listeners.set(component, { observer, windowListener: null });
  } else {
    const handler = () => component.resize();
    window.addEventListener('resize', handler);
    listeners.set(component, { observer: null, windowListener: handler });
  }
}

function removeListener(component) {
  const entry = listeners.get(component);
  if (!entry) return;
  if (entry.observer) {
    entry.observer.disconnect();
  }
  if (entry.windowListener) {
    window.removeEventListener('resize', entry.windowListener);
  }
  listeners.delete(component);
}

export default { addListener, removeListener };
