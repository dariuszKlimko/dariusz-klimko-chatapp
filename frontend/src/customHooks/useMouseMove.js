import { useEffect, useState } from "react";

function useMouseMove() {
  const [position, setPosition] = useState({x: 0, y: 0})
  useEffect(() => {
    const positionFunction = (e) => {setPosition({x: e.clientX, y: e.clientY})}
    window.addEventListener('click', positionFunction)
    return () => window.removeEventListener('click', positionFunction)
  }, []);

  return position.x!=0||position.y!=0?true:false;
}

export default useMouseMove