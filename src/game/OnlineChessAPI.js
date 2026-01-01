import { getDatabase, ref, get, set, update, push, remove, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import Chess from 'chess.js'
import '../firebaseInit.js'

class NoAvailableGamesError extends Error {
  constructor(...params) {
    super(...params)
    this.name = "NoAvailableGamesError"
  }
}

const auth = getAuth();
const db = getDatabase();
// console.log(auth);

const games = {}

function extractGameState(game) {
  return {
    fen: game.fen(),
    turn: game.turn(),
    gameOver: game.game_over(),
    check: game.in_check(),
    checkmate: game.in_checkmate(),
    draw: game.in_draw(),
    stalemate: game.in_stalemate(),
    threefoldRepetition: game.in_threefold_repetition(),
    insufficient_material: game.insufficient_material(),
  }
}

function createGame() {
  const game = new Chess()

  const gameData = {
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    playerA: auth.currentUser.uid,
    playerB: null,
    whitePlayer: Math.random() < 0.5 ? auth.currentUser.uid : null,
    ...extractGameState(game)
  }
  return push(ref(db, 'games'), gameData).then(gameRef => {
    console.log("createGame success", gameRef.key)
    set(ref(db, 'waitList/' + gameRef.key), auth.currentUser.uid)
    return gameRef.key
  })
}

function joinGame() {
  return get(ref(db, 'waitList'))
    .then(waitList => {
      console.log(waitList.val())
      if (!waitList.val() || !Object.keys(waitList.val()).length) {
        console.log("Failed to Join game")
        return Promise.reject(new NoAvailableGamesError("No available games"))
      }
      const gameId = Object.keys(waitList.val())[0]

      console.log("joinGame found available game", gameId)
      return remove(ref(db, 'waitList/' + gameId))
        .then(() => {
          console.log("joinGame remove waitList successful")
          const gameRef = ref(db, 'games/' + gameId)
          return update(gameRef, {
            lastActiveAt: new Date().toISOString(),
            playerB: auth.currentUser.uid,
          }).then(() => {
            console.log("joinGame join successful", gameId)
            return gameRef.key
          })
        })
      // .catch(error => { console.log("joinGame remove waitList error", error) })
    })
}


function joinOrCreateGame() {
  return joinGame().catch(error => {
    if (error instanceof NoAvailableGamesError) {
      return createGame()
    } else { throw error }
  })
}


const ChessAPI = {
  play: (gameUpdatedCallback) => {
    return joinOrCreateGame()
      .then(gameId => {
        console.log(`ChessAPI.create: #${gameId}`)
        games[gameId] = new Chess()
        onValue(ref(db, 'games/' + gameId), game => {
          // console.log('game', game.val())
          gameUpdatedCallback({ ...game.val(), playingAsColor: game.val().whitePlayer === auth.currentUser.uid ? "w" : "b" })
          games[gameId].load(game.val().fen)
        })
        return gameId
      })
  },
  move: (id, move, options = {}) => {
    if (!games[id]) {
      console.error('ChessAPI.move: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.move: #${id}`, move)

    update(ref(db, 'games/' + id), {
      ...extractGameState(games[id])
    })
    return !!games[id].move(move, options)
  },
  onOpponentMove: (id, callback) => {
    callback(games[id].fen())
  },
  requestUndo: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.requestUndo: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.requestUndo: #${id}`)
    // ToDo: Ask the other player to accept undo
    return true
  },
  acceptUndo: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.acceptUndo: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.acceptUndo: #${id}`)
    games[id].undo()
    return true
  },
  requestDraw: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.requestDraw: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.requestDraw: #${id}`)
    // ToDo: Ask the other player to accept draw
    return true
  },
  acceptDraw: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.acceptDraw: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.acceptDraw: #${id}`)
    // ToDo: Accept draw by doing what?
    return true
  },
  resign: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.resign: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.resign: #${id}`)
    // ToDo: Resign by doing what?
    return true
  },
  fen: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.fen: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.fen: #${id} #${games[id].fen()}`)
    return games[id].fen()
  },
  state: (id) => {
    if (!games[id]) {
      console.error('ChessAPI.state: error missing game Id', id, games);
      return false
    }
    console.log(`ChessAPI.state: #${id}`)
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