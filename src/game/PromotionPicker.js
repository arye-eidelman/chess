import Piece from './Piece.js'

const PromotionPicker = ({ pick, cancel, color }) => {
  return (
    <div className='bg-white m-5 p-5 shadow-2xl drop-shadow-2xl shadow-gray-800'>
      <div className='text-center'>Choose your piece</div>
      <button className='p-2.5 m-2.5 bg-[#ccc]' onClick={() => pick("queen")}><Piece type="queen" color={color}></Piece></button>
      <button className='p-2.5 m-2.5 bg-[#ccc]' onClick={() => pick("rook")}><Piece type="rook" color={color}></Piece></button>
      <button className='p-2.5 m-2.5 bg-[#ccc]' onClick={() => pick("bishop")}><Piece type="bishop" color={color}></Piece></button>
      <button className='p-2.5 m-2.5 bg-[#ccc]' onClick={() => pick("knight")}><Piece type="knight" color={color}></Piece></button>
      <br />

      <button onClick={cancel} className='p-2.5 m-2.5 bg-[#ccc] block text-center mx-auto w-[240px]'>Cancel</button>
    </div>
  );
}

export default PromotionPicker;