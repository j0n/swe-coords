var assert = require("assert")
var sweref = require('../lib/sweref');

describe('Meridian', function(){
    it('should get right values', function(){
        assert.equal(65.08324705625031, sweref.toLatLng(7218164, 550633).lat)
        assert.equal(16.077112943773155, sweref.toLatLng(7218164, 550633).lng)
    })
})
