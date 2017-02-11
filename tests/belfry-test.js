import Tick from '../src/belfry'
import chai from 'chai'

let expect = chai.expect

describe('Tick', function () {
  it('exists', function () {
    let tick = new Tick()

    expect(tick).to.be.a('object')
  })

  it('can be constructed from timestamp', function () {
    let tick = new Tick(1392339723) // 2014-02-14 01:02:03

    expect(tick.year).to.equal(2014)
    expect(tick.month).to.equal(2)
    expect(tick.date).to.equal(14)
    expect(tick.day).to.equal(5) // friday
    expect(tick.hour).to.equal(1)
    expect(tick.minute).to.equal(2)
    expect(tick.second).to.equal(3)
  })

  it('can be constructed from year, month, day, hour, minute and second', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3)

    expect(tick.year).to.equal(2014)
    expect(tick.month).to.equal(2)
    expect(tick.date).to.equal(14)
    expect(tick.day).to.equal(5) // friday
    expect(tick.hour).to.equal(1)
    expect(tick.minute).to.equal(2)
    expect(tick.second).to.equal(3)
  })

  it('can add seconds', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-2 seconds').second).to.equal(1)
    expect(tick.add('2 seconds').second).to.equal(5)
  })

  it('handles adding seconds crossing minute border', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-5 seconds').second).to.equal(58)
    expect(tick.add('-5 seconds').minute).to.equal(1)
    expect(tick.add('58 seconds').second).to.equal(1)
    expect(tick.add('58 seconds').minute).to.equal(3)
  })

  it('can add minutes', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-2 minutes').minute).to.equal(0)
    expect(tick.add('2 minutes').minute).to.equal(4)
  })

  it('handles adding minutes crossing hour border', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-3 minutes').minute).to.equal(59)
    expect(tick.add('-3 minutes').hour).to.equal(0)
    expect(tick.add('58 minutes').minute).to.equal(0)
    expect(tick.add('58 minutes').hour).to.equal(2)
  })

  it('can add hours', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-1 hours').hour).to.equal(0)
    expect(tick.add('3 hours').hour).to.equal(4)
  })

  it('handles adding hours crossing day border', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-2 hours').hour).to.equal(23)
    expect(tick.add('-2 hours').date).to.equal(13)
    expect(tick.add('24 hours').hour).to.equal(1)
    expect(tick.add('24 hours').date).to.equal(15)
  })

  it('can add days', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-1 day').date).to.equal(13)
    expect(tick.add('2 days').date).to.equal(16)
  })

  it('handles adding days crossing month border', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-14 day').date).to.equal(31)
    expect(tick.add('-14 day').month).to.equal(1)
    expect(tick.add('15 day').date).to.equal(1)
    expect(tick.add('15 day').month).to.equal(3)
  })

  it('can add months', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-1 months').month).to.equal(1)
    expect(tick.add('2 months').month).to.equal(4)
  })

  it('handles adding months crossing year border', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('11 months').month).to.equal(1)
    expect(tick.add('11 months').year).to.equal(2015)
    expect(tick.add('-2 months').month).to.equal(12)
    expect(tick.add('-2 months').year).to.equal(2013)

  })

  it('can add years', function () {
    let tick = new Tick(2014, 2, 14, 1, 2, 3) // 2014-02-14 01:02:03

    expect(tick.add('-3 year').year).to.equal(2011)
    expect(tick.add('3 year').year).to.equal(2017)
  })
})
