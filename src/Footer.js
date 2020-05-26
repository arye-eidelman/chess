import React from 'react'
import styled from 'styled-components/macro'

function Footer({ className }) {
  return (
    <footer className={className}>
      <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">
        Chess Pieces </a> by <a href="https://en.wikipedia.org/wiki/User:Cburnett">
        Colin M.L. Burnett </a> under the <a href="http://creativecommons.org/licenses/by-sa/3.0/">
        CC BY-SA 3.0 </a> licence
    </footer>
  )
}

const styledFooter = styled(Footer)`
  font-size: 0.7rem;
  color: #555;
`

export default styledFooter