// components/Cursor.js
import {
    useWindowSize,
    useWindowWidth,
    useWindowHeight,
  } from '@react-hook/window-size'
import { useState, useEffect } from 'react';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const [width, height] = useWindowSize()

  const isCursorOnRightSide = position.x > width / 2;

  return (
    <div
      className={`cursor ${isCursorOnRightSide ? 'right' : 'left'}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
        <style jsx>
            {`
            
                /* styles/Cursor.css */
                .cursor {
                  position: fixed;
                  width: 40px;
                  height: 40px;
                  pointer-events: none;
                  mix-blend-mode: difference; /* Reduces the effect's opacity on light backgrounds */
                  border-radius: 50%;
                  background-color: rgba(255, 0, 0, 0.5); /* Adjust the red color and opacity as needed */
                  filter: blur(20px); /* Increase blur distance as needed */
                  opacity: 0.7; /* Adjust opacity as needed */
                  transition: opacity 0.3s;
                }
                
                .cursor.left {
                  opacity: 0.2; /* Adjust opacity for the left side */
                  background-color: rgba(0, 0, 0, 0.5); /* Adjust the background color for the left side */
                }
                
                .cursor.right {
                  opacity: 0.2; /* Adjust opacity for the right side */
                  background-color: rgba(0, 0, 0, 0.5); /* Adjust the background color for the right side */
                }
                
            `}
        </style>
    </div>
  );
};

export default Cursor;
