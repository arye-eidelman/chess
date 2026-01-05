import React, { useEffect, useState } from 'react'
import Piece from './Piece.js'
import { pieceKeys } from './constants.js'

const GameInfoPanel = ({
  gameState,
  playingAsColor,
  isOnlineGame,
  isMyTurn,
  opponentConnected,
  opponentOnline,
  isAITurn,
  isThinking,
  opponentType,
  onNewGame,
  onShareGame,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onUndo,
  onRequestUndo,
  onAcceptUndo
}) => {
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] })
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu when game ends
  useEffect(() => {
    if (gameState.gameOver) {
      setMenuOpen(false)
    }
  }, [gameState.gameOver])

  // Track captured pieces by comparing current board with initial piece counts
  useEffect(() => {
    if (!gameState?.board) return

    // Initial piece counts for a standard chess game
    const initialCounts = {
      white: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
      black: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 }
    }

    // Count current pieces on board
    const currentCounts = { white: {}, black: {} }
    gameState.board.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          const color = piece.color === 'w' ? 'white' : 'black'
          const type = piece.type.toLowerCase()
          currentCounts[color][type] = (currentCounts[color][type] || 0) + 1
        }
      })
    })

    // Calculate captured pieces
    const newCaptured = { white: [], black: [] };
    ['white', 'black'].forEach(color => {
      Object.keys(initialCounts[color]).forEach(type => {
        const initialCount = initialCounts[color][type]
        const currentCount = currentCounts[color][type] || 0
        const capturedCount = initialCount - currentCount
        if (capturedCount > 0) {
          for (let i = 0; i < capturedCount; i++) {
            newCaptured[color].push(type)
          }
        }
      })
    })

    setCapturedPieces(newCaptured)
  }, [gameState?.board])

  const getGameOverMessage = () => {
    // Handle resignation first
    if (gameState.resigned) {
      const playerResigned = gameState.resignedBy === playingAsColor
      if (opponentType === 'ai') {
        return {
          title: playerResigned ? 'You Lost!' : 'You Won!',
          message: playerResigned ? 'You resigned. The AI wins!' : 'Your opponent resigned. You win!',
          color: playerResigned ? 'text-red-600' : 'text-green-600',
          bg: playerResigned ? 'bg-red-50' : 'bg-green-50'
        }
      } else if (opponentType === 'online_friend') {
        return {
          title: playerResigned ? 'You Lost!' : 'You Won!',
          message: playerResigned ? 'You resigned. Your opponent wins!' : 'Your opponent resigned. You win!',
          color: playerResigned ? 'text-red-600' : 'text-green-600',
          bg: playerResigned ? 'bg-red-50' : 'bg-green-50'
        }
      } else {
        const winner = gameState.resignedBy === 'w' ? 'Black' : 'White'
        const loser = gameState.resignedBy === 'w' ? 'White' : 'Black'
        return {
          title: `${winner} Wins!`,
          message: `${loser} resigned.`,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        }
      }
    } else if (gameState.checkmate) {
      const playerLost = gameState.turn === playingAsColor
      if (opponentType === 'ai') {
        return {
          title: playerLost ? 'You Lost!' : 'You Won!',
          message: playerLost ? 'Checkmate! The AI has defeated you.' : 'Checkmate! You defeated the AI!',
          color: playerLost ? 'text-red-600' : 'text-green-600',
          bg: playerLost ? 'bg-red-50' : 'bg-green-50'
        }
      } else if (opponentType === 'online_friend') {
        return {
          title: playerLost ? 'You Lost!' : 'You Won!',
          message: playerLost ? 'Checkmate! Your opponent has defeated you.' : 'Checkmate! You defeated your opponent!',
          color: playerLost ? 'text-red-600' : 'text-green-600',
          bg: playerLost ? 'bg-red-50' : 'bg-green-50'
        }
      } else {
        const winner = playerLost ? (playingAsColor === 'w' ? 'Black' : 'White') : (playingAsColor === 'w' ? 'White' : 'Black')
        return {
          title: `${winner} Wins!`,
          message: 'Checkmate!',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        }
      }
    } else if (gameState.stalemate) {
      return {
        title: 'Stalemate!',
        message: 'The game ended in a draw due to stalemate.',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      }
    } else if (gameState.threefoldRepetition) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw due to threefold repetition.',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      }
    } else if (gameState.insufficient_material) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw due to insufficient material.',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      }
    } else if (gameState.draw) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw.',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      }
    }
    return null
  }

  const getTurnStatus = () => {
    if (gameState.gameOver) {
      const gameOverMsg = getGameOverMessage()
      if (gameOverMsg) {
        return {
          text: gameOverMsg.title,
          color: gameOverMsg.color,
          bg: gameOverMsg.bg,
          message: gameOverMsg.message
        }
      }
      return {
        text: 'Game Over',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        message: 'The game has ended.'
      }
    }

    if (isOnlineGame) {
      if (!opponentConnected) {
        return {
          text: 'Waiting for opponent...',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          message: null
        }
      }
      const turnColor = gameState.turn === 'w' ? 'White' : 'Black'
      if (isMyTurn) {
        return {
          text: `Your turn (${turnColor})`,
          color: 'text-green-600',
          bg: 'bg-green-50',
          message: null
        }
      } else {
        return {
          text: `Opponent's turn (${turnColor})`,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          message: null
        }
      }
    }

    if (isAITurn && isThinking) {
      return {
        text: 'AI is thinking...',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        message: null
      }
    }

    const turnColor = gameState.turn === 'w' ? 'White' : 'Black'
    const isPlayerTurn = gameState.turn === playingAsColor
    return {
      text: `${turnColor} to move`,
      color: isPlayerTurn ? 'text-green-600' : 'text-gray-600',
      bg: isPlayerTurn ? 'bg-green-50' : 'bg-gray-50',
      message: null
    }
  }

  const turnStatus = getTurnStatus()

  // Sort captured pieces by value (most valuable first)
  const pieceOrder = ['q', 'r', 'b', 'n', 'p']
  const sortCaptured = (pieces) => {
    return pieces.sort((a, b) => {
      const aIndex = pieceOrder.indexOf(a)
      const bIndex = pieceOrder.indexOf(b)
      return aIndex - bIndex
    })
  }

  return (
    <div className='w-full md:w-64 flex-shrink-0 max-w-full'>
      <div className='bg-white rounded-lg shadow-lg border-2 border-gray-200 p-2 md:p-4 space-y-2 md:space-y-4 max-h-[min(calc(100vh-4rem),600px)] overflow-y-auto relative'>
        {/* Three-dot menu button (top right corner) */}
        {!gameState.gameOver && (onResign || onOfferDraw || onUndo || onRequestUndo || onAcceptDraw || onAcceptUndo) && (
          <div className='absolute top-2 right-2 z-30'>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center'
            >
              <svg className='w-4 h-4 md:w-5 md:h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
              </svg>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu on outside click */}
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setMenuOpen(false)}
                />
                <div className='absolute z-20 mt-1 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1'>
                  {/* Undo Button (first in reversed order) */}
                  {opponentType === 'ai' ? (
                    onUndo && (
                      <button
                        onClick={() => {
                          onUndo()
                          setMenuOpen(false)
                        }}
                        disabled={!gameState.lastMove}
                        className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700'
                      >
                        Undo
                      </button>
                    )
                  ) : isOnlineGame ? (
                    <>
                      {(() => {
                        const shouldShowAccept = gameState.undoRequested &&
                          gameState.undoRequestedBy &&
                          gameState.currentUserId &&
                          gameState.undoRequestedBy !== gameState.currentUserId &&
                          onAcceptUndo
                        if (gameState.undoRequested) {
                          console.log('Undo requested state:', {
                            undoRequested: gameState.undoRequested,
                            undoRequestedBy: gameState.undoRequestedBy,
                            currentUserId: gameState.currentUserId,
                            shouldShowAccept,
                            onAcceptUndo: !!onAcceptUndo
                          })
                        }
                        return shouldShowAccept ? (
                          <div className='space-y-1'>
                            <div className='text-xs text-blue-700 bg-blue-50 p-2 mx-1 rounded'>Opponent requested undo</div>
                            <button
                              onClick={() => {
                                console.log('Accept undo button clicked')
                                onAcceptUndo()
                                setMenuOpen(false)
                              }}
                              className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors text-gray-700'
                            >
                              Accept Undo
                            </button>
                          </div>
                        ) : (
                          onRequestUndo && !gameState.undoRequested && (
                            <button
                              onClick={() => {
                                onRequestUndo()
                                setMenuOpen(false)
                              }}
                              disabled={!gameState || !gameState.lastMove || (gameState.isMyTurn && gameState.moveHistory.length === 1)}
                              className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700'
                            >
                              Request Undo
                            </button>
                          )
                        )
                      })()}
                    </>
                  ) : (
                    onUndo && (
                      <button
                        onClick={() => {
                          onUndo()
                          setMenuOpen(false)
                        }}
                        disabled={!gameState.lastMove}
                        className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700'
                      >
                        Undo
                      </button>
                    )
                  )}

                  {/* Draw Offer/Accept (second in reversed order) */}
                  {isOnlineGame ? (
                    <>
                      {gameState.drawOffered && gameState.drawOfferedBy && gameState.currentUserId && gameState.drawOfferedBy !== gameState.currentUserId && onAcceptDraw ? (
                        <div className='space-y-1'>
                          <div className='text-xs text-yellow-700 bg-yellow-50 p-2 mx-1 rounded'>Opponent offered a draw</div>
                          <button
                            onClick={() => {
                              onAcceptDraw()
                              setMenuOpen(false)
                            }}
                            className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors text-gray-700'
                          >
                            Accept Draw
                          </button>
                        </div>
                      ) : (
                        onOfferDraw && !gameState.drawOffered && (
                          <button
                            onClick={() => {
                              onOfferDraw()
                              setMenuOpen(false)
                            }}
                            className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors text-gray-700'
                          >
                            Offer Draw
                          </button>
                        )
                      )}
                    </>
                  ) : (
                    onOfferDraw && (
                      <button
                        onClick={() => {
                          onOfferDraw()
                          setMenuOpen(false)
                        }}
                        className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors text-gray-700'
                      >
                        Draw
                      </button>
                    )
                  )}

                  {/* Resign Button (third in reversed order) */}
                  {onResign && (
                    <button
                      onClick={() => {
                        onResign()
                        setMenuOpen(false)
                      }}
                      className='w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors text-red-600'
                    >
                      Resign
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Opponent Online Status (for online games) */}
        {isOnlineGame && opponentConnected && (
          <div className={`flex items-center justify-center gap-2 p-2 md:p-3 rounded-lg ${opponentOnline
            ? 'text-green-700'
            : 'text-gray-600'
            }`}>
            <div className={`w-2 h-2 rounded-full ${opponentOnline
              ? 'bg-green-500 animate-pulse'
              : 'bg-gray-400'
              }`}></div>
            <span className='text-xs md:text-sm font-medium'>
              {opponentOnline ? 'Opponent online' : 'Opponent offline'}
            </span>
          </div>
        )}

        {/* Share Game Button (when opponent is offline) */}
        {isOnlineGame && opponentConnected && !opponentOnline && !gameState.gameOver && onShareGame && (
          <button
            onClick={onShareGame}
            className='w-full px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
          >
            <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.688l1.281-1.281m0 0l5.25-5.25m-5.25 5.25l-5.25 5.25M3.75 21.75h16.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 4.5v15.25a2.25 2.25 0 002.25 2.25z' />
            </svg>
            Share Game to Rejoin
          </button>
        )}

        {/* invite friend button (when friend has not joined the game) */}
        {isOnlineGame && !opponentConnected && !gameState.gameOver && onShareGame && (
          <button
            onClick={onShareGame}
            className='w-full px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
          >
            <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Invite Friend
          </button>
        )}

        {/* Turn Status / Game Over */}
        <div className={`${turnStatus.bg} ${turnStatus.color} p-2 md:p-3 rounded-lg text-center`}>
          <div className='font-semibold text-sm md:text-lg mb-0.5 md:mb-1'>{turnStatus.text}</div>
          {turnStatus.message && (
            <div className='text-xs md:text-sm opacity-90'>{turnStatus.message}</div>
          )}
        </div>

        {/* New Game Button (when game is over) */}
        {gameState.gameOver && onNewGame && (
          <button
            onClick={onNewGame}
            className='w-full px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors'
          >
            New Game
          </button>
        )}

        {/* Captured Pieces */}
        <div className='space-y-2 md:space-y-3'>
          <div>
            <div className='text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2'>Captured by Black</div>
            <div className='flex flex-wrap gap-0.5 md:gap-1 min-h-[32px] md:min-h-[40px] p-1.5 md:p-2 bg-gray-100 rounded'>
              {sortCaptured([...capturedPieces.white]).map((piece, idx) => (
                <div key={`white-${piece}-${idx}`} className='w-5 h-5 md:w-6 md:h-6'>
                  <Piece type={pieceKeys[piece]} color="white" />
                </div>
              ))}
              {capturedPieces.white.length === 0 && (
                <span className='text-gray-400 text-xs self-center'>None</span>
              )}
            </div>
          </div>

          <div>
            <div className='text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2'>Captured by White</div>
            <div className='flex flex-wrap gap-0.5 md:gap-1 min-h-[32px] md:min-h-[40px] p-1.5 md:p-2 bg-gray-100 rounded'>
              {sortCaptured([...capturedPieces.black]).map((piece, idx) => (
                <div key={`black-${piece}-${idx}`} className='w-5 h-5 md:w-6 md:h-6'>
                  <Piece type={pieceKeys[piece]} color="black" />
                </div>
              ))}
              {capturedPieces.black.length === 0 && (
                <span className='text-gray-400 text-xs self-center'>None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameInfoPanel

