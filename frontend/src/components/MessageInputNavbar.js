import { useState, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import socket from './Socket.js';
import '../App.css';
import MessageInputDataContext from '../contexts/MessageInputDataContext';
import UserDataContext from '../contexts/UserDataContext';
import AllContactsContext from '../contexts/AllContactsContext';
import ChatContext from '../contexts/ChatContext';
import BottomInputNavbarContext from '../contexts/BottomInputNavbarContext';
import VideoContext from '../contexts/VideoContext';
import AddFileContext from '../contexts/AddFileContext';
import CallUserFlagContext from '../contexts/CallUserFlagContext';
import { Box, IconButton, Avatar, Typography, Menu, Fade, MenuItem } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import MessageProgressContext from '../contexts/MessageProgressContext.js';
import WebCamExistContext from '../contexts/WebCamExistContext';
import CameraPermissionContext from '../contexts/CameraPermissionContext.js';
import OfflineContext from '../contexts/OfflineContext.js';
import AnswerVideoDisconnectFlagContext from '../contexts/AnswerVideoDisconnectFlagContext';
import VideocamTwoToneIcon from '@mui/icons-material/VideocamTwoTone';


function NavBar() {

    const messageInputNavbarRef = useRef(null)

    const [anchorEl, setAnchorEl] = useState(null); // userMenu
    const open = Boolean(anchorEl); // userMenu

    const [accepted, setAccepted] = useState(false)

    const [chat, setChat] = useContext(ChatContext)
    const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
    const [userData, setUserData] = useContext(UserDataContext)
    const [allContacts, setAllContacts] = useContext(AllContactsContext)
    const [bottomInputNavbar, setBottomInputNavbar] = useContext(BottomInputNavbarContext)
    const [messageProgress, setMessageProgress] = useContext(MessageProgressContext)
    const [video, setVideo] = useContext(VideoContext)
    const [addFile, setAddFile] = useContext(AddFileContext)
    const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)
    const [webCamExist, setWebCamExist] = useContext(WebCamExistContext)
    const [cameraPermission, setCameraPermission] = useContext(CameraPermissionContext)
    const [offline, setOffline] = useContext(OfflineContext)
    const [answerVideoDisconnectFlag, setAnswerVideoDisconnectFlag] = useContext(AnswerVideoDisconnectFlagContext)

// ---------------userMenu---------------------------------------
    const handleClick = (e) => {
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
// --------------------------------------------------------- 
    useEffect(()=>{
        const result = messageInputNavbarRef.current.getBoundingClientRect().bottom
        setBottomInputNavbar(result)
    })
// ---------------------------------------------------------------
    const handleDeleteContactSocket = (e) =>{
        e.preventDefault()
        if(window.confirm(`Delete conversation with ${messageInputData.name}?`)){
            const result = chat.filter(x=>parseInt(x.conversationWith)!==parseInt(messageInputData.contact))
            setChat(result)
            const result_1 = allContacts.filter(x=>parseInt(x.contacts)!==parseInt(messageInputData.contact))
            setAllContacts(result_1)
            socket.emit('delete contact', { 
                tel: userData.tel, 
                contact: messageInputData.contact
            });
            setAnchorEl(null);
            if(allContacts){
                sessionStorage.setItem('contact',JSON.stringify(allContacts[0].contacts))
                localStorage.setItem('contact',JSON.stringify(allContacts[0].contacts))
                setMessageInputData({name: allContacts[0].name, contact: parseInt(allContacts[0].contacts), avatar: allContacts[0].avatar})
            }
        }  
    }
// ---------------------------------------------------------------
    const videoConnectFunction = () =>{
        setAddFile(false)
        setVideo(true)
        setCallUserFlag(true)
        setAnswerVideoDisconnectFlag(false)
    }
// ---------------------------------------------------------------
    useEffect(()=>{
        if(allContacts.length&&messageInputData){
            const result = allContacts.filter(x=>parseInt(x.contacts)===parseInt(messageInputData.contact))
            if((result[0]&&result[0].accepted==='1')&&(result[0]&&result[0].accepted_by_contact==='1')){
                setAccepted(true)
            }
            else{
                setAccepted(false)
            }
        }
    },[allContacts])
// --------------------------------------------------------------------------------------------------
    return (
        <div ref={messageInputNavbarRef} style={{opacity: video&&'0.5', pointerEvents:video&&'none'}}>
            <Box  
                sx={{
                    backgroundColor: '#5f6a83',
                    borderRadius: 1,
                    border: '1px solid black',
                    display: 'flex',
                    flexGrow: 1,
                    minHeight: 53,
                    alignItems: 'center'
                }}
            > 
                <div style={{minWidth:'4px'}}/>
                <Avatar sx={{width: 38, height: 38, bgcolor: 'black'}} alt='altname' src={messageInputData&&messageInputData.avatar} />
                <div className='progressContianer'>{(parseInt(messageInputData.contact)===parseInt(messageProgress.contact))&&'typing...'}</div>
                <Typography variant="h6" component="div" sx={{paddingLeft:2, paddingRight:5 , flexGrow: 1, whiteSpace:'nowrap', width:'inherit', textOverflow:'elipsis', whiteSpace:'nowrap', overflow:'hidden'  }}>
                    <b>{allContacts.length!=0?messageInputData.name:''}</b> &nbsp;&nbsp;
                    <span style={{fontSize:'0.7em', textOverflow:'ellipsis', whiteSpace:'nowrap', overflow:'hidden'}}><b>{allContacts.length!=0?`(${messageInputData.contact})`:''}</b></span>
                </Typography>
                {!callUserFlag&&!video&&webCamExist&&accepted&&cameraPermission&&!offline&&<IconButton onClick={messageInputData.socketId&&videoConnectFunction}>
                    <VideocamTwoToneIcon sx={{color: messageInputData.socketId&&'#76ff03'}}/>
                </IconButton>}
                <IconButton
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <MenuRoundedIcon sx={{float:'right'}}/>
                </IconButton>
            </Box>
            <Menu
                id="fade-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <MenuItem onClick={handleDeleteContactSocket}><DeleteForeverTwoToneIcon/>&nbsp;&nbsp;Delete conversation</MenuItem>
            </Menu>
        </div>
    );
}

export default NavBar;