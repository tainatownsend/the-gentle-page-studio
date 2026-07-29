import { cn } from './cn'

describe('cn', () => {
  it('combines class names', () => {
    expect(cn('button', 'button-primary')).toBe(
      'button button-primary',
    )
  })

  it('ignores falsy values', () => {
    expect(
      cn(
        'button',
        false,
        null,
        undefined,
        '',
        'button-large',
      ),
    ).toBe('button button-large')
  })

  it('supports conditional objects', () => {
    expect(
      cn({
        button: true,
        disabled: false,
        loading: true,
      }),
    ).toBe('button loading')
  })

  it('supports nested arrays', () => {
    expect(
      cn([
        'button',
        ['button-primary'],
        false,
        ['button-large'],
      ]),
    ).toBe('button button-primary button-large')
  })

  it('returns an empty string when no classes are provided', () => {
    expect(cn()).toBe('')
  })
})
