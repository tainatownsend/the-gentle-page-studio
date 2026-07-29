import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Box } from './Box'

describe('Box', () => {
  it('renders a div by default', () => {
    render(<Box data-testid="box">Content</Box>)
    expect(screen.getByTestId('box').tagName).toBe('DIV')
  })

  it('supports polymorphic semantic elements', () => {
    render(
      <Box as="section" aria-label="Publication settings">
        Content
      </Box>,
    )
    expect(
      screen.getByRole('region', { name: 'Publication settings' }),
    ).toBeInTheDocument()
  })

  it('forwards native props and class names', () => {
    render(
      <Box as="button" type="button" className="custom-box">
        Open
      </Box>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toHaveClass(
      'custom-box',
    )
  })

  it('forwards refs to the rendered element', () => {
    const ref = createRef<HTMLElement>()
    render(<Box as="section" ref={ref} data-testid="box" />)
    expect(ref.current).toBe(screen.getByTestId('box'))
  })
})
