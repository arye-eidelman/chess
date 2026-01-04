import Chess from 'chess.js'

class LocalChessAPI {
  onChangeCallbacks = []
  lastMove = null
  constructor() {
    this.game = new Chess()
    window.chess = this.game
  }

  async move(move, options = {}) {
    const moveResult = this.game.move(move, options)
    if (moveResult) {
      this.lastMove = {
        from: moveResult.from,
        to: moveResult.to
      }
    }
    const state = this.state()
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  async onChange(callback) {
    this.onChangeCallbacks.push(callback)
  }

  state() {
    return {
      fen: this.game.fen(),
      board: this.game.board(),
      SQUARES: this.game.SQUARES,
      turn: this.game.turn(),
      playingAsColor: this.game.turn(),
      gameOver: this.game.game_over(),
      check: this.game.in_check(),
      checkmate: this.game.in_checkmate(),
      draw: this.game.in_draw(),
      stalemate: this.game.in_stalemate(),
      threefoldRepetition: this.game.in_threefold_repetition(),
      insufficient_material: this.game.insufficient_material(),
      lastMove: this.lastMove,
      moveHistory: this.game.history({ verbose: true }),
    }
  }

  moves(...args) {
    return this.game.moves(...args)
  }

  // Resign the game
  async resign() {
    // Mark game as over with resignation
    // The current player loses (opponent wins)
    const state = this.state()
    state.gameOver = true
    state.resigned = true
    state.resignedBy = this.game.turn()
    state.checkmate = true // Opponent wins by checkmate
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Offer/accept draw
  async offerDraw() {
    // For local games, just accept the draw immediately
    const state = this.state()
    state.gameOver = true
    state.draw = true
    state.drawAccepted = true
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  async acceptDraw() {
    // Accept the draw - end game as draw
    const state = this.state()
    state.gameOver = true
    state.draw = true
    state.drawAccepted = true
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Undo last move
  async undo() {
    if (this.game.history().length === 0) {
      return // No moves to undo
    }
    this.game.undo()
    // Update lastMove based on remaining history
    const history = this.game.history({ verbose: true })
    this.lastMove = history.length > 0 ? {
      from: history[history.length - 1].from,
      to: history[history.length - 1].to
    } : null
    const state = this.state()
    this.onChangeCallbacks.forEach(callback => callback(state))
  }
}

export default LocalChessAPI