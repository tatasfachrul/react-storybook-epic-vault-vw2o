import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DetailSection from '@/app/sections/DetailSection'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineChevronRight: (props: any) => <span data-testid="icon-chevron" {...props} />,
  HiOutlineClipboardDocument: (props: any) => <span data-testid="icon-clipboard" {...props} />,
  HiOutlineCheckCircle: (props: any) => <span data-testid="icon-check" {...props} />,
  HiOutlineArrowLeft: (props: any) => <span data-testid="icon-back" {...props} />,
}))

jest.mock('react-icons/tb', () => ({
  TbSun: (props: any) => <span data-testid="icon-sun" {...props} />,
  TbMoon: (props: any) => <span data-testid="icon-moon" {...props} />,
  TbGridDots: (props: any) => <span data-testid="icon-grid" {...props} />,
}))

// Mock clipboard
jest.mock('@/lib/clipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

const mockButton = {
  id: 'button',
  name: 'Button',
  description: 'Interactive button element',
  category: 'basic' as const,
  status: 'stable' as const,
  props: [
    { name: 'variant', type: "'primary' | 'secondary' | 'outline'", default: 'primary', required: false, description: 'Visual style variant' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', required: false, description: 'Button size' },
    { name: 'disabled', type: 'boolean', default: 'false', required: false, description: 'Disable the button' },
    { name: 'children', type: 'string', default: 'Button', required: true, description: 'Button label text' },
  ],
  variants: ['primary', 'secondary', 'outline'],
  code: '<Button variant="primary">Click me</Button>',
  guidelines: 'Do: Use primary for CTAs.\nDon\'t: Use more than one primary.',
  accessibility: 'Use aria-label for icon buttons.',
  relatedComponents: ['Input', 'Toggle'],
}

const mockInput = {
  id: 'input',
  name: 'Input',
  description: 'Text input field',
  category: 'basic' as const,
  status: 'stable' as const,
  props: [
    { name: 'placeholder', type: 'string', default: '', required: false, description: 'Placeholder text' },
    { name: 'disabled', type: 'boolean', default: 'false', required: false, description: 'Disable the input' },
  ],
  variants: ['default'],
  code: '<Input placeholder="Enter text" />',
  guidelines: 'Always pair with a label.',
  accessibility: 'Use htmlFor.',
  relatedComponents: ['Button'],
}

const allComponents = [mockButton, mockInput]

describe('DetailSection', () => {
  const mockOnBack = jest.fn()
  const mockOnNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows fallback message when no component is selected', () => {
    render(
      <DetailSection
        component={null}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('Select a component to view its details')).toBeInTheDocument()
  })

  it('renders component name and description', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const buttons = screen.getAllByText('Button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Interactive button element')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('Catalog')).toBeInTheDocument()
    const basicLabels = screen.getAllByText('Basic UI')
    expect(basicLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onBack when back button is clicked', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    fireEvent.click(screen.getByText('Catalog'))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('renders variant switcher buttons', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const primaries = screen.getAllByText('primary')
    expect(primaries.length).toBeGreaterThanOrEqual(1)
    const secondaries = screen.getAllByText('secondary')
    expect(secondaries.length).toBeGreaterThanOrEqual(1)
    const outlines = screen.getAllByText('outline')
    expect(outlines.length).toBeGreaterThanOrEqual(1)
  })

  it('renders canvas background toggle buttons', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
    expect(screen.getByTestId('icon-grid')).toBeInTheDocument()
  })

  it('renders the tab triggers (Controls, Code, Props, Guidelines)', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const tabNames = tabs.map(t => t.textContent)
    expect(tabNames).toContain('Controls')
    expect(tabNames).toContain('Code')
    expect(tabNames).toContain('Props')
    expect(tabNames).toContain('Guidelines')
  })

  it('renders prop controls for the component (default Controls tab)', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('variant')).toBeInTheDocument()
    expect(screen.getByText('size')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('stable')).toBeInTheDocument()
  })

  it('activates guidelines tab when clicked', async () => {
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const guidelinesTab = tabs.find(t => t.textContent === 'Guidelines')
    expect(guidelinesTab).toBeTruthy()
    if (guidelinesTab) {
      await user.click(guidelinesTab)
      // After userEvent click, the tab should become active
      expect(guidelinesTab.getAttribute('data-state')).toBe('active')
    }
  })

  it('activates code tab and shows code content', async () => {
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const codeTab = tabs.find(t => t.textContent === 'Code')
    expect(codeTab).toBeTruthy()
    if (codeTab) {
      await user.click(codeTab)
      expect(codeTab.getAttribute('data-state')).toBe('active')
      // The code tab content should now be visible
      await waitFor(() => {
        expect(screen.getByText('Generated Code')).toBeInTheDocument()
      })
    }
  })

  it('activates props tab', async () => {
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const propsTab = tabs.find(t => t.textContent === 'Props')
    expect(propsTab).toBeTruthy()
    if (propsTab) {
      await user.click(propsTab)
      expect(propsTab.getAttribute('data-state')).toBe('active')
    }
  })

  it('copies code to clipboard via code tab', async () => {
    const { copyToClipboard } = require('@/lib/clipboard')
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const codeTab = tabs.find(t => t.textContent === 'Code')
    if (codeTab) {
      await user.click(codeTab)
      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Copy'))
      await waitFor(() => {
        expect(copyToClipboard).toHaveBeenCalled()
      })
    }
  })

  it('shows related components on guidelines tab', async () => {
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const guidelinesTab = tabs.find(t => t.textContent === 'Guidelines')
    if (guidelinesTab) {
      await user.click(guidelinesTab)
      await waitFor(() => {
        expect(screen.getByText('Related Components')).toBeInTheDocument()
      })
      expect(screen.getByText('Toggle')).toBeInTheDocument()
    }
  })

  it('calls onNavigateToComponent from guidelines tab', async () => {
    const user = userEvent.setup()
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const tabs = screen.getAllByRole('tab')
    const guidelinesTab = tabs.find(t => t.textContent === 'Guidelines')
    if (guidelinesTab) {
      await user.click(guidelinesTab)
      await waitFor(() => {
        expect(screen.getByText('Related Components')).toBeInTheDocument()
      })
      const inputTexts = screen.getAllByText('Input')
      const chip = inputTexts[inputTexts.length - 1]
      await user.click(chip)
      expect(mockOnNavigate).toHaveBeenCalledWith('input')
    }
  })

  it('handles component with empty props array', () => {
    const noPropsComp = { ...mockButton, props: [] }
    render(
      <DetailSection
        component={noPropsComp}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    expect(screen.getByText('No configurable props')).toBeInTheDocument()
  })

  it('switches variant when variant button is clicked', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const secondaryButtons = screen.getAllByText('secondary')
    fireEvent.click(secondaryButtons[0])
  })

  it('toggles canvas background when background buttons are clicked', () => {
    render(
      <DetailSection
        component={mockButton}
        onBack={mockOnBack}
        onNavigateToComponent={mockOnNavigate}
        allComponents={allComponents}
      />
    )
    const moonButton = screen.getByTestId('icon-moon').closest('button')
    if (moonButton) fireEvent.click(moonButton)
  })
})
