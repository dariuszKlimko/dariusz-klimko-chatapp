import { useEffect, useState } from "react";

function useClick() {
  const [click, setClick] = useState(false)
  useEffect(() => {
    const clickFunction = (e) => {setClick(true)}
    window.addEventListener('click', clickFunction)
    return () => window.removeEventListener('click', clickFunction)
  }, []);

  return click;
}

export default useClick