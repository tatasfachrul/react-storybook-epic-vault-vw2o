import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import CatalogSection from '@/app/sections/CatalogSection'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineMagnifyingGlass: (props: any) => <span data-testid="icon-search" {...props} />,
  HiOutlineFunnel: (props: any) => <span data-testid="icon-funnel" {...props} />,
}))

const mockComponents = [
  { id: 'button', name: 'Button', description: 'A button component', category: 'basic' as const, status: 'stable' as const, variants: ['primary', 'secondary'] },
  { id: 'input', name: 'Input', description: 'An input field', category: 'basic' as const, status: 'stable' as const, variants: ['default'] },
  { id: 'datatable', name: 'DataTable', description: 'A data table', category: 'complex' as const, status: 'beta' as const, variants: ['default', 'striped'] },
  { id: 'card', name: 'Card', description: 'A card container', category: 'layout' as const, status: 'stable' as const, variants: ['default'] },
  { id: 'tooltip', name: 'Tooltip', description: 'Contextual tooltip', category: 'basic' as const, status: 'new' as const, variants: ['default'] },
]

describe('CatalogSection', () => {
  const mockOnSelectComponent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the catalog heading', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Component Catalog')).toBeInTheDocument()
    expect(screen.getByText('Browse and explore all available components')).toBeInTheDocument()
  })

  it('renders category filter pills', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Basic UI')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Domain')).toBeInTheDocument()
  })

  it('renders all components when category is "all"', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('DataTable')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Tooltip')).toBeInTheDocument()
  })

  it('filters by category when a category pill is clicked', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    fireEvent.click(screen.getByText('Complex'))
    expect(screen.getByText('DataTable')).toBeInTheDocument()
    expect(screen.queryByText('Button')).not.toBeInTheDocument()
  })

  it('shows the correct component count', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Showing 5 of 5 components')).toBeInTheDocument()
  })

  it('calls onSelectComponent when a card is clicked', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    const buttonCard = screen.getByText('Button').closest('[class*="cursor-pointer"]')
    if (buttonCard) fireEvent.click(buttonCard)
    expect(mockOnSelectComponent).toHaveBeenCalledWith('button')
  })

  it('shows empty state when no components match', () => {
    render(
      <CatalogSection
        components={[]}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('No components found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument()
  })

  it('handles search input with debounce', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    const searchInput = screen.getByPlaceholderText('Search components...')
    fireEvent.change(searchInput, { target: { value: 'button' } })

    // Before debounce, all components should still show
    expect(screen.getByText('DataTable')).toBeInTheDocument()

    // After debounce
    act(() => {
      jest.advanceTimersByTime(350)
    })
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.queryByText('DataTable')).not.toBeInTheDocument()
  })

  it('displays variant count on cards', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    // Button has 2 variants, DataTable has 2 variants
    const twoVariants = screen.getAllByText('2 variants')
    expect(twoVariants.length).toBeGreaterThanOrEqual(1)
  })

  it('displays status badges on cards', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    const stableBadges = screen.getAllByText('stable')
    expect(stableBadges.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
  })

  it('handles initialCategory prop', () => {
    render(
      <CatalogSection
        components={mockComponents}
        initialCategory="basic"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    // Should filter to basic category
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.queryByText('DataTable')).not.toBeInTheDocument()
  })

  it('handles non-array components gracefully', () => {
    render(
      <CatalogSection
        components={null as any}
        initialCategory="all"
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('No components found')).toBeInTheDocument()
  })
})
