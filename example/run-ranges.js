const Scenario = require('../src/Scenario');
const Benchmark = require('../src/Benchmark');
const SimpleLookup = require('./implementations/SimpleLookup');
const ManualJoin = require('./implementations/ManualJoin');
const ScenarioDescriptorFactory = require('./../src/ScenarioDescriptorsFactory');

const benchmark = new Benchmark({ scenarioRepeats: 5 });

async function go() {
  const sdf = new ScenarioDescriptorFactory();
  const scenarioDescriptors = sdf
    .withInnerDocsInRange(5, 100, 5)
    .withOuterDocsInRange(200)
    .withInnerSidePropsInRange(3)
    .withOuterSidePropsInRange(3)
    .withRefsPerDocInRange(10)
    .make();

  const scenarios = scenarioDescriptors.map(sd => {
    const s = new Scenario(sd);
    s.linkImplementation(new SimpleLookup());
    s.linkImplementation(new ManualJoin());
    return s;
  });

  scenarios.forEach(s => benchmark.addScenario(s));
  await benchmark.prepare();
  await benchmark.run();
  benchmark.printResult();
  await benchmark.cleanUp();
}

go()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    benchmark.cleanUp().catch(console.error);
  });
