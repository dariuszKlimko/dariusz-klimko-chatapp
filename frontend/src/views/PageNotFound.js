import { useContext, useEffect, useState } from 'react';
import '../App.css';
import RecaptchaResultContext from '../contexts/RecaptchaResultContext';
import RecaptchaTokenContext from '../contexts/RecaptchaTokenContext';
import CircularProgress from '@mui/material/CircularProgress';
 

function PageNotFound() {

  const [recaptchaResult, setRecaptchaResult] = useContext(RecaptchaResultContext)
  const [recaptchaToken, setRecaptchaToken] = useContext(RecaptchaTokenContext)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    recaptchaToken&&setLoading(false)
  },[recaptchaResult])
// --------------------------------------------------------------------------
  useEffect(()=>{
    if(recaptchaResult===''){
      const timer = setTimeout(()=>{
        setRecaptchaResult(false)
      },4000)
      return () => clearTimeout(timer)
    }
  },[])
// -------------------------------------------------------------------------
  return (
    <div className="App">
      <div style={{minHeight:'35vh'}}/>
      {loading?<CircularProgress/>:<div style={{fontSize:'150%'}}>Page not found.</div>}
    </div>
  );
}

export default PageNotFound;