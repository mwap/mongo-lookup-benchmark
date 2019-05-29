const _ = require('lodash');
const assert = require('assert');
const uuidv4 = require('uuid/v4');

const { SIDE_PROP_VALUE = '', OUTER_COLLECTION_NAME = '', INNER_COLLECTION_NAME = '' } = require('./consts');
const getDbConnection = require('./get-db-connection');

class Scenario {
  constructor(scenarioDescriptor, name = '') {
    this.scenarioId = uuidv4();
    this.scenarioDescriptor = scenarioDescriptor;
    this.dbName = `mongo_benchmark_${this.scenarioId}`;
    this.db = null;
    this.implementations = [];
    this.name = name;
  }

  linkImplementation(implementation) {
    this.implementations.push(implementation);
  }

  getLabel() {
    return `${this.name} (${this.scenarioDescriptor.getLabel()})`;
  }

  async prepareDb() {
    assert(!this.db);
    const dbConnection = await getDbConnection(this.dbName);
    this.db = dbConnection.db();

    const makeSideProps = propNames => {
      const pairs = propNames.map(propName => [
        propName,
        SIDE_PROP_VALUE,
      ]);
      return _.fromPairs(pairs)
    };

    const outerDocGen = () => {
      const docBase = {};
      const sideProps = makeSideProps(this.scenarioDescriptor.outerSideProps);
      return {
        ...docBase,
        ...sideProps,
      };
    };

    const outerDocs = _.range(this.scenarioDescriptor.outerDocsNum).map(outerDocGen);
    await this.db.collection(OUTER_COLLECTION_NAME).insertMany(outerDocs);

    const innerDocGen = () => {
      const docBase = {};
      const sideProps = makeSideProps(this.scenarioDescriptor.innerSideProps);
      const refs = _.range(this.scenarioDescriptor.refListSize).map(() => {
        const outerDocIdx = _.random(0, this.scenarioDescriptor.outerDocsNum - 1);
        const _id = _.get(outerDocs, [outerDocIdx, '_id']);
        return { _id };
      });
      return {
        ...docBase,
        ...sideProps,
        refs,
      };
    };

    const innerDocs = _.range(this.scenarioDescriptor.innerDocsNum).map(innerDocGen);
    await this.db.collection(INNER_COLLECTION_NAME).insertMany(innerDocs);
  }

  async run() {
    assert(this.db);
    const injections = {
      innerCollection: this.db.collection('inner'),
      outerCollection: this.db.collection('outer'),
      outerCollectionName: 'outer',
      innerSideProps: this.scenarioDescriptor.innerSideProps,
    };

    const implementationNames = this.implementations.map(i => i.name);
    const execTimes = await this.implementations.reduce(async (semaphore, implementation) => {
      const execTimes = await semaphore;
      const startTime = process.hrtime();
      const r = await implementation.run(injections);
      const execTime = process.hrtime(startTime);
      return [execTime, ...execTimes];
    }, Promise.resolve([]));
    return _.zipObject(implementationNames, execTimes);
  }

  async cleanUp() {
    if (this.db) {
      return this.db.dropDatabase();
    }
    return Promise.resolve();
  }
}

module.exports = Scenario;
