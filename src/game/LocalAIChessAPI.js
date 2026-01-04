import LocalChessAPI from './LocalChessAPI.js'

const STOCKFISH_WORKER_URL = '/stockfish-17.1-lite-single-03e3232.js'

class AIChessAPI extends LocalChessAPI {
  constructor(difficulty, aiColor) {
    super()
    this.difficulty = difficulty
    this.aiColor = aiColor
    this.isThinking = false
    
    // Map difficulty to Stockfish skill level (0-20) and depth
    const { skillLevel, depth, movetime } = this.getStockfishSettings(difficulty)
    this.skillLevel = skillLevel
    this.depth = depth
    this.movetime = movetime
    
    // Initialize Stockfish engine as Web Worker
    // Using lite single-threaded build (no CORS required, smaller size)
    this.engineReady = false
    this.pendingMoveResolve = null
    this.uciInitialized = false
    
    // Create Web Worker with Stockfish build
    // File is copied to public folder as stockfish-[some-implementation-hash].js
    this.engine = new Worker(STOCKFISH_WORKER_URL)
    
    // Set up Stockfish message handler
    this.engine.onmessage = (event) => {
      const line = typeof event === "string" ? event : event.data
      
      if (line === 'uciok') {
        // Engine is ready, set skill level
        this.uciInitialized = true
        this.engine.postMessage(`setoption name Skill Level value ${this.skillLevel}`)
        this.engine.postMessage('isready')
      } else if (line === 'readyok') {
        // Engine is fully ready
        this.engineReady = true
        if (this.pendingMoveResolve) {
          // If we were waiting for engine to be ready, trigger move calculation
          this.calculateMove()
        }
      } else if (line.startsWith('bestmove')) {
        // Parse the best move
        const match = line.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/)
        if (match && this.pendingMoveResolve) {
          const moveString = match[1]
          this.pendingMoveResolve(moveString)
          this.pendingMoveResolve = null
        }
      }
    }
    
    this.engine.onerror = (error) => {
      console.error('Stockfish Worker error:', error)
    }
    
    // Initialize UCI
    this.engine.postMessage('uci')
  }

  getStockfishSettings(difficulty) {
    switch (difficulty) {
      case 'easy':
        return { skillLevel: 5, depth: 3, movetime: 500 }
      case 'medium':
        return { skillLevel: 10, depth: 5, movetime: 1000 }
      case 'hard':
        return { skillLevel: 15, depth: 8, movetime: 2000 }
      case 'impossible':
        return { skillLevel: 20, depth: 15, movetime: 3000 }
      default:
        return { skillLevel: 5, depth: 3, movetime: 500 }
    }
  }

  // Get the best move using Stockfish
  async getBestMove() {
    if (this.game.game_over()) {
      return null
    }

    const moves = this.game.moves({ verbose: true })
    if (moves.length === 0) {
      return null
    }

    // It should always be AI's turn when this is called
    if (this.game.turn() !== this.aiColor) {
      return null
    }

    return new Promise((resolve) => {
      this.pendingMoveResolve = (moveString) => {
        // Convert Stockfish move format (e.g., "e2e4") to chess.js format
        const from = moveString.substring(0, 2)
        const to = moveString.substring(2, 4)
        const promotion = moveString.length > 4 ? moveString[4] : null
        
        // Find the matching move in chess.js format
        const matchingMove = moves.find(m => 
          m.from === from && 
          m.to === to && 
          (!promotion || m.promotion === promotion)
        )
        
        resolve(matchingMove || { from, to, promotion })
      }
      
      if (this.engineReady) {
        this.calculateMove()
      }
    })
  }

  calculateMove() {
    // Set the position
    const fen = this.game.fen()
    this.engine.postMessage(`position fen ${fen}`)
    
    // Calculate best move with depth and time limits
    if (this.movetime) {
      this.engine.postMessage(`go depth ${this.depth} movetime ${this.movetime}`)
    } else {
      this.engine.postMessage(`go depth ${this.depth}`)
    }
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

    // Wait for engine to be ready if needed
    if (!this.engineReady) {
      await new Promise(resolve => {
        const checkReady = () => {
          if (this.engineReady) {
            resolve()
          } else {
            setTimeout(checkReady, 100)
          }
        }
        checkReady()
      })
    }

    const bestMove = await this.getBestMove()
    if (bestMove) {
      // Convert verbose move to simple move format
      const moveObj = {
        from: bestMove.from,
        to: bestMove.to
      }
      
      // Handle promotion (Stockfish returns promotion piece)
      if (bestMove.promotion) {
        moveObj.promotion = bestMove.promotion
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
