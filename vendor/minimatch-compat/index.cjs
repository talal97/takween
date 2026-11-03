// Older ESLint plugins call require('minimatch') directly. The patched matcher
// exports that same callable API as .minimatch; reuse it without retaining any
// of the vulnerable matching implementation. Explicit assignments also expose
// named exports to ESM consumers such as typescript-eslint.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Legacy CommonJS consumers require a callable export.
const modern = require('minimatch-modern');
module.exports = modern.minimatch;
module.exports.minimatch = modern.minimatch;
module.exports.Minimatch = modern.Minimatch;
module.exports.GLOBSTAR = modern.GLOBSTAR;
module.exports.sep = modern.sep;
module.exports.filter = modern.filter;
module.exports.defaults = modern.defaults;
module.exports.braceExpand = modern.braceExpand;
// eslint-plugin-import only uses makeRe(...).test(path). Modern minimatch no
// longer generates regexes; delegate that predicate to its bounded matcher.
module.exports.makeRe = (pattern, options) => {
  const matcher = new modern.Minimatch(pattern, options);
  return { test: (path) => matcher.match(path) };
};
module.exports.match = modern.match;
module.exports.escape = modern.escape;
module.exports.unescape = modern.unescape;
