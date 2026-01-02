import LocalChessAPI from './LocalChessAPI.js'

class AIChessAPI extends LocalChessAPI {
  constructor(difficulty, aiColor) {
    super()
    this.difficulty = difficulty
    this.aiColor = aiColor
    this.isThinking = false
    
    // Set depth based on difficulty
    this.depth = this.getDepthForDifficulty(difficulty)
  }

  getDepthForDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy':
        return 2
      case 'medium':
        return 4
      case 'hard':
        return 5
      case 'impossible':
        return 6
      default:
        return 2
    }
  }

  // Evaluate board position (positive for AI, negative for opponent)
  evaluatePosition(game) {
    if (game.game_over()) {
      if (game.in_checkmate()) {
        return game.turn() === this.aiColor ? -10000 : 10000
      }
      if (game.in_draw() || game.in_stalemate()) {
        return 0
      }
    }

    // Piece values
    const pieceValues = {
      'p': 100,
      'n': 320,
      'b': 330,
      'r': 500,
      'q': 900,
      'k': 20000
    }

    let score = 0
    const board = game.board()

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece) {
          const value = pieceValues[piece.type.toLowerCase()]
          if (piece.color === this.aiColor) {
            score += value
            // Add position bonuses for pieces
            score += this.getPositionBonus(piece, row, col)
          } else {
            score -= value
            score -= this.getPositionBonus(piece, row, col)
          }
        }
      }
    }

    // Bonus for controlling center
    const centerSquares = ['d4', 'd5', 'e4', 'e5']
    centerSquares.forEach(square => {
      const moves = game.moves({ square, verbose: true })
      if (moves.length > 0) {
        const piece = game.get(square)
        if (piece && piece.color === this.aiColor) {
          score += 20
        } else if (piece) {
          score -= 20
        }
      }
    })

    // Bonus for check
    if (game.in_check()) {
      if (game.turn() === this.aiColor) {
        score -= 50 // AI is in check
      } else {
        score += 50 // Opponent is in check
      }
    }

    return score
  }

  // Position bonuses for better piece placement
  getPositionBonus(piece, row, col) {
    const type = piece.type.toLowerCase()
    let bonus = 0

    // Pawn position bonus (encourage central pawns)
    if (type === 'p') {
      const centerCols = [3, 4] // d and e files
      if (centerCols.includes(col)) {
        bonus += 10
      }
      // Encourage pawn advancement
      if (piece.color === 'w') {
        bonus += (7 - row) * 5
      } else {
        bonus += row * 5
      }
    }

    // Knight position bonus (central squares)
    if (type === 'n') {
      const centerDistance = Math.abs(3.5 - col) + Math.abs(3.5 - row)
      bonus += (4 - centerDistance) * 5
    }

    // Bishop position bonus (long diagonals)
    if (type === 'b') {
      if (row === col || row + col === 7) {
        bonus += 10
      }
    }

    return bonus
  }

  // Minimax algorithm with alpha-beta pruning
  minimax(game, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || game.game_over()) {
      return this.evaluatePosition(game)
    }

    const moves = game.moves({ verbose: true })

    if (maximizingPlayer) {
      let maxEval = -Infinity
      for (const move of moves) {
        game.move(move)
        const evaluation = this.minimax(game, depth - 1, alpha, beta, false)
        game.undo()
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        if (beta <= alpha) {
          break // Alpha-beta pruning
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        game.move(move)
        const evaluation = this.minimax(game, depth - 1, alpha, beta, true)
        game.undo()
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) {
          break // Alpha-beta pruning
        }
      }
      return minEval
    }
  }

  // Get the best move using minimax
  getBestMove() {
    if (this.game.game_over()) {
      return null
    }

    const moves = this.game.moves({ verbose: true })
    if (moves.length === 0) {
      return null
    }

    // For easy difficulty, sometimes make random moves
    if (this.difficulty === 'easy' && Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)]
    }

    // It should always be AI's turn when this is called
    if (this.game.turn() !== this.aiColor) {
      return null
    }

    let bestMove = null
    let bestEval = -Infinity

    for (const move of moves) {
      this.game.move(move)
      // After making the move, it's now the opponent's turn, so we minimize
      const evaluation = this.minimax(
        this.game,
        this.depth - 1,
        -Infinity,
        Infinity,
        false // Opponent's turn, so minimizing
      )
      this.game.undo()

      // Maximizing for AI (higher evaluation is better)
      if (evaluation > bestEval) {
        bestEval = evaluation
        bestMove = move
      }
    }

    return bestMove || moves[0] // Fallback to first move if no best move found
  }

  // Make AI move automatically
  async makeAIMove() {
    if (this.isThinking || this.game.game_over() || this.game.turn() !== this.aiColor) {
      return
    }

    this.isThinking = true
    // Trigger state update to show thinking indicator
    const state = this.state()
    this.onChangeCallbacks.forEach(callback => callback(state))

    // Add a small delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 300))

    const bestMove = this.getBestMove()
    if (bestMove) {
      // Convert verbose move to simple move format
      const moveObj = {
        from: bestMove.from,
        to: bestMove.to
      }
      
      // Handle promotion (AI always promotes to queen)
      if (bestMove.promotion) {
        moveObj.promotion = 'q' // Always promote to queen (best choice)
      }

      // Call super.move to avoid triggering the AI move logic again
      await super.move(moveObj)
    }

    this.isThinking = false
    // Trigger state update to hide thinking indicator
    const finalState = this.state()
    this.onChangeCallbacks.forEach(callback => callback(finalState))
  }

  // Override move to trigger AI move after player's move
  async move(move, options = {}) {
    await super.move(move, options)
    
    // After player move, check if it's AI's turn
    if (!this.game.game_over() && this.game.turn() === this.aiColor) {
      // Use setTimeout to allow state to update first
      setTimeout(() => {
        this.makeAIMove()
      }, 100)
    }
  }

  // Override state to include AI-specific info
  state() {
    const baseState = super.state()
    return {
      ...baseState,
      playingAsColor: this.aiColor === 'w' ? 'b' : 'w', // Player plays opposite of AI
      isAITurn: this.game.turn() === this.aiColor,
      isThinking: this.isThinking
    }
  }
}

export default AIChessAPI

