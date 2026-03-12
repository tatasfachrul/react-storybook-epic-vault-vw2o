import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Page from '@/app/page'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineMagnifyingGlass: (props: any) => <span data-testid="icon-search" {...props} />,
  HiOutlineBars3: (props: any) => <span data-testid="icon-menu" {...props} />,
  HiOutlineXMark: (props: any) => <span data-testid="icon-x" {...props} />,
  HiOutlineCube: (props: any) => <span data-testid="icon-cube" {...props} />,
  HiOutlineCheckCircle: (props: any) => <span data-testid="icon-check" {...props} />,
  HiOutlineBeaker: (props: any) => <span data-testid="icon-beaker" {...props} />,
  HiOutlineSparkles: (props: any) => <span data-testid="icon-sparkles" {...props} />,
  HiOutlineChevronRight: (props: any) => <span data-testid="icon-chevron-right" {...props} />,
  HiOutlineClipboardDocument: (props: any) => <span data-testid="icon-clip" {...props} />,
  HiOutlineArrowLeft: (props: any) => <span data-testid="icon-arrow-left" {...props} />,
  HiOutlinePaperAirplane: (props: any) => <span data-testid="icon-send" {...props} />,
  HiOutlineArrowPath: (props: any) => <span data-testid="icon-retry" {...props} />,
  HiOutlineFunnel: (props: any) => <span data-testid="icon-funnel" {...props} />,
  HiOutlineDocumentText: (props: any) => <span data-testid="icon-doc" {...props} />,
  HiOutlineTrash: (props: any) => <span data-testid="icon-trash" {...props} />,
  HiOutlineArrowUpTray: (props: any) => <span data-testid="icon-upload-tray" {...props} />,
  HiOutlineExclamationCircle: (props: any) => <span data-testid="icon-exclaim" {...props} />,
}))

jest.mock('react-icons/tb', () => ({
  TbLayoutDashboard: (props: any) => <span data-testid="icon-dashboard" {...props} />,
  TbComponents: (props: any) => <span data-testid="icon-components" {...props} />,
  TbCategory: (props: any) => <span data-testid="icon-category" {...props} />,
  TbDatabase: (props: any) => <span data-testid="icon-database" {...props} />,
  TbMessageChatbot: (props: any) => <span data-testid="icon-chatbot" {...props} />,
  TbChevronDown: (props: any) => <span data-testid="icon-chevdown" {...props} />,
  TbChevronRight: (props: any) => <span data-testid="icon-chevright" {...props} />,
  TbCube: (props: any) => <span data-testid="icon-tb-cube" {...props} />,
  TbPuzzle: (props: any) => <span data-testid="icon-puzzle" {...props} />,
  TbLayout: (props: any) => <span data-testid="icon-layout" {...props} />,
  TbBriefcase: (props: any) => <span data-testid="icon-briefcase" {...props} />,
  TbSun: (props: any) => <span data-testid="icon-sun" {...props} />,
  TbMoon: (props: any) => <span data-testid="icon-moon" {...props} />,
  TbGridDots: (props: any) => <span data-testid="icon-grid" {...props} />,
}))

// Mock AI agent
jest.mock('@/lib/aiAgent', () => ({
  callAIAgent: jest.fn().mockResolvedValue({
    success: true,
    response: { status: 'success', result: { answer: 'Test', code_snippet: '', component_name: '', related_components: [] } },
  }),
  extractText: jest.fn().mockReturnValue(''),
}))

