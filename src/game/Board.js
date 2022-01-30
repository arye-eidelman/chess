const Board = (props) => {
  return (
    <section className='
      grid
      h-[min(90vw,_90vh)]
      w-[min(90vw,_90vh)]
      p-[min(3vw,_3vh)]
      grid-rows-[repeat(8,_1fr)]
      grid-cols-[repeat(8,_1fr)]
    '>
      {props.children}
    </section>
  )
}

export default Board