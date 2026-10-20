import { describe, expect, it } from 'vitest'
import {
  findDuplicateName,
  normalizeName,
  searchByName,
  sortByName,
  validateName,
} from './names.js'

const makeItem = (id, name) => ({ id, name })
const exercises = [makeItem('1', 'Lat pulldown'), makeItem('2', 'Squat')]

describe('normalizeName', () => {
  it('trims and collapses spaces', () => {
    expect(normalizeName('  Lat   pulldown ')).toBe('Lat pulldown')
  })
})

describe('findDuplicateName', () => {
  it('ignores case and spacing', () => {
    expect(findDuplicateName(exercises, ' lat  PULLDOWN')?.id).toBe('1')
  })

  it('ignores the item being renamed', () => {
    expect(findDuplicateName(exercises, 'Squat', '2')).toBeUndefined()
  })

  it('finds nothing for a new name', () => {
    expect(findDuplicateName(exercises, 'Bench press')).toBeUndefined()
  })
})

describe('sortByName', () => {
  it('sorts alphabetically, ignoring case, with numbers in natural order', () => {
    const list = ['row 10', 'Squat', 'Row 2', 'curl'].map((name, i) => makeItem(`${i}`, name))
    expect(sortByName(list, 'en').map((item) => item.name)).toEqual([
      'curl',
      'Row 2',
      'row 10',
      'Squat',
    ])
  })

  it('follows the locale alphabet', () => {
    const list = ['Ö-press', 'Axel', 'Zercher'].map((name, i) => makeItem(`${i}`, name))
    expect(sortByName(list, 'sv').map((item) => item.name)).toEqual(['Axel', 'Zercher', 'Ö-press'])
  })

  it('does not change the original list', () => {
    const list = [makeItem('1', 'B'), makeItem('2', 'A')]
    sortByName(list, 'en')
    expect(list[0].name).toBe('B')
  })
})

describe('searchByName', () => {
  it('matches part of the name, ignoring case', () => {
    expect(searchByName(exercises, 'PULL').map((item) => item.id)).toEqual(['1'])
  })

  it('returns everything for an empty search', () => {
    expect(searchByName(exercises, '  ')).toBe(exercises)
  })

  it('returns nothing when no name matches', () => {
    expect(searchByName(exercises, 'bench')).toEqual([])
  })
})

describe('validateName', () => {
  it('requires a name', () => {
    expect(validateName('   ', exercises, 'a template')).toBe('Enter a name.')
  })

  it('names the existing item, with the given kind', () => {
    expect(validateName('squat', exercises, 'a template')).toBe(
      'You already have a template called “Squat”.',
    )
  })

  it('allows keeping the same name when renaming', () => {
    expect(validateName('Squat', exercises, 'a template', '2')).toBeNull()
  })
})
