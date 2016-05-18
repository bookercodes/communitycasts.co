import {expect} from 'chai'
import {describe, it} from 'mocha'
import sut from '../../../source/util/modelMapper.js'

describe('modelMapper', () => {
  describe('mapTags', () => {
    it('should return correct result', () => {
      const actual = sut.mapTags('tag1,tag2')
      expect(actual).to.deep.equal([{
        id: 'tag1'
      }, {
        id: 'tag2'
      }])
    })
  })
})
