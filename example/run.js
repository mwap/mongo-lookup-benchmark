const Scenario = require('../src/Scenario');
const ScenarioDescriptor = require('../src/ScenarioDescriptor');
const Benchmark = require('../src/Benchmark');
const SimpleLookup = require('./implementations/SimpleLookup');
const ManualJoin = require('./implementations/ManualJoin');

const benchmark = new Benchmark({ scenarioRepeats: 5 });

async function go() {
  const sd = new ScenarioDescriptor()
    .withInnerDocs(200)
    .withOuterDocs(200)
    .withRefsPerDoc(1)
    .withInnerSideProps(4)
    .withOuterSideProps(4);
  const s = new Scenario(sd, 'test');
  s.linkImplementation(new SimpleLookup());
  s.linkImplementation(new ManualJoin());

  const sd2 = new ScenarioDescriptor()
    .withInnerDocs(200)
    .withOuterDocs(800)
    .withRefsPerDoc(1)
    .withInnerSideProps(4)
    .withOuterSideProps(4);
  const s2 = new Scenario(sd2, 'test2');
  s2.linkImplementation(new SimpleLookup());
  s2.linkImplementation(new ManualJoin());

  benchmark.addScenario(s);
  benchmark.addScenario(s2);
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
