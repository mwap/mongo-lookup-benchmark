const _ = require('lodash');

function mergeWithConcatCustomizer(one, other) {
  if (_.isArray(one) && _.isArray(other)) {
    return _.concat(one, other);
  }
}

module.exports = mergeWithConcatCustomizer;
