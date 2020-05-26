import React from 'react'
import './App.css'
import Board from './game/Board.js'
import Footer from './Footer.js'

function App() {
  return (
    <div className="App">
      <Board knightsPosition={1} />
      <Footer />
    </div>
  )
}

export default App
