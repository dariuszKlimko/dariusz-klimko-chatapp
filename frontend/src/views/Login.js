import {useState, useEffect, useContext, useRef} from 'react';
import  { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import UserDataContext from '../contexts/UserDataContext';
import DiscardContext from '../contexts/DiscardContext';
import ConditionContext from '../contexts/CondidionContext.js';
import InteractContext from '../contexts/InteractContext';
import Text_Field from '../components/Text_Field';
import Button from '../components/Button';
import Condition from '../components/Condition';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import MuiPhoneNumber from 'material-ui-phone-number';
import '../App.css';


function Login() {

    const urlLogin = '/login'
    const urlVerify = '/verify'

    const navigate = useNavigate();
    const inputStyle = { WebkitBoxShadow: `0 0 0 1000px #8d93a0 inset` };
    
    const accessTokenExist = Cookies.get('accessTokenExist')

    const timerRef = useRef(null);

    const [loginFlag, setLoginFlag] = useState(false)
    const [serverMessage, setServerMessage] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [name, setName] = useState(null)
    const [authorizationCode, setAuthorizationCode] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorTextField, setErrorTextField] = useState(false)
    const [forceLogout, setForceLogout] = useState(false)
    const [eff, setEff] = useState(false)
  
    const [userData, setUserData] = useContext(UserDataContext)
    const [condition, setCondition] = useContext(ConditionContext)
    const [discard, setDiscard] = useContext(DiscardContext)
    const [interact, setInteract] = useContext(InteractContext)
// -----------------------------------------------------------------------------
    useEffect(() => {
        if(accessTokenExist){
            navigate('/')
            setCondition(true)
        }
    },[])
// -----------------------------------------------------------------------------
    useEffect(()=>{
        return () => clearTimeout(timerRef.current)
    },[])
// -----------------------------------------------------------------------------
    const handleName = (value) =>{
        setName(value)
        if(errorTextField){
            setErrorTextField(false)
        }
    }
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
            const data = {name: name, tel: phoneNumber}
            const result = await axios.post(urlLogin, data)
            setLoading(true)
            if(result.data.loginFlag){
                setLoading(false)
                setLoginFlag(result.data.loginFlag)
                setServerMessage(result.data.message)
                timerRef.current = setTimeout(() => {
                    setServerMessage(null)
                },1500)
            } else{
                setErrorTextField(true)
                if(result.data.otherDeviceIsActive){
                    setLoading(false)
                    setServerMessage(result.data.message)
                    setForceLogout(true)
                    timerRef.current = setTimeout(() => {
                        setServerMessage(null)
                    },1500)
                } else{
                    setLoading(false)
                    setServerMessage(result.data.message)
                    timerRef.current = setTimeout(() => {
                        setServerMessage(null)
                    },1500)
                }
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
            const data = {sms_code: authorizationCode}
            const result = await axios.put(urlVerify+'/'+phoneNumber, data)
            setLoading(true)
            setName(null)
            setPhoneNumber(null)
            setAuthorizationCode(null)
            if(result.data.verify){
                setLoading(false)
                setUserData({tel: result.data.tel})
                setServerMessage(result.data.message)
                setLoginFlag(false)
                navigate('/')
            } else{
                setLoading(false)
                setServerMessage(result.data.message)
                setErrorTextField(true)
                timerRef.current = setTimeout(() => {
                    setServerMessage(null)
                    setLoginFlag(false)
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
                    <div className='inputLoginLabel'><FormLabel>user verification</FormLabel></div>
                    <br/><br/>
                    {!loginFlag&&<div className='loginInput'>
                    <Text_Field handleOnChange={handleName} multiline={false} fullWidth={true} error={errorTextField} color='#8d93a0' label='name' variant='outlined'></Text_Field>
                    <br/><br/>
                    <MuiPhoneNumber inputProps={{ style: inputStyle }} error={errorTextField} onChange={handlePhoneNumber} onKeyDown={(e)=> e.key==='Enter'&&submitPhoneNumber()}   defaultCountry={'pl'}  fullWidth  variant='outlined' />
                    
                    </div>}
                    {loginFlag&&<div className='loginInput'>
                        <Text_Field handleOnChange={handleAuthorizationCode} onKeyDown={submitAuthorizationCode} multiline={false} fullWidth={true} error={errorTextField} color='#8d93a0' label='authorization code'></Text_Field>
                    </div>}
                    <br/>
                    <div className='submitButton'>
                        <Button onClick={!loginFlag?submitPhoneNumber:submitAuthorizationCode} disabled={((phoneNumber&&!authorizationCode&&!loginFlag&&!loading)||(phoneNumber&&authorizationCode&&loginFlag&&!loading))?false:true} fullWidth={true} label='submit'/>
                    </div>
                    <br/>
                    {forceLogout&&<div className='submitButton'>
                        <Link to='/forceLogout' style={{color:'inherit', textDecoration: 'inherit' }}>
                            <Button fullWidth={true} label='force logout'/>
                        </Link>
                    </div>}
                </div>}
                <br/>
                {serverMessage&&!error&&<div className='inputLoginLabel'>{serverMessage}</div>}
                {loading&&!error&&<div><br/><CircularProgress/><br/>Loading...</div>}   
            </div>
        </div>
    );
}

export default Login;