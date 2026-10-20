import { describe, expect, it } from 'vitest'
import { cx } from './classNames.js'

describe('cx', () => {
  it('joins class names with spaces', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c')
  })

  it('skips falsy values', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns an empty string when nothing is given', () => {
    expect(cx()).toBe('')
  })
})
