import './App.css'
import GameContainer from './game/GameContainer.js'
import Footer from './Footer.js'
import './firebaseInit.js'

function App() {
  return (
    <div className="App">
      <GameContainer />
      <Footer />
    </div>
  )
}

export default App
