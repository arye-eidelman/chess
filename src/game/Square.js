import styled from 'styled-components/macro'

const Square = styled.div`
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ isFocused, isUnderDrag, canPutDown, isDark }) =>
    isFocused ? (isDark ? "#f8f" : "#fcf")
      : isUnderDrag ? (isDark ? "#8ff" : "#cff")
        : canPutDown ? (isDark ? "#ff8" : "#ffc")
          : (isDark ? "#ccc" : "#fff")
  };

`

export default Square