import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

const ignoredMessagePatterns = [
  /Support for defaultProps will be removed from function components/,
  /ReactDOM.render is no longer supported in React 18/,
  /unmountComponentAtNode is no longer supported in React 18/,
  /findDOMNode is deprecated/,
  /legacy childContextTypes API/,
  /legacy contextTypes API/,
  /An update to .* inside a test was not wrapped in act/,
  /Warning: An update to %s inside a test was not wrapped in act/,
];

const shouldIgnore = message => {
  const text = String(message);
  return ignoredMessagePatterns.some(pattern => pattern.test(text));
};

global.console.error = (...args) => {
  if (shouldIgnore(args[0])) {
    return;
  }
  throw new Error(args.map(String).join(' '));
};

global.console.warn = (...args) => {
  if (shouldIgnore(args[0])) {
    return;
  }
  throw new Error(args.map(String).join(' '));
};
