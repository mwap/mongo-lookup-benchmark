const _ = require('lodash');

const Implementation = require('../../src/Implementation');

class SimpleLookup extends Implementation {
  constructor() {
    super('SimpleLookup');
  }

  async run({ innerCollection, outerCollectionName, innerSideProps }) {
    const project = _.fromPairs(innerSideProps.map(propName => [propName, {$first: `$${propName}`}]));
    const pipeline = [
      {
        $unwind: {
          path: '$refs',
        },
      },
      {
        $lookup: {
          from: outerCollectionName,
          localField: 'refs._id',
          foreignField: '_id',
          as: 'outer',
        },
      },
      {
        $unwind: {
          path: '$outer',
        },
      },
      {
        $group: {
          _id: '$_id',
          outers: {
            $push: '$outer',
          },
          ...project,
        },
      },
    ];

    return innerCollection.aggregate(pipeline).toArray();
  }
}

module.exports = SimpleLookup;
