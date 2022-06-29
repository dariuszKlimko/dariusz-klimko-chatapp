import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './Socket.js';
import axios from 'axios';
import '../App.css';
import AllContactsContext from '../contexts/AllContactsContext';
import UserDataContext from '../contexts/UserDataContext';
import MuiPhoneNumber from 'material-ui-phone-number';
import LinearProgress from '@mui/material/LinearProgress';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import Collapse from '@mui/material/Collapse';


function Search() {

    const urlSearch = '/search'

    const navigate = useNavigate()

    const inputStyle = { WebkitBoxShadow: `0 0 0 1000px #5f6a83 inset`};

    const timerRef = useRef(null)

    const [phoneNumber, setPhoneNumber] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [serverMessage, setServerMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [errorFlag, setErrorFlag] = useState(false)
    const [text, setText] = useState(null)
    const [animation, setAnimation] = useState(false)
    const [contactExist, setContactExist] = useState(false)
    const [color, setColor] = useState('info')

    const [allContacts, setAllContacts] = useContext(AllContactsContext)
    const [userData, setUserData] = useContext(UserDataContext)

// ---------------------------------------------------------------
    useEffect(()=>{
        return () => clearTimeout(timerRef.current)
    },[])
// ---------------------------------------------------------------
    const handlePhoneNumber = (value) =>{
        setPhoneNumber(value)
        setText(value)
        if(searchResult||serverMessage){
            setServerMessage(null)
            setLoading(false)
            setAnimation(false)
            setSearchResult(null)
            setContactExist(false)
        }
    }
// ---------------------------------------------------------------
    const searchPhoneNumber = async () =>{
        try{
            setServerMessage(null)
            const result = await axios.get(urlSearch+'/'+phoneNumber)
            setLoading(true)
            setColor('info')
            if(result.data){
                if(result.data.message==='no contact in database'){
                    setContactExist(true)
                    setLoading(false)
                    setServerMessage(result.data.message)
                    setAnimation(true)
                    setPhoneNumber(null)
                    setText('+48')
                } else{
                    setLoading(false)
                    setAnimation(true)
                    setSearchResult(result.data.contact)
                    setServerMessage(result.data.message)
                    setPhoneNumber(null)
                    setText('+48')
                }
            } else{
                setLoading(false)
                setServerMessage(result.data.message)
                setPhoneNumber(null)
                setText('+48')
            }
        }
        catch(error){
            console.log(error.message)
            setError(error.message)
            setErrorFlag(true)
        }
    }
// ---------------------------------------------------------------
    const addToMyContactsSocket = () =>{
        if(parseInt(userData.tel)===parseInt(searchResult.contact)){
            setContactExist(true)
            setLoading(false)
            setServerMessage('this is Your contact')
            setColor('error')
        }
        else{
            if(allContacts.length!==0){
                allContacts.forEach((x,i)=>{
                    if(parseInt(x.contacts)===parseInt(searchResult.contact)){
                        setContactExist(true)
                        setLoading(false)
                        setServerMessage('contact already exist')
                        setColor('error')
                    } 
                    else if((allContacts&&allContacts.length-1)===i){
                        socket.emit('insert contact', { 
                            tel: userData.tel, 
                            myname: userData.name, 
                            avatar: userData.avatar, 
                            contact: searchResult.contact, 
                            name: searchResult.name
                        });
                        setContactExist(true)
                        setLoading(false)
                        setServerMessage('contact inserted')
                        setColor('success')
                        timerRef.current = setTimeout(() => {
                            setAnimation(false)
                            navigate('/')
                        },1500)
                    }
                })
            }
            else{
                socket.emit('insert contact', { 
                    tel: userData.tel, 
                    myname: userData.name, 
                    avatar: userData.avatar, 
                    contact: searchResult.contact, 
                    name: searchResult.name
                });
                setContactExist(true)
                setLoading(false)
                setServerMessage('contact inserted')
                setColor('success')
                timerRef.current = setTimeout(() => {
                    setAnimation(false)
                    navigate('/')
                },1500)
            }
        }
    }
// ---------------------------------------------------------------
    const clearSearch =  () => {
        setServerMessage(null)
        setLoading(false)
        setAnimation(false)
        setSearchResult(null)
        setContactExist(false)
    }
// --------------------------------------------------------------------------------------------------
    return (
        <div className="search">
            {<Collapse in={errorFlag}>
                <Container
                    sx={{
                        backgroundColor: '#dd2c00',
                        borderRadius: 1,
                        border: '1px solid black',
                        minHeight: 55,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                > 
                    <div style={{margin:'auto', textOverflow:'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{error}</div>
                    <IconButton sx={{marginRight: -2.5}} onClick={(e) => setErrorFlag(false)}>
                        <CancelTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
                    </IconButton>
                </Container>
            </Collapse>}
            {<Collapse in={!animation&&!errorFlag}>
                <Container
                autoFocus
                    sx={{
                        backgroundColor: '#5f6a83',
                        borderRadius: 1,
                        border: '1px solid black',
                        display: 'flex',
                        minHeight: 55,
                        alignItems: 'center',
                        '&:hover': {
                        border: '2px solid black',
                        }
                    }}
                >  
                    <div style={{width:'10px'}}/>
                    <MuiPhoneNumber inputProps={{ style: inputStyle }} InputProps={{ disableUnderline: true }}  value={text} onChange={handlePhoneNumber}  defaultCountry={'pl'}  fullWidth/>
                    <IconButton onClick={searchPhoneNumber} disabled={phoneNumber?false:true}>
                        <SearchIcon fontSize='large'/>
                    </IconButton>
                </Container>
            </Collapse>}
            {loading&&!error&&<div className='progressBar'><LinearProgress/></div>}
            {<Collapse in={animation}>
                <Container
                    sx={{
                        backgroundColor: `${color+'.dark'}`,
                        borderRadius: 1,
                        border: '1px solid black',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                        backgroundColor: `${color+'.main'}`
                        },
                    }}
                >   
                    <Avatar sx={{width: 33, height: 33, bgcolor: 'black', margin: 1, marginLeft: -2.5, marginRight: 0}} alt={searchResult&&searchResult.name} src="" />
                    <div style={{margin:'auto', whiteSpace:'nowrap', margin:'auto', textOverflow:'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                        {!contactExist&&<div><b>{searchResult&&searchResult.name}</b></div>}
                        {!contactExist&&<div style={{textOverflow:'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>+{searchResult&&searchResult.contact}</div>}
                        {contactExist&&<div style={{textOverflow:'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{serverMessage}</div>}
                    </div>
                    <IconButton sx={{marginRight: -2.5, marginLeft: 0}} onClick={addToMyContactsSocket} >
                        <CheckCircleTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
                    </IconButton>
                    &nbsp;
                    <IconButton sx={{marginRight: -2.5}} onClick={clearSearch}>
                        <CancelTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
                    </IconButton>
                </Container>
            </Collapse>}
        </div>
    );
}

export default Search;