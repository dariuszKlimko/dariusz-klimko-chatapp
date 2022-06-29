import {useState, useContext, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../App.css';
import Text_Field from '../components/Text_Field';
import Button from '../components/Button';
import Condition from '../components/Condition';
import DiscardContext from '../contexts/DiscardContext';
import ConditionContext from '../contexts/CondidionContext.js';
import InteractContext from '../contexts/InteractContext';
import { CircularProgress, FormLabel } from '@mui/material';
import MuiPhoneNumber from 'material-ui-phone-number';


function ForceLogout() {

    const urlForceLogout = '/forceLogout'
    const urlVerifyForceLogout = '/verifyForceLogout'

    const accessTokenExist = Cookies.get('accessTokenExist')

    const navigate = useNavigate();
    const inputStyle = { WebkitBoxShadow: `0 0 0 1000px #8d93a0 inset` };

    const timerRef = useRef(null)

    const [logoutFlag, setLogoutFlag] = useState(false)
    const [serverMessage, setServerMessage] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [authorizationCode, setAuthorizationCode] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorTextField, setErrorTextField] = useState(false)

    const [condition, setCondition] = useContext(ConditionContext)
    const [discard, setDiscard] = useContext(DiscardContext)
    const [interact, setInteract] = useContext(InteractContext)
 
// -----------------------------------------------------------------------------
    useEffect(() => {
        if(accessTokenExist){
            setCondition(true)
        }
    },[])
// -----------------------------------------------------------------------------
    useEffect(()=>{
        return () => clearTimeout(timerRef.current)
    },[])
// -----------------------------------------------------------------------------
    const handlePhoneNumber = (value) =>{
        setPhoneNumber(value)
        if(errorTextField){
            setErrorTextField(false)
        }
    }
// -----------------------------------------------------------------------------
    const handleAuthorizationCode = (value) =>{
        setAuthorizationCode(value)
        if(errorTextField){
            setErrorTextField(false)
        }
    }
// -----------------------------------------------------------------------------
    const submitPhoneNumber = async() =>{
        try{
            setInteract(true)
            setErrorTextField(false)
            const result = await axios.put(urlForceLogout+'/'+phoneNumber)
            setLoading(true)
            if(result.data.logoutFlag){
                setLoading(false)
                setLogoutFlag(result.data.logoutFlag)
                setServerMessage(result.data.message)
                timerRef.current = setTimeout(() => {
                    setServerMessage(null)
                },1500)
            } else{
                setErrorTextField(true)
                setLoading(false)
                setServerMessage(result.data.message)
                timerRef.current = setTimeout(() => {
                    setServerMessage(null)
                },1500)
            }
        }
        catch(error){
            console.log(error,'error')
            setErrorTextField(true)
            setError(error.message)
        }
    }
// -----------------------------------------------------------------------------
    const submitAuthorizationCode = async () =>{
        try{
            setErrorTextField(false)
            const data = {force_logout_code: authorizationCode}
            const result = await axios.put(urlVerifyForceLogout+'/'+phoneNumber, data)
            setLoading(true)
            setPhoneNumber(null)
            setAuthorizationCode(null)
            if(result.data.verify){
                setLoading(false)
                setServerMessage(result.data.message)
                setLogoutFlag(false)
                navigate('/')
            } else{
                setLoading(false)
                setServerMessage(result.data.message)
                setErrorTextField(true)
                timerRef.current = setTimeout(() => {
                    setServerMessage(null)
                    setLogoutFlag(false)
                    setErrorTextField(false)
                    navigate('/login')
                },1500)
            }
        }
        catch(error){
            console.log(error,'error')
            setErrorTextField(true)
            setError(error.message)
        }
    }
// --------------------------------------------------------------------------------------------------
    return (
        <div>
            {(!condition&&!discard)&&<Condition/>}
            <div className="App" style={{opacity: (!condition||!discard)&&'0.3', pointerEvents: (!condition||!discard)&&'none'}}>
                <div className='topMargin'/>
                {error&&<div>{error}</div>}
                {!error&&<div>
                    <div className='inputLoginLabel'><FormLabel>force logout of user</FormLabel></div>
                    <br/><br/>
                    {!logoutFlag&&<div className='loginInput'>
                        <MuiPhoneNumber inputProps={{ style: inputStyle }} error={errorTextField} onChange={handlePhoneNumber} onKeyDown={(e)=> e.key==='Enter'&&submitPhoneNumber()}   defaultCountry={'pl'}  fullWidth  variant='outlined' />
                    </div>}
                    {logoutFlag&&<div className='loginInput'>
                        <Text_Field handleOnChange={handleAuthorizationCode} onKeyDown={submitAuthorizationCode} fullWidth={true} error={errorTextField} color='#8d93a0' label='authorization code'></Text_Field>
                    </div>}
                    <br/>
                    <div className='submitButton'>
                        <Button onClick={!logoutFlag?submitPhoneNumber:submitAuthorizationCode} disabled={((phoneNumber&&!authorizationCode&&!logoutFlag&&!loading)||(phoneNumber&&authorizationCode&&logoutFlag&&!loading))?false:true} fullWidth={true} label='submit'/>
                    </div>
                </div>}
                <br/>
                {serverMessage&&!error&&<div className='inputLoginLabel'>{serverMessage}</div>}
                {loading&&!error&&<div><br/><CircularProgress/><br/>Loading...</div>}   
            </div>
        </div>
    );
}

export default ForceLogout;