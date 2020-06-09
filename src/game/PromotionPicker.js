import React from 'react'
import styled from 'styled-components/macro'
import Piece from './Piece.js'

const Backdrop = styled.div`
  background-color: white;
  margin: 20px;
  padding: 20px;
  box-shadow: 16px 13px 72px 3px rgba(0,0,0,0.75);
`

const Button = styled.button`
  margin: 10px;
  padding: 10px;
  background-color: #ccc;
`
const Title = styled.h3`
  text-align: center;
`
const CancelButton = styled(Button)`
  display: block;
  text-align: center;
  margin-right: auto;
  margin-left: auto;
  width: 248px;
`

const PromotionPicker = ({ pick, cancel, color }) => {
  return (
    <Backdrop>
      <Title>Choose your piece</Title>
      <Button onClick={() => pick("queen")}><Piece type="queen" color={color}></Piece></Button>
      <Button onClick={() => pick("rook")}><Piece type="rook" color={color}></Piece></Button>
      <Button onClick={() => pick("bishop")}><Piece type="bishop" color={color}></Piece></Button>
      <Button onClick={() => pick("knight")}><Piece type="knight" color={color}></Piece></Button>
      <br />

      <CancelButton onClick={cancel} >Cancel</CancelButton>
    </Backdrop>
  );
}

export default PromotionPicker;