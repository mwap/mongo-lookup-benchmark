const chai = require('chai');
const _ = require('lodash');

const mergeWithConcatCustomizer = require('./../../src/utils/merge-with-concat-customizer');

chai.should();
const { expect } = chai;

describe('Merge with concat', () => {
  it('should merge regular objects', () => {
    const o1 = {
      p1: 1,
      p2: 1,
    };

    const o2 = {
      p1: 2,
      p3: 2,
    };

    const r = _.mergeWith(o1, o2, mergeWithConcatCustomizer);
    expect(r).to.eql({
      p1: 2,
      p2: 1,
      p3: 2,
    });
  });

  it('should and concat objects with array props', () => {
    const o1 = {
      p1: [1],
      p2: [1],
    };

    const o2 = {
      p1: [2],
      p3: [2],
    };

    const r = _.mergeWith(o1, o2, mergeWithConcatCustomizer);
    expect(r).to.eql({
      p1: [1, 2],
      p2: [1],
      p3: [2],
    });
  });
});
