export function sel(selectorString) {
  return `[data-testid="${selectorString}"]`;
}

export function noop() {}

export function parsePxToNumbers(value) {
  return +value.replace('px', '');
}
