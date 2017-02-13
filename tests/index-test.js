import Tick from '../src/index'
import chai from 'chai'

let expect = chai.expect

describe('index.js', function () {
  it('exports Tick as the default', function () {
    let tick = new Tick()

    expect(tick).to.be.a('object')
    expect(tick.add).to.be.a('function')
  })
})
