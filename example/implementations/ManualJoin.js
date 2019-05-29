const _ = require('lodash');

const Implementation = require('../../src/Implementation');

class ManualJoin extends Implementation {
  constructor() {
    super('ManualJoin');
  }

  async run({ innerCollection, outerCollection, outerCollectionName, innerSideProps }) {
    const innerQuery = {};
    const inners = await innerCollection.find(innerQuery).toArray();
    const outersRaw = await Promise.all(inners.map(async inner => {
      const { refs = [] } = inner;
      if (!refs.length) {
        return Promise.resolve();
      }
      const outersIds = refs.map(ref => ref._id);
      const outerQuery = {_id: { $in: outersIds } };
      const outers = await outerCollection.find(outerQuery).toArray();
      const bundle = {
        ...inner,
        outers,
      };
      return Promise.resolve(bundle);
    }));
    const outers = outersRaw.filter(_.identity);
    return outers;
  }
}

module.exports = ManualJoin;
