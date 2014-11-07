var assert = require("assert")
var meridian = require('../lib/meridian');

describe('Meridian', function(){
    it('should get right values', function(){
        assert.equal(14.25, meridian(1415))
        assert.equal(14.50, meridian(1430))
        assert.equal(15.00, meridian('tm'))
    })
})
