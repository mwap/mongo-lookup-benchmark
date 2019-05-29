const util = require('util');
const _ = require('lodash');
const convertHrtime = require('convert-hrtime');
const math = require('mathjs');

const mergeWithConcatCustomizer = require('./utils/merge-with-concat-customizer');

class Benchmark {
  constructor(opts = {}) {
    const { scenarioRepeats = 1 } = opts;
    this.scenarioRepeats = scenarioRepeats;
    this.scenarios = [];
    this.result = null;
    this.decoratedResult = null;
  }

  addScenario(scenario) {
    this.scenarios.push(scenario);
  }

  prepare() {
    return Promise.all(this.scenarios.map(s => s.prepareDb()));
  }

  decorateResult(benchmarkResult) {
    const decoratedScenariosPairs = _.map(benchmarkResult, (implementations, scenarioName) => {
      const decoratedImplementationsPairs = _.map(implementations, (implementationTimes = [], implementationName) => {
        const mean = math.mean(implementationTimes);
        const std = math.std(implementationTimes);
        const decoratedImplementation = {
          times: implementationTimes,
          mean,
          std,
        };
        return [implementationName, decoratedImplementation];
      });
      const decoratedImplementations = _.fromPairs(decoratedImplementationsPairs);
      const fastestImplementationMean = _.chain(decoratedImplementations)
        .map(v => v.mean)
        .filter(m => m > 0)
        .min()
        .value();
      const implementationRates = _.chain(decoratedImplementations)
        .map((v, name) => [
          name,
          v.mean / fastestImplementationMean,
        ])
        .sortBy(([name, ratio]) => ratio)
        .fromPairs()
        .value();
      const scenarioSummary = {
        implementations: decoratedImplementations,
        implementationRates,
      };
      return [scenarioName, scenarioSummary]
    });
    const decoratedScenarios = _.fromPairs(decoratedScenariosPairs);
    return decoratedScenarios;
  }

  printResult() {
    console.log(util.inspect(this.decoratedResult, { colors: true, depth: null }));
    return this;
  }

  async warmUp() {
    throw new Error();
  }

  async run() {
    const scenariosLabels = this.scenarios.map(s => s.getLabel());
    const scenariosResults = await this.scenarios.reduce(async (scenariosBase, scenario) => {
      const scenariosResults = await scenariosBase;
      const repeatsResults = await _.range(this.scenarioRepeats).reduce(async (repeatsBase, repeatIdx) => {
        const repeatsResults = await repeatsBase;
        const repeatResult = await scenario.run();
        return [...repeatsResults, repeatResult];
      }, Promise.resolve([]));
      // return [...scenariosResults, repeatsResults];
      return [...scenariosResults, repeatsResults.slice(1)];  //TODO: first repeat result seems to be super biased due to loading various modules for the first time
                                                              //TODO: implement warmUp() method removing that bias then remove the .slice(1) part
    }, Promise.resolve([]));

    const benchmarkResultArray = scenariosResults.map(scenarioRepeats => {
      const scenarioResult = scenarioRepeats.reduce((base, scenarioResult = {}) => { // := {ImplementationName0: [time0, ...], ...}
        const patchPairs = _.map(scenarioResult, (hrTime, implementationName) => {
          const msTime = convertHrtime(hrTime).milliseconds;
          return [implementationName, [msTime]];
        });
        const patch = _.fromPairs(patchPairs);
        return _.mergeWith(base, patch, mergeWithConcatCustomizer);
      }, {});
      return scenarioResult;
    });

    const benchmarkResult = _.zipObject(scenariosLabels, benchmarkResultArray);
    this.result = benchmarkResult;
    this.decoratedResult = this.decorateResult(benchmarkResult);
    return this;
  }

  cleanUp() {
    return Promise.all(this.scenarios.map(s => s.cleanUp()));
  }
}

module.exports = Benchmark;
