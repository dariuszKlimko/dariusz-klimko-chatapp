import { useEffect, useState } from 'react';
import axios from 'axios';


function useAxios({url, method, headers, data}) {

  const [funcStart, setFuncStart] = useState(null)
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  if(headers===null){
    headers = {cancelToken: source.token}
  } else{
    headers = {...headers, cancelToken: source.token}
  }

  useEffect(()=>{
    const fetchData = async() =>{
      try {
        const result = await axios[method](url, data, headers)
        setResponse(result.data);
      } 
      catch(error){
        if (axios.isCancel(error)) {
          console.log('useAxios cleaned up');
        } else {
          console.log(error,'error')
          setError(error);
        }
      }
      setFuncStart(false)
    }
    funcStart&&fetchData()
    return () => source.cancel()
  },[funcStart])

  const fetchHook = () => setFuncStart(true)

  return { response, error , fetchHook};
}

export default useAxios;