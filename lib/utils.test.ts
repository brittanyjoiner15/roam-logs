import { describe, it, expect } from 'vitest'
import { parseCityState } from './utils'

describe('parseCityState', () => {
  describe('null / empty inputs', () => {
    it('returns null for null', () => {
      expect(parseCityState(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(parseCityState(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(parseCityState('')).toBeNull()
    })
  })

  describe('vicinity format (Street, City, ST XXXXX)', () => {
    it('parses a standard vicinity address', () => {
      expect(parseCityState('123 Main St, Springfield, IL 62701')).toBe('Springfield, IL')
    })

    it('parses when city has multiple words', () => {
      expect(parseCityState('456 Oak Ave, Salt Lake City, UT 84101')).toBe('Salt Lake City, UT')
    })
  })

  describe('formatted_address format (Name, Street, City, ST XXXXX, USA)', () => {
    it('parses a full formatted address with state+zip before USA', () => {
      expect(parseCityState('Rocky Mountain NP, Bear Lake Rd, Estes Park, CO 80517, USA')).toBe(
        'Estes Park, CO'
      )
    })

    it('parses a formatted address for a city park', () => {
      expect(parseCityState('Yosemite Valley, El Capitan Dr, Yosemite Valley, CA 95389, USA')).toBe(
        'Yosemite Valley, CA'
      )
    })
  })

  describe('USA fallback format', () => {
    it('parses using USA fallback when no state+zip segment exists', () => {
      expect(parseCityState('Some Campground, Mountain Rd, Boulder, CO, USA')).toBe('Boulder, CO')
    })
  })

  describe('unrecognizable addresses', () => {
    it('returns null for an address with no state or USA marker', () => {
      expect(parseCityState('somewhere unknown')).toBeNull()
    })

    it('returns null for a single segment', () => {
      expect(parseCityState('Denver')).toBeNull()
    })
  })
})
