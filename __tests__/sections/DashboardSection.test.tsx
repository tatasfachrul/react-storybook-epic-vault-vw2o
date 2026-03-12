import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardSection from '@/app/sections/DashboardSection'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineCube: (props: any) => <span data-testid="icon-cube" {...props} />,
  HiOutlineCheckCircle: (props: any) => <span data-testid="icon-check" {...props} />,
  HiOutlineBeaker: (props: any) => <span data-testid="icon-beaker" {...props} />,
  HiOutlineSparkles: (props: any) => <span data-testid="icon-sparkles" {...props} />,
}))

const mockComponents = [
  { id: 'button', name: 'Button', description: 'A button', category: 'basic' as const, status: 'stable' as const },
  { id: 'input', name: 'Input', description: 'An input', category: 'basic' as const, status: 'stable' as const },
  { id: 'datatable', name: 'DataTable', description: 'A table', category: 'complex' as const, status: 'beta' as const },
  { id: 'tooltip', name: 'Tooltip', description: 'A tooltip', category: 'basic' as const, status: 'new' as const },
  { id: 'card', name: 'Card', description: 'A card', category: 'layout' as const, status: 'stable' as const },
  { id: 'dialog', name: 'Dialog', description: 'A dialog', category: 'layout' as const, status: 'stable' as const },
]

const mockCategories = [
  { id: 'basic', name: 'Basic UI', description: 'Fundamental building blocks', count: 3 },
  { id: 'complex', name: 'Complex', description: 'Advanced components', count: 1 },
  { id: 'layout', name: 'Layout', description: 'Structural components', count: 2 },
]

describe('DashboardSection', () => {
  const mockOnSelectCategory = jest.fn()
  const mockOnSelectComponent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dashboard heading', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview of your component library')).toBeInTheDocument()
  })

  it('renders correct stats counts', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Total Components')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    // Total = 6
    expect(screen.getByText('6')).toBeInTheDocument()
    // Stable = 4 (appears multiple times due to category counts), so use getAllByText
    const fours = screen.getAllByText('4')
    expect(fours.length).toBeGreaterThanOrEqual(1)
  })

  it('renders all categories', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Basic UI')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
  })

  it('calls onSelectCategory when a category card is clicked', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    const basicCard = screen.getByText('Basic UI').closest('[class*="cursor-pointer"]')
    if (basicCard) fireEvent.click(basicCard)
    expect(mockOnSelectCategory).toHaveBeenCalledWith('basic')
  })

  it('renders recently updated components (up to 5)', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Recently Updated')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('DataTable')).toBeInTheDocument()
  })

  it('calls onSelectComponent when a recent component is clicked', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    fireEvent.click(screen.getByText('Button'))
    expect(mockOnSelectComponent).toHaveBeenCalledWith('button')
  })

  it('renders the Getting Started guide', () => {
    render(
      <DashboardSection
        components={mockComponents}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText(/Browse components by category/)).toBeInTheDocument()
    expect(screen.getByText(/Copy the generated code/)).toBeInTheDocument()
  })

  it('handles empty components array gracefully', () => {
    render(
      <DashboardSection
        components={[]}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(1)
  })

  it('handles non-array components gracefully', () => {
    render(
      <DashboardSection
        components={null as any}
        categories={mockCategories}
        onSelectCategory={mockOnSelectCategory}
        onSelectComponent={mockOnSelectComponent}
      />
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
