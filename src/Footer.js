import React from 'react'

function Footer({ className }) {
  return (
    <footer className={className + " text-xs text-gray-700"}>
      <a className="a-default" href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">
        Chess Pieces</a> by <a className="a-default" href="https://en.wikipedia.org/wiki/User:Cburnett">
        Colin M.L. Burnett</a> under the<a className="a-default" href="http://creativecommons.org/licenses/by-sa/3.0/">
        CC BY-SA 3.0</a> licence
    </footer>
  )
}

export default Footer