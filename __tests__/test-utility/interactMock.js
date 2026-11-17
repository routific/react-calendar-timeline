/**
 * Stand-in for interactjs that records what the timeline registers, for use with
 * `jest.mock('interactjs', () => require('test-utility/interactMock').createInteractMock())`.
 *
 * - `interact.live`: elements with a registered (not yet unset) interactable
 * - `interact.created`: number of interactables created
 * - `interact.handlersFor(el)`: event handlers registered with `.on()` for an element
 * - `interact.dynamicDrop`: jest.fn getter/setter backed by `interact.dynamicDropValue`
 */
export function createInteractMock() {
  const live = new Set();
  const handlers = new Map();
  let created = 0;

  const interactable = el => {
    if (!live.has(el)) {
      live.add(el);
      created += 1;
      interactMock.created = created;
    }
    const api = {
      dropzone: () => api,
      resizable: () => api,
      draggable: () => api,
      styleCursor: () => api,
      on(types, fn) {
        const forEl = handlers.get(el) || {};
        types.split(' ').forEach(type => {
          forEl[type] = (forEl[type] || []).concat(fn);
        });
        handlers.set(el, forEl);
        return api;
      },
      unset() {
        live.delete(el);
        handlers.delete(el);
      },
    };
    return api;
  };

  const interactMock = jest.fn(interactable);
  interactMock.live = live;
  interactMock.created = 0;
  interactMock.dynamicDropValue = false;
  interactMock.dynamicDrop = jest.fn(value => {
    if (value === undefined) {
      return interactMock.dynamicDropValue;
    }
    interactMock.dynamicDropValue = value;
    return interactMock;
  });
  interactMock.handlersFor = el => handlers.get(el) || {};
  /** Fires every handler registered for `type` on `el`. */
  interactMock.fire = (el, type, event = {}) => {
    const fullEvent = { stopPropagation() {}, pageX: 0, ...event };
    (handlers.get(el) || {})[type]?.forEach(fn => fn(fullEvent));
  };
  interactMock.reset = () => {
    live.clear();
    handlers.clear();
    created = 0;
    interactMock.created = 0;
    interactMock.dynamicDropValue = false;
    interactMock.dynamicDrop.mockClear();
  };
  return interactMock;
}
