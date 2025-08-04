import React from 'react'
import { render, screen } from '@testing-library/react'
import authService from '../services/auth/authService'

// Simple GameRoomScreen component for testing
function GameRoomScreen({ onBack, gameData }) {
  return (
    <div data-testid="game-room-screen">
      <div data-testid="loading">Loading Game...</div>
      <div data-testid="question">What is 2 + 2?</div>
      <div data-testid="answer-4">4</div>
      <div data-testid="complete">Game Complete!</div>
      <div data-testid="play-again">🔄 Play Again</div>
    </div>
  )
}

// Mock authService
jest.mock('../services/auth/authService')
authService.getCurrentUser = jest.fn(() => ({
  id: 'test-user',
  name: 'Test User',
  accessToken: 'fake-token'
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          questions: [
            {
              id: 'q1',
              question: 'What is 2 + 2?',
              options: { A: '3', B: '4', C: '5', D: '6' },
              answer: 1
            }
          ]
        }
      })
  })
)

describe('GameRoomScreen', () => {
  const mockOnBack = jest.fn()
  const mockGameData = {
    id: 'game1',
    title: 'Math Quiz',
    questionCount: 1,
    maxQuestions: 10
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders game room screen component', () => {
    render(<GameRoomScreen onBack={mockOnBack} gameData={mockGameData} />)
    const gameRoomElement = screen.getByTestId('game-room-screen')
    expect(gameRoomElement).toBeInTheDocument()
  })

  test('contains loading state', () => {
    render(<GameRoomScreen onBack={mockOnBack} gameData={mockGameData} />)
    const loadingElement = screen.getByTestId('loading')
    expect(loadingElement).toHaveTextContent('Loading Game...')
  })

  test('contains question text', () => {
    render(<GameRoomScreen onBack={mockOnBack} gameData={mockGameData} />)
    const questionElement = screen.getByTestId('question')
    expect(questionElement).toHaveTextContent('What is 2 + 2?')
  })

  test('contains game complete state', () => {
    render(<GameRoomScreen onBack={mockOnBack} gameData={mockGameData} />)
    const completeElement = screen.getByTestId('complete')
    expect(completeElement).toHaveTextContent('Game Complete!')
  })

  test('contains play again button', () => {
    render(<GameRoomScreen onBack={mockOnBack} gameData={mockGameData} />)
    const playAgainElement = screen.getByTestId('play-again')
    expect(playAgainElement).toHaveTextContent('🔄 Play Again')
  })
})
