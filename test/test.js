var assert = require('assert')
var lobby = require('../LobbyManager.js')

describe('Array', function() {
	describe('#indexOf', function() {
		it('should return -1 when the value is not present', function() {
			assert.equal([1,2,3].indexOf(4), -1)
			assert.equal([1,2,3].indexOf(5), -1)
		})
		it('should return index of value in array', function() {
			assert.equal([1,2,3].indexOf(2), 1)
		})
	})
})

describe('Lobby', function() {
	describe('#freeLobbyCode', function() {
		it('should remove a given lobby code from the pool', function() {
			let tempPool = ['XJNF', 'WXYZ']
			lobby.freeLobbyCode('XJNF', tempPool)
			assert.equal(JSON.stringify(tempPool), JSON.stringify(['WXYZ']))
		})
		it('should return false when removing a lobby code that is not in the pool', function(){
			let tempPool = []
			assert.equal(lobby.freeLobbyCode('NULL', tempPool), false)
		})
	})
})