import Chess from 'chess.js'

let games = {}

const ChessAPI = {
  create: () => {
    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    console.log(`ChessAPI: #${id} create`)
    games[id] = new Chess()
    return id
  },
  move: (id, move, options = {}) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} move`, move)
    return !!games[id].move(move, options)
  },
  requestUndo: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} requestUndo`)
    // ToDo: Ask the other player to accept undo
    return true
  },
  acceptUndo: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} acceptUndo`)
    games[id].undo()
    return true
  },
  requestDraw: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} requestDraw`)
    // ToDo: Ask the other player to accept draw
    return true
  },
  acceptDraw: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} acceptDraw`)
    // ToDo: Accept draw by doing what?
    return true
  },
  resign: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} resign`)
    // ToDo: Resign by doing what?
    return true
  },
  fen: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} fen #${games[id].fen()}`)
    return games[id].fen()
  },
  state: (id) => {
    if (!games[id]) {
      console.error('ChessAPI: error missing game ID', id, games);
      return false
    }
    console.log(`ChessAPI: #${id} state`)
    return {
      fen: games[id].fen(),
      turn: games[id].turn(),
      gameOver: games[id].game_over(),
      check: games[id].in_check(),
      checkmate: games[id].in_checkmate(),
      draw: games[id].in_draw(),
      stalemate: games[id].in_stalemate(),
      threefoldRepetition: games[id].in_threefold_repetition(),
      insufficient_material: games[id].insufficient_material(),
    }
  }
}

export default ChessAPI