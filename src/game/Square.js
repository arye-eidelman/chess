import { forwardRef } from 'react'

const Square = forwardRef((props, ref) => {
  const { isFocused, isUnderDrag, canPutDown, isDark, isLastMove } = props
  return (
    <div
      ref={ref}
      onClick={props.onClick}
      className={"inline-flex justify-center items-center w-full h-full overflow-hidden " + (
        isFocused ? (isDark ? "bg-[#f8f]" : "bg-[#fcf]")
          : isUnderDrag ? (isDark ? "bg-[#8ff]" : "bg-[#cff]")
            : canPutDown ? (isDark ? "bg-[#ff8]" : "bg-[#ffc]")
              : isLastMove ? (isDark ? "bg-[#bbd]" : "bg-[#ddf]")
                : (isDark ? "bg-[#ccc]" : "bg-[#fff]")
      )}
    >
      {props.children}
    </div>
  )
})

export default Square