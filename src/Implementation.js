const _ = require('lodash');

class Implementation {
  constructor(name = '') {
    this.name = name;
  }

  async run() {
    return Promise.resolve();
  }
}

module.exports = Implementation;
