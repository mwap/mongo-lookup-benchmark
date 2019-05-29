const _ = require('lodash');
const assert = require('assert');

const ScenarioDescriptor = require('./ScenarioDescriptor');

const rangify = function () {
  return _.range(this.min, this.max + 1)
    .filter(n => (n - this.min) % this.step === 0);
};

class ScenarioDescriptorsFactory {
  constructor() {
    this.innerDocsNumRange = { min: 1, max: 1, step: 1, rangify };
    this.outerDocsNumRange = { min: 1, max: 1, step: 1, rangify };
    this.refListSizeRange = { min: 1, max: 1, step: 1, rangify };
    this.innerSidePropsNumRange = { min: 1, max: 1, step: 1, rangify };
    this.outerSidePropsNumRange = { min: 1, max: 1, step: 1, rangify };
  }

  withInnerDocsInRange(nMin, nMax = nMin, step = 1) {
    assert(_.isNumber(nMin) && _.isNumber(nMax));
    this.innerDocsNumRange.min = nMin;
    this.innerDocsNumRange.max = nMax;
    this.innerDocsNumRange.step = step;
    return this;
  }

  withOuterDocsInRange(nMin, nMax = nMin, step = 1) {
    assert(_.isNumber(nMin) && _.isNumber(nMax));
    this.outerDocsNumRange.min = nMin;
    this.outerDocsNumRange.max = nMax;
    this.outerDocsNumRange.step = step;
    return this;
  }

  withRefsPerDocInRange(nMin, nMax = nMin, step = 1) {
    assert(_.isNumber(nMin) && _.isNumber(nMax));
    this.refListSizeRange.min = nMin;
    this.refListSizeRange.max = nMax;
    this.refListSizeRange.step = step;
    return this;
  }

  withInnerSidePropsInRange(nMin, nMax = nMin, step = 1) {
    assert(_.isNumber(nMin) && _.isNumber(nMax));
    this.innerSidePropsNumRange.min = nMin;
    this.innerSidePropsNumRange.max = nMax;
    this.innerSidePropsNumRange.step = step;
    return this;
  }

  withOuterSidePropsInRange(nMin, nMax = nMin, step = 1) {
    assert(_.isNumber(nMin) && _.isNumber(nMax));
    this.outerSidePropsNumRange.min = nMin;
    this.outerSidePropsNumRange.max = nMax;
    this.outerSidePropsNumRange.step = step;
    return this;
  }

  make() {
    return _.flattenDeep(
      this.innerDocsNumRange.rangify().map(innerDocsNum => {
        return this.outerDocsNumRange.rangify().map(outerDocsNum => {
          return this.refListSizeRange.rangify().map(refListSize => {
            return this.innerSidePropsNumRange.rangify().map(innerSidePropsNum => {
              return this.outerSidePropsNumRange.rangify().map(outerSidePropsNum => {
                return new ScenarioDescriptor()
                  .withInnerDocs(innerDocsNum)
                  .withOuterDocs(outerDocsNum)
                  .withRefsPerDoc(refListSize)
                  .withInnerSideProps(innerSidePropsNum)
                  .withOuterSideProps(outerSidePropsNum);
              });
            });
          });
        });
      }),
    );
  }
}

module.exports = ScenarioDescriptorsFactory;
