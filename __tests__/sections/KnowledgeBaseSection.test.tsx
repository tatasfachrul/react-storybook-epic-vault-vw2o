import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KnowledgeBaseSection from '@/app/sections/KnowledgeBaseSection'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineDocumentText: (props: any) => <span data-testid="icon-doc" {...props} />,
  HiOutlineTrash: (props: any) => <span data-testid="icon-trash" {...props} />,
  HiOutlineArrowUpTray: (props: any) => <span data-testid="icon-upload" {...props} />,
  HiOutlineExclamationCircle: (props: any) => <span data-testid="icon-exclamation" {...props} />,
}))

// Mock RAG Knowledge Base
const mockFetchDocuments = jest.fn()
const mockUploadDocument = jest.fn()
const mockRemoveDocuments = jest.fn()

jest.mock('@/lib/ragKnowledgeBase', () => ({
  useRAGKnowledgeBase: () => ({
    documents: mockDocuments,
    loading: mockLoading,
    error: mockError,
    fetchDocuments: mockFetchDocuments,
    uploadDocument: mockUploadDocument,
    removeDocuments: mockRemoveDocuments,
  }),
  validateFile: jest.fn().mockReturnValue({ valid: true }),
}))

let mockDocuments: any[] | null = null
let mockLoading = false
let mockError: string | null = null

describe('KnowledgeBaseSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDocuments = null
    mockLoading = false
    mockError = null
    mockFetchDocuments.mockResolvedValue({ success: true })
    mockUploadDocument.mockResolvedValue({ success: true })
    mockRemoveDocuments.mockResolvedValue({ success: true })
  })

  it('renders the heading', () => {
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('Manage documents that power the AI Component Assistant')).toBeInTheDocument()
  })

  it('calls fetchDocuments on mount', () => {
    render(<KnowledgeBaseSection />)
    expect(mockFetchDocuments).toHaveBeenCalledWith('69b23860cc96ef3cace6280f')
  })

  it('renders the upload button', () => {
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
  })

  it('shows empty state when no documents', () => {
    mockDocuments = []
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('No documents yet')).toBeInTheDocument()
    expect(screen.getByText('Upload PDF, DOCX, or TXT files to train the assistant')).toBeInTheDocument()
  })

  it('renders document list when documents exist', () => {
    mockDocuments = [
      { fileName: 'components.pdf', fileType: 'pdf', status: 'active' },
      { fileName: 'guide.txt', fileType: 'txt', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('components.pdf')).toBeInTheDocument()
    expect(screen.getByText('guide.txt')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading and no docs', () => {
    mockLoading = true
    mockDocuments = null
    render(<KnowledgeBaseSection />)
    // Should show skeleton elements
    const skeletons = document.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error message when error exists', () => {
    mockError = 'Failed to load documents'
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('Failed to load documents')).toBeInTheDocument()
  })

  it('shows file type badges for documents', () => {
    mockDocuments = [
      { fileName: 'components.pdf', fileType: 'pdf', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('pdf')).toBeInTheDocument()
  })

  it('shows status indicator for documents', () => {
    mockDocuments = [
      { fileName: 'components.pdf', fileType: 'pdf', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('shows supported formats note', () => {
    render(<KnowledgeBaseSection />)
    expect(screen.getByText(/Supported formats: PDF, DOCX, TXT/)).toBeInTheDocument()
  })

  it('shows delete confirmation when delete is initiated', () => {
    mockDocuments = [
      { fileName: 'test.pdf', fileType: 'pdf', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)

    // Hover and click delete (the trash icon button)
    const trashButton = screen.getByTestId('icon-trash').closest('button')
    if (trashButton) fireEvent.click(trashButton)

    // Should show confirm/cancel
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels delete when Cancel is clicked', () => {
    mockDocuments = [
      { fileName: 'test.pdf', fileType: 'pdf', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)

    const trashButton = screen.getByTestId('icon-trash').closest('button')
    if (trashButton) fireEvent.click(trashButton)

    fireEvent.click(screen.getByText('Cancel'))
    // Confirm buttons should disappear
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('calls removeDocuments when Confirm delete is clicked', async () => {
    mockDocuments = [
      { fileName: 'test.pdf', fileType: 'pdf', status: 'active' },
    ]
    render(<KnowledgeBaseSection />)

    const trashButton = screen.getByTestId('icon-trash').closest('button')
    if (trashButton) fireEvent.click(trashButton)

    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => {
      expect(mockRemoveDocuments).toHaveBeenCalledWith('69b23860cc96ef3cace6280f', ['test.pdf'])
    })
  })

  it('validates file on upload', async () => {
    const { validateFile } = require('@/lib/ragKnowledgeBase')
    validateFile.mockReturnValue({ valid: false, error: 'Unsupported file type' })

    render(<KnowledgeBaseSection />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })

    Object.defineProperty(fileInput, 'files', { value: [invalidFile] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText('Unsupported file type')).toBeInTheDocument()
    })
  })
})