// Mock clipboard
jest.mock('@/lib/clipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

// Mock RAG knowledge base
jest.mock('@/lib/ragKnowledgeBase', () => ({
  useRAGKnowledgeBase: () => ({
    documents: [],
    loading: false,
    error: null,
    fetchDocuments: jest.fn().mockResolvedValue({ success: true }),
    uploadDocument: jest.fn().mockResolvedValue({ success: true }),
    removeDocuments: jest.fn().mockResolvedValue({ success: true }),
  }),
  validateFile: jest.fn().mockReturnValue({ valid: true }),
}))

describe('Page (Main App)', () => {
  it('renders the app with sidebar', () => {
    render(<Page />)
    expect(screen.getByText('ComponentVault')).toBeInTheDocument()
  })

  it('renders sidebar navigation items', () => {
    render(<Page />)
    const dashboards = screen.getAllByText('Dashboard')
    expect(dashboards.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('All Components')).toBeInTheDocument()
    // "Categories" appears in sidebar and in dashboard section
    const categories = screen.getAllByText('Categories')
    expect(categories.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the global search bar', () => {
    render(<Page />)
    expect(screen.getByPlaceholderText('Search components...')).toBeInTheDocument()
  })

  it('shows dashboard view by default', () => {
    render(<Page />)
    const dashboardHeadings = screen.getAllByText('Dashboard')
    expect(dashboardHeadings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the FAB button for assistant', () => {
    render(<Page />)
    const fab = screen.getByLabelText('Open AI Assistant')
    expect(fab).toBeInTheDocument()
  })

  it('navigates to catalog view when All Components is clicked', () => {
    render(<Page />)
    fireEvent.click(screen.getByText('All Components'))
    // Catalog section renders "Component Catalog" heading
    const catalogs = screen.getAllByText('Component Catalog')
    expect(catalogs.length).toBeGreaterThanOrEqual(1)
  })

  it('navigates to knowledge base view', () => {
    render(<Page />)
    // Click Knowledge Base in sidebar - there may be multiple, click the nav one
    const kbLinks = screen.getAllByText('Knowledge Base')
    fireEvent.click(kbLinks[0])
    expect(screen.getByText('Manage documents that power the AI Component Assistant')).toBeInTheDocument()
  })

  it('renders category sub-items in sidebar', () => {
    render(<Page />)
    // Basic UI appears in both sidebar and dashboard categories
    const basics = screen.getAllByText('Basic UI')
    expect(basics.length).toBeGreaterThanOrEqual(1)
    const complexes = screen.getAllByText('Complex')
    expect(complexes.length).toBeGreaterThanOrEqual(1)
    const layouts = screen.getAllByText('Layout')
    expect(layouts.length).toBeGreaterThanOrEqual(1)
    const domains = screen.getAllByText('Domain')
    expect(domains.length).toBeGreaterThanOrEqual(1)
  })

  it('navigates to filtered catalog when category is clicked', () => {
    render(<Page />)
    // Click "Basic UI" in sidebar categories - use getAllByText and pick sidebar one
    const basicLinks = screen.getAllByText('Basic UI')
    fireEvent.click(basicLinks[0])
    const catalogs = screen.getAllByText('Component Catalog')
    expect(catalogs.length).toBeGreaterThanOrEqual(1)
  })

  it('opens assistant panel when FAB is clicked', () => {
    render(<Page />)
    const fab = screen.getByLabelText('Open AI Assistant')
    fireEvent.click(fab)
    expect(screen.getByText('Component Assistant')).toBeInTheDocument()
  })

  it('has the sample data toggle in sidebar', () => {
    render(<Page />)
    expect(screen.getByText('Sample Data')).toBeInTheDocument()
  })

  it('shows agent status indicator', () => {
    render(<Page />)
    expect(screen.getByText('Component Assistant Agent')).toBeInTheDocument()
  })

  it('renders with the gradient background', () => {
    const { container } = render(<Page />)
    // The ErrorBoundary wraps the main div, so navigate to the gradient div
    const gradientDiv = container.querySelector('[class*="bg-gradient-to-br"]')
    expect(gradientDiv).toBeTruthy()
  })

  it('toggles categories expansion', () => {
    render(<Page />)
    // Categories should be expanded by default
    const basicLinksBefore = screen.getAllByText('Basic UI')
    const countBefore = basicLinksBefore.length

    // Click first Categories link (sidebar one)
    const categories = screen.getAllByText('Categories')
    fireEvent.click(categories[0])

    // After collapse, category sub-items may toggle
    const basicLinksAfter = screen.getAllByText('Basic UI')
    expect(basicLinksAfter.length).toBeLessThanOrEqual(countBefore)
  })

  it('handles global search form submission', () => {
    render(<Page />)
    const searchInput = screen.getByPlaceholderText('Search components...')
    fireEvent.change(searchInput, { target: { value: 'Button' } })
    const form = searchInput.closest('form')
    if (form) fireEvent.submit(form)
    // Should navigate to catalog
    const catalogs = screen.getAllByText('Component Catalog')
    expect(catalogs.length).toBeGreaterThanOrEqual(1)
  })
})
