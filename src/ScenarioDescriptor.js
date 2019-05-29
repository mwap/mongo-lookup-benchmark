const _ = require('lodash');
const assert = require('assert');

class ScenarioDescriptor {
  constructor() {
    this.innerDocsNum = 1;
    this.outerDocsNum = 1;
    this.refListSize = 1;
    this.innerSidePropsNum = 1;
    this.outerSidePropsNum = 1;
    this.innerSideProps = [];
    this.outerSideProps = [];
  }

  withInnerDocs(n) {
    assert(_.isNumber(n));
    this.innerDocsNum = n;
    return this;
  }

  withOuterDocs(n) {
    assert(_.isNumber(n));
    this.outerDocsNum = n;
    return this;
  }

  withRefsPerDoc(n) {
    assert(_.isNumber(n));
    this.refListSize = n;
    return this;
  }

  withInnerSideProps(n) {
    assert(_.isNumber(n));
    this.innerSidePropsNum = n;
    this.innerSideProps = _.range(n).map(idx => `side_prop_${idx}`);
    return this;
  }

  withOuterSideProps(n) {
    assert(_.isNumber(n));
    this.outerSidePropsNum = n;
    this.outerSideProps = _.range(n).map(idx => `side_prop_${idx}`);
    return this;
  }

  getLabel() {
    return `\
      ${this.innerDocsNum} inner docs;\
      ${this.outerDocsNum} outer docs;\
      ${this.refListSize} refs per doc;\
      ${this.innerSidePropsNum} inner side props;\
      ${this.outerSidePropsNum} outer side props;\
    `;
  }
}

module.exports = ScenarioDescriptor;
