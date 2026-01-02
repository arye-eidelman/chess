import Chess from 'chess.js'

class ChessAPI {
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
    }
  }

  moves(...args) {
    return this.game.moves(...args)
  }
}

export default ChessAPI