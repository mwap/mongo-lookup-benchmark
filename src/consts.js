const _ = require('lodash');

module.exports = {
  SIDE_PROP_VALUE: _.range(500).map(() => 'A').join(''),
  OUTER_COLLECTION_NAME: 'outer',
  INNER_COLLECTION_NAME: 'inner',
};
