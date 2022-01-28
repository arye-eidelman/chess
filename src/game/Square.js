import { forwardRef } from 'react'

const Square = forwardRef((props, ref) => {
  const { isFocused, isUnderDrag, canPutDown, isDark } = props
  return (
    <div ref={ref} className={"inline-flex justify-center items-center w-full h-full overflow-hidden " + (
      isFocused ? (isDark ? "bg-[#f8f]" : "bg-[#fcf]")
        : isUnderDrag ? (isDark ? "bg-[#8ff]" : "bg-[#cff]")
          : canPutDown ? (isDark ? "bg-[#ff8]" : "bg-[#ffc]")
            : (isDark ? "bg-[#ccc]" : "bg-[#fff]")
    )}>
      {props.children}
    </div>
  )
})

export default Square