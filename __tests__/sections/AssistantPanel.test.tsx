import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AssistantPanel from '@/app/sections/AssistantPanel'

// Mock react-icons
jest.mock('react-icons/hi2', () => ({
  HiOutlineXMark: (props: any) => <span data-testid="icon-close" {...props} />,
  HiOutlinePaperAirplane: (props: any) => <span data-testid="icon-send" {...props} />,
  HiOutlineClipboardDocument: (props: any) => <span data-testid="icon-clipboard" {...props} />,
  HiOutlineCheckCircle: (props: any) => <span data-testid="icon-check" {...props} />,
  HiOutlineArrowPath: (props: any) => <span data-testid="icon-retry" {...props} />,
}))

jest.mock('react-icons/tb', () => ({
  TbMessageChatbot: (props: any) => <span data-testid="icon-chatbot" {...props} />,
}))

// Mock AI agent
const mockCallAIAgent = jest.fn()
jest.mock('@/lib/aiAgent', () => ({
  callAIAgent: (...args: any[]) => mockCallAIAgent(...args),
  extractText: jest.fn().mockReturnValue('Fallback text'),
}))

// Mock clipboard
jest.mock('@/lib/clipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

describe('AssistantPanel', () => {
  const mockOnClose = jest.fn()
  const mockOnNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCallAIAgent.mockResolvedValue({
      success: true,
      response: {
        status: 'success',
        result: {
          answer: 'The Button component supports variants.',
          code_snippet: '<Button variant="primary">Click</Button>',
          component_name: 'Button',
          related_components: ['Input', 'Badge'],
        },
      },
    })
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AssistantPanel isOpen={false} onClose={mockOnClose} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the panel when isOpen is true', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    expect(screen.getByText('Component Assistant')).toBeInTheDocument()
  })

  it('renders suggested prompts when no messages exist', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    expect(screen.getByText('Which component for forms?')).toBeInTheDocument()
    expect(screen.getByText('Show Button variants')).toBeInTheDocument()
    expect(screen.getByText('Explain DataTable props')).toBeInTheDocument()
    expect(screen.getByText('Accessibility guidelines')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const closeButton = screen.getByTestId('icon-close').closest('button')
    if (closeButton) fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    // The backdrop is the first child (fixed inset-0)
    const backdrop = document.querySelector('.fixed.inset-0')
    if (backdrop) fireEvent.click(backdrop)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders the input and send button', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    expect(screen.getByPlaceholderText('Ask about components...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-send')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const sendButton = screen.getByTestId('icon-send').closest('button')
    expect(sendButton).toBeDisabled()
  })

  it('sends a message and displays user message', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} onNavigateToComponent={mockOnNavigate} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Tell me about Button' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Tell me about Button')).toBeInTheDocument()
    })
  })

  it('displays assistant response with parsed JSON fields', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} onNavigateToComponent={mockOnNavigate} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Tell me about Button' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('The Button component supports variants.')).toBeInTheDocument()
    })

    // Check code snippet is rendered
    expect(screen.getByText('<Button variant="primary">Click</Button>')).toBeInTheDocument()
  })

  it('displays related components as chips', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} onNavigateToComponent={mockOnNavigate} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Tell me about Button' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Input')).toBeInTheDocument()
      expect(screen.getByText('Badge')).toBeInTheDocument()
    })
  })

  it('calls onNavigateToComponent when a related component chip is clicked', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} onNavigateToComponent={mockOnNavigate} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Tell me about Button' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Input')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Input'))
    expect(mockOnNavigate).toHaveBeenCalledWith('Input')
  })

  it('sends a message when Enter key is pressed', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(mockCallAIAgent).toHaveBeenCalledWith('Hello', '69b23873b4ae37dbd0601e42')
    })
  })

  it('does not send on Shift+Enter', () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true })
    expect(mockCallAIAgent).not.toHaveBeenCalled()
  })

  it('displays error message on API failure', async () => {
    mockCallAIAgent.mockResolvedValueOnce({
      success: false,
      error: 'API Error',
      response: { status: 'error', result: {} },
    })

    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('displays network error on exception', async () => {
    mockCallAIAgent.mockRejectedValueOnce(new Error('Network failure'))

    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows retry button on error', async () => {
    mockCallAIAgent.mockResolvedValueOnce({
      success: false,
      error: 'API Error',
      response: { status: 'error', result: {} },
    })

    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('sends suggested prompt when clicked', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    fireEvent.click(screen.getByText('Which component for forms?'))

    await waitFor(() => {
      expect(mockCallAIAgent).toHaveBeenCalledWith('Which component for forms?', '69b23873b4ae37dbd0601e42')
    })
  })

  it('clears input after sending', async () => {
    render(
      <AssistantPanel isOpen={true} onClose={mockOnClose} />
    )
    const input = screen.getByPlaceholderText('Ask about components...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendButton = screen.getByTestId('icon-send').closest('button')
    if (sendButton) fireEvent.click(sendButton)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })
})
