import chai from 'chai'
import {timestamp2datetime, date2index, index2date, day, normalize} from '../src/utils'

let expect = chai.expect

describe('utils.timestamp2datetime()', function () {
  it('exists', function () {
    expect(timestamp2datetime).to.be.a('function')
  })

  it('converts timestamp to date time', function () {
    let dt = timestamp2datetime(1392339723) // 2014-02-14 01:02:03

    expect(dt.year).to.equal(2014)
    expect(dt.month).to.equal(2)
    expect(dt.date).to.equal(14)
    expect(dt.hour).to.equal(1)
    expect(dt.minute).to.equal(2)
    expect(dt.second).to.equal(3)
  })
})

describe('utils.date2index()', function () {
  it('exists', function () {
    expect(date2index).to.be.a('function')
  })

  it('converts date to a index relative to Mar 01, 0', function () {
    expect(date2index(0, 3, 1)).to.equal(0)
    expect(date2index(0, 4, 1)).to.equal(31)
    expect(date2index(1, 3, 1)).to.equal(365)
    expect(date2index(1970, 1, 1)).to.equal(719468)
  })
})

describe('utils.index2date()', function () {
  it('exists', function () {
    expect(index2date).to.be.a('function')
  })

  it('converts an index relative to Mar 01, 0 to a date', function () {
    expect(index2date(0)).to.eql({year: 0, month: 3, date: 1})
    expect(index2date(719468)).to.eql({year: 1970, month: 1, date: 1})
  })
})

describe('utils.day()', function () {
  it('exists', function () {
    expect(day).to.be.a('function')
  })

  it('calculates the day of week of the given day index relative to Mar 01, 0', function () {
    expect(day(719468)).to.equal(4) // 1970-01-01 is a Thursday
    expect(day(736679)).to.equal(2) // 2017-02-14 is a Tuesday
  })
})

describe('utils.normalize()', function () {
  it('exists', function () {
    expect(normalize).to.be.a('function')
  })

  it('normalizes dates', function () {
    expect(normalize({year: 0, month: 13, date: 1, hour: 0, minute: 0, second: 0}))
      .to.eql({year: 1, month: 1, date: 1, hour: 0, minute: 0, second: 0})

    expect(normalize({year: 2012, month: 0, date: 1, hour: 0, minute: 0, second: 0}))
      .to.eql({year: 2011, month: 12, date: 1, hour: 0, minute: 0, second: 0})

    expect(normalize({year: 2012, month: -1, date: 1, hour: 0, minute: 0, second: 0}))
      .to.eql({year: 2011, month: 11, date: 1, hour: 0, minute: 0, second: 0})

    expect(normalize({year: 2012, month: 1, date: 0, hour: 0, minute: 0, second: 0}))
      .to.eql({year: 2011, month: 12, date: 31, hour: 0, minute: 0, second: 0})

    expect(normalize({year: 2012, month: 1, date: -1, hour: 0, minute: 0, second: 0}))
      .to.eql({year: 2011, month: 12, date: 30, hour: 0, minute: 0, second: 0})

    expect(normalize({year: 2012, month: 1, date: 1, hour: 0, minute: 0, second: -1}))
      .to.eql({year: 2011, month: 12, date: 31, hour: 23, minute: 59, second: 59})
  })
})
