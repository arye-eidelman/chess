import React from 'react'
// import Piece from './Piece.js'

const PromotionPicker = ({ pick }) => {
  return (
    <div>
      <p>Choose your piece</p>
      <button onClick={() => pick("queen")}>Queen</button>
      <button onClick={() => pick("rook")}>Rook</button>
      <button onClick={() => pick("bishop")}>Bishop</button>
      <button onClick={() => pick("knight")}>Knight</button>
    </div>
  );
}

export default PromotionPicker;