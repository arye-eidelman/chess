
import React from 'react'
import { DndProvider, createTransition } from 'react-dnd-multi-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'


const TouchTransition = createTransition('touchstart', (event) => {
  return event.touches != null;
})

const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true }, // Note that you can call your backends with options
      // preview: true,
      transition: TouchTransition
    }
  ]
};

const ResponsiveDndProvider = ({ children }) => {
  return (
    <DndProvider options={HTML5toTouch}>
      {children}
    </DndProvider>
  )
}

export default ResponsiveDndProvider