import { useState, useContext, useEffect, useRef } from 'react';
import socket from './Socket';
import uuid from 'react-uuid';
import '../App.css';
import useAxios from '../customHooks/useAxios';
import UserDataContext from '../contexts/UserDataContext';
import AllContactsContext from '../contexts/AllContactsContext';
import MobileContext from '../contexts/MobileContext';
import ChatContext from '../contexts/ChatContext';
import ContactsContext from '../contexts/ContactsContext'
import AllCallsContext from '../contexts/AllCallsContext'
import AddFileContext from '../contexts/AddFileContext';
import MessageInputDataContext from '../contexts/MessageInputDataContext';
import CallUserFlagContext from '../contexts/CallUserFlagContext';
import VideoContext from '../contexts/VideoContext';
import CameraPermissionContext from '../contexts/CameraPermissionContext';
import { Box, AppBar, Toolbar, IconButton, Avatar, Badge, Typography, MenuItem, Menu, Fade, ListItemButton, List, Collapse, LinearProgress, Container, Divider } from '@mui/material';
import EmailTwoToneIcon from '@mui/icons-material/EmailTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone';
import AddAPhotoTwoToneIcon from '@mui/icons-material/AddAPhotoTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import GroupTwoToneIcon from '@mui/icons-material/GroupTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import RemoveCircleTwoToneIcon from '@mui/icons-material/RemoveCircleTwoTone';
import PhoneEnabledTwoToneIcon from '@mui/icons-material/PhoneEnabledTwoTone';
import CallMadeTwoToneIcon from '@mui/icons-material/CallMadeTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';


function NavBar(props) {

  const urlLogout = '/logout'
  const urlDelete = '/deleteTel'
  const urlAddAvatar = '/addAvatar'
  const urlDeleteAvatar = '/deleteAvatar'

  const invitationRef = useRef([])

  const [anchorEl, setAnchorEl] = useState(null); // userMenu
  const [anchorElGroup, setAnchorElGroup] = useState(null); // userMenu
  const [anchorElCalls, setAnchorElCalls] = useState(null); // userMenu

  const open = Boolean(anchorEl); // userMenu
  const openGroup = Boolean(anchorElGroup); // userMenu
  const openCalls = Boolean(anchorElCalls); // userMenu

  const [openAvatar, setOpenAvatar] = useState(false); // avatar

  const [uploadedFile, setUploadedFile] = useState(null)
  const [flagAvatar, setFlagAvatar] = useState(false)
  const [color, setColor] = useState('info')
  const [noneSeenInvitations, setNoneSeenInvitations] = useState(0)
  const [noneSeenMessage, setNoneSeenMessage] = useState(0)
  const [noneSeenCalls, setNoneSeenCalls] = useState(0)
  const [data, setData] = useState('')

  const [userData, setUserData] = useContext(UserDataContext)
  const [allContacts, setAllContacts] = useContext(AllContactsContext)
  const [mobile, setMobile] = useContext(MobileContext)
  const [chat, setChat] = useContext(ChatContext)
  const [contacts, setContacts] = useContext(ContactsContext)
  const [allCalls, setAllCalls] = useContext(AllCallsContext)
  const [addFile, setAddFile] = useContext(AddFileContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [video, setVideo] = useContext(VideoContext)
  const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)
  const [cameraPermission, setCameraPermission] = useContext(CameraPermissionContext)

  const { response: responseDeleteAvatar, error: errorDeleteAvatar, fetchHook: fetchHookDeleteAvatar } = useAxios({url:urlDeleteAvatar+'/'+userData.tel, method:'delete', headers:null, data:{data:{avatar:userData.avatar}}})
  const { response: responseLogout, error: errorLogout, fetchHook: fetchHookLogout } = useAxios({url:urlLogout+'/'+userData.tel, method:'put', headers:null, data:null})
  const { response: responseAddAvatar, error: errorAddAvatar, fetchHook: fetchHookAddAvatar } = useAxios({url:urlAddAvatar+'/'+userData.tel+'/'+userData.name, method:'post', headers:null, data:data})
  const { response: responseDelete, error: errorDelete, fetchHook: fetchHookDelete } = useAxios({url:urlDelete+'/'+userData.tel, method:'delete', headers:null, data:{data:{avatar:userData.avatar}}})

  // ---------------userMenu---------------------------------------
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenAvatar(false)
  };
// ------------------------------------------------------
  const handleClickGroup = (e) => {
    setAnchorElGroup(e.currentTarget);
  };
  const handleCloseGroup = () => {
    setAnchorElGroup(null);
  };
// ------------------------------------------------------
  const handleClickCalls = (e) => {
    setAnchorElCalls(e.currentTarget);
  };
  const handleCloseCalls = () => {
    setAnchorElCalls(null);
  };
// ------------------------------------------------------
  const handleClickAvatar = () => {
    setOpenAvatar(!openAvatar);
  }; 
// -----------------------------------------------------
  useEffect(()=>{
    if(anchorElGroup){
      const result = allContacts.map(x=>{
        return {...x, seen: 1}
      })
      setAllContacts(result)
      socket.emit('contacts seen', {tel: userData.tel} )
    }
  },[anchorElGroup])
// -----------------------------------------------------
  useEffect(()=>{
    if(anchorElCalls){
      const result = allCalls.map(x=>{
        return {...x, seen: 1}
      })
      setAllCalls(result)
      socket.emit('calls seen', {tel: userData.tel} )
    }
  },[anchorElCalls])
// ---------------------------------------------------------------
  const handleLogout = async (e) =>{
    e.preventDefault()
    try{
      setAnchorEl(null)
      fetchHookLogout()
      window.location.href = '/login'
    } catch(error){
      console.log(error.message)
    }
  }
// ---------------------------------------------------------------
  const handleDelete = async (e) =>{
    e.preventDefault()
    try{
      if(window.confirm('Delete Your account?')){
        setAnchorEl(null)
        fetchHookDelete()
        window.location.href = '/login'
      }
    } catch(error){
      console.log(error.message)
    }
  }
// ---------------------------------------------------------------
  useEffect(() => {
    const fetchData = async() =>{
      try{
        if(uploadedFile!==null){
          setFlagAvatar(true)
          // ----------file upload-------------------------------
          let formData = new FormData();
          formData.append(`uploadedFile`, uploadedFile.file)
          //-----------------------------------------------------
          setData(formData)
          setUploadedFile(null)
          setFlagAvatar(false)
          setAnchorEl(null)
          setOpenAvatar(false)
        }
      } catch(error){
        console.log(error.message)
      }
    }
    fetchData()
  },[uploadedFile])

  useEffect(()=>{
    data&&fetchHookAddAvatar()
  },[data])

  useEffect(()=>{
    responseAddAvatar&&setUserData({tel: responseAddAvatar.tel, avatar: responseAddAvatar.avatar})
  },[responseAddAvatar])
// ---------------------------------------------------------
  useEffect(()=>{
    const result = allContacts&&allContacts.filter(x=>parseInt(x.seen)===0)
    setNoneSeenInvitations(result.length)
  },[allContacts])
// ---------------------------------------------------------
  useEffect(()=>{
    const result = chat&&chat.filter(x=>(x.conversation.length)).map(x=>x.conversation.filter(y=>parseInt(y.fromContact)!==parseInt(userData.tel)&&!parseInt(y.seen))).filter(x=>x.length)
    setNoneSeenMessage(result.length)
  },[chat])
// ---------------------------------------------------------------
  useEffect(()=>{
    if(allCalls){
      const result = allCalls.filter(x=>x.seen==0)
      setNoneSeenCalls(result.length)
    }
  },[allCalls])
// ---------------------------------------------------------------
  const handleDeleteImage = async () => {
    try{
      setFlagAvatar(true)
      fetchHookDeleteAvatar()
      setFlagAvatar(false)
      setAnchorEl(null)
      setOpenAvatar(false)
    } catch(error){
      console.log(error.message, 'error')
    }
  }
// ---------------------------------------------------------------
  useEffect(()=>{
    responseDeleteAvatar&&setUserData({tel: responseDeleteAvatar.tel, avatar: responseDeleteAvatar.avatar})
  },[responseDeleteAvatar])
// ------------------------------------------------------------------------------
  const handleMobileClick = () => {
    setMobile(false)
    setContacts(false)
  }
// ------------------------------------------------------------------------------
  const handleClickAccept = (contact, e) =>{
    e.preventDefault()
    socket.emit('accept', {
      tel: userData.tel,
      contact: contact
    })
    setAnchorElGroup(null)
  }
// ------------------------------------------------------------------------------
  const handleClickReject = (contact,e) =>{
    e.preventDefault()
    socket.emit('reject', {
      tel: userData.tel,
      contact: contact
    })
  }
// ------------------------------------------------------------------------------
  const handleClickUndoReject = (contact,e) =>{
    e.preventDefault()
    socket.emit('undo reject', {
      tel: userData.tel,
      contact: contact
    })
  }
// ------------------------------------------------------------------------------
  const handleClickDelete = (contact,e) =>{
    e.preventDefault()
    if(window.confirm('delete contact?')){
      socket.emit('delete contact', {
        tel: userData.tel,
        contact: contact
      })
      setAnchorElGroup(null)
    }
  }
// -----------------------------------------------------------------------------
  const checkIfActiveFunction = (tel) =>{
    if(allContacts.length!=0){
      let arr = [...allContacts]
      arr.push({contacts: tel})
      const result = arr.find(x=>parseInt(x.contacts)===parseInt(tel)).hasOwnProperty('socketId')
      return result
    }
  }
// -----------------------------------------------------------------------------
  const handleCallFunction = (tel, e) =>{
    e.preventDefault()
    const result = allContacts.find(x=>parseInt(x.contacts)===parseInt(tel))
    setMessageInputData({name: result.name, contact: parseInt(result.contacts), avatar: result.avatar, socketId: result.socketId})
    setAddFile(false)
    setVideo(true)
    setCallUserFlag(true)
    handleCloseCalls()
  }
// -----------------------------------------------------------------------------
  const timeFunction = (x) =>{
    return x.substr(16,9) +' '+x.substr(4,11)
  }
// --------------------------------------------------------------------------------------------------
  return (
    <div>
      <div style={{minHeight:'0.3vh'}}/>
      <Box 
        sx={{ 
          minWidth: '260px',
          flexGrow: 1,
          border: '1px solid black',
          borderRadius: 1,
        }}
      >
        <AppBar color='info' position="static">
          <Toolbar>
            <IconButton onClick={handleMobileClick}> 
              <Badge badgeContent={noneSeenMessage} color="success">
                <EmailTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
              </Badge>
            </IconButton>
            <IconButton
              id="group"
              aria-controls={openCalls ? 'calls' : undefined}
              aria-haspopup="true"
              aria-expanded={openCalls ? 'true' : undefined}
              onClick={handleClickCalls}
            > 
              <Badge badgeContent={noneSeenCalls} color="success">
                <PhoneEnabledTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
              </Badge>
            </IconButton>
            <IconButton
              id="group"
              aria-controls={openGroup ? 'group' : undefined}
              aria-haspopup="true"
              aria-expanded={openGroup ? 'true' : undefined}
              onClick={handleClickGroup}
            >
              <Badge badgeContent={noneSeenInvitations} color="success">
                <GroupTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
              </Badge>
            </IconButton>
            <Typography variant="h6" component="div" sx={{flexGrow: 1, color:'black', width:'inherit', textOverflow:'elipsis', whiteSpace:'nowrap', overflow:'hidden' }}>
                  {userData&&userData.tel}
                  <br/>
                  {props.yourIp}
            </Typography>
            <IconButton 
              id="fade-button"
              aria-controls={open ? 'fade-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <Avatar sx={{width: 43, height: 43, bgcolor: 'black'}} alt='altname' src={userData&&userData.avatar} />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>

    {/* ------------------------------------ */}
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
        <MenuItem onClick={handleLogout} disabled={flagAvatar?true:false}><LogoutTwoToneIcon/>&nbsp;&nbsp;Logout</MenuItem>
        <MenuItem onClick={handleClickAvatar} disabled={flagAvatar?true:false}><AccountCircleTwoToneIcon sx={{color: 'black'}}/>&nbsp;&nbsp;Avatar image</MenuItem>
          <Collapse in={openAvatar} timeout="auto" unmountOnExit>
            <List>
              {userData&&!userData.avatar&&<ListItemButton sx={{ pl: 5 }} component="label" disabled={flagAvatar?true:false}>
                <div style={{width:'100%'}}>
                  <AddAPhotoTwoToneIcon sx={{color: 'black'}}/>
                  <input
                    id='file'
                    hidden
                    required
                    type='file'
                    onChange={(e)=>{
                        if(e.target.files[0].size > 2200000){
                            alert("File is too big!");
                            e.target.value=''
                        } else{
                            setUploadedFile({file: e.target.files[0]})
                        }
                    }}
                  />&nbsp;&nbsp;Choose image
                  {flagAvatar&&<LinearProgress />}
                </div>
              </ListItemButton>}
              {userData&&userData.avatar&&<ListItemButton sx={{ pl: 5 }} onClick={handleDeleteImage} disabled={flagAvatar?true:false}>
                <div style={{width:'100%'}}>
                  <DeleteForeverTwoToneIcon sx={{color: 'black'}}/>&nbsp;&nbsp;Delete image
                  {flagAvatar&&<LinearProgress />}
                </div>
              </ListItemButton>}
            </List>
          </Collapse>
        <MenuItem onClick={handleDelete} disabled={flagAvatar?true:false}><DeleteForeverTwoToneIcon/>&nbsp;&nbsp;Delete user</MenuItem>
      </Menu>
    {/* ------------------------------------ */}
      <Menu
        id="group"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        sx={{
          maxHeight: '80vh'
        }}
        anchorEl={anchorElGroup}
        open={openGroup}
        onClose={handleCloseGroup}
        TransitionComponent={Fade}
      >
        <MenuItem style={{justifyContent:'center'}}>invitations</MenuItem>
        {allContacts&&allContacts.filter(y=>(!parseInt(y.accepted)&&!(parseInt(y.rejected)||parseInt(y.rejected_by_contact)))).map((x,i,arr)=><MenuItem ref={x=>(invitationRef.current[i] = x)} key={uuid()}>
          <Container
            sx={{
              backgroundColor: parseInt(x.accepted_by_contact)?`${color+'.main'}`:'#651fff',
              borderRadius: 1,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
              backgroundColor: parseInt(x.accepted_by_contact)?`${color+'.dark'}`:'#4615b2'
              },
            }}
          >   
            <Avatar sx={{width: 33, height: 33, bgcolor: 'black', margin: 1, marginLeft: -2.5}} alt={x.name} src={x.avatar} />
            &nbsp;
            <div style={{width:'95%'}}>
                <div style={{color:x.socketId?'lightgreen':'black'}}><b>{x.name}</b></div>
                <div className='partOfLastMessage'>{x.contacts}</div>
            </div>
            <IconButton onClick={(e)=>handleClickAccept(x.contacts,e)}>
              <CheckCircleTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
            </IconButton>
            <IconButton onClick={(e)=>handleClickReject(x.contacts,e)}>
              <RemoveCircleTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
            </IconButton>
            {!parseInt(x.seen)&&<div className='contactsSeen'/>}
          </Container>
          
        </MenuItem>)}
        {/* ------------------- */}
        <Divider style={{ background: 'black' }} />
        <MenuItem style={{justifyContent:'center'}}>rejected by you</MenuItem>
        {allContacts&&allContacts.filter(y=>(parseInt(y.rejected)&&!parseInt(y.accepted))).map((x,i,arr)=><MenuItem key={uuid()}>
          <Container
            sx={{
              backgroundColor: '#f44336',
              borderRadius: 1,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
              backgroundColor: '#d32f2f'
              },
            }}
          >   
            <Avatar sx={{width: 33, height: 33, bgcolor: 'black', margin: 1, marginLeft: -2.5}} alt={x.name} src={x.avatar} />
            &nbsp;
            <div style={{width:'95%'}}>
                <div style={{color:x.socketId?'lightgreen':'black'}}><b>{x.name}</b></div>
                <div className='partOfLastMessage'>{x.contacts}</div>
            </div>
            <IconButton onClick={(e)=>handleClickUndoReject(x.contacts,e)}>
              <CachedTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
            </IconButton>
            <IconButton onClick={(e)=>handleClickDelete(x.contacts,e)}>
              <DeleteForeverTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
            </IconButton>
          </Container>
        </MenuItem>)}
        <Divider style={{ background: 'black' }} />
        <MenuItem style={{justifyContent:'center'}}>rejected by other</MenuItem>
        {allContacts&&allContacts.filter(y=>(parseInt(y.rejected_by_contact)&&parseInt(y.accepted))).map((x,i,arr)=><MenuItem key={uuid()}>
          <Container
            sx={{
              backgroundColor: '#f44336',
              borderRadius: 1,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
              backgroundColor: '#d32f2f'
              },
            }}
          >   
            <Avatar sx={{width: 33, height: 33, bgcolor: 'black', margin: 1, marginLeft: -2.5}} alt={x.name} src={x.avatar} />
            &nbsp;
            <div style={{width:'95%'}}>
                <div style={{color:x.socketId?'lightgreen':'black'}}><b>{x.name}</b></div>
                <div className='partOfLastMessage'>{x.contacts}</div>
            </div>
            <IconButton disabled={true}>
              <CachedTwoToneIcon sx={{color: 'grey'}} fontSize='large'/>
            </IconButton>
            <IconButton onClick={(e)=>handleClickDelete(x.contacts,e)}>
              <DeleteForeverTwoToneIcon sx={{color: 'black'}} fontSize='large'/>
            </IconButton>
          </Container>
        </MenuItem>)}
      </Menu>
      {/* ------------------------------------ */}
      <Menu
        id="calls"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorElCalls}
        open={openCalls}
        onClose={handleCloseCalls}
        TransitionComponent={Fade}
      >
        <MenuItem style={{justifyContent:'center'}}>all calls</MenuItem>
        {allCalls&&allCalls.map((x,i,arr)=><MenuItem key={x.uuid}>
          <Container
            sx={{
              backgroundColor: '#5f6a83',
              borderRadius: 1,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
              backgroundColor: '#29b6f6'
              },
            }}
          >   
            <Avatar sx={{width: 33, height: 33, bgcolor: 'black', margin: 1, marginLeft: -2.5}} alt={x.name} src={x.avatar} />
            &nbsp;
            <div style={{width:'95%'}}>
                <div><b>{x.name}</b></div>
                <div style={{fontSize: '70%'}}>{timeFunction(x.created_at)}</div>
            </div>
            {(x.you_are_calling==1)&&(x.outcoming_ok==1)&&(x.outcoming_not==0)&&(x.incoming_ok==1)&&(x.incoming_not==0)&&<CallMadeTwoToneIcon style={{color: '#76ff03'}}/>}
            {(x.you_are_calling==1)&&(x.outcoming_ok==1)&&(x.outcoming_not==1)&&(x.incoming_ok==0)&&(x.incoming_not==0)&&<CallMadeTwoToneIcon style={{color: '#ff5722'}}/>}
            {(x.you_are_calling==1)&&(x.outcoming_ok==0)&&(x.outcoming_not==1)&&(x.incoming_ok==1)&&(x.incoming_not==0)&&<CallMadeTwoToneIcon style={{color: '#ffff00'}}/>}
            {(x.you_are_calling==0)&&(x.outcoming_ok==0)&&(x.outcoming_not==0)&&(x.incoming_ok==1)&&(x.incoming_not==0)&&<CallMadeTwoToneIcon style={{color: 'red'}}/>}

            {(x.you_are_calling==0)&&(x.outcoming_ok==1)&&(x.outcoming_not==0)&&(x.incoming_ok==1)&&(x.incoming_not==0)&&<CallReceivedTwoToneIcon style={{color: '#76ff03'}}/>}
            {(x.you_are_calling==0)&&(x.outcoming_ok==0)&&(x.outcoming_not==0)&&(x.incoming_ok==1)&&(x.incoming_not==1)&&<CallReceivedTwoToneIcon style={{color: '#ff5722'}}/>}
            {(x.you_are_calling==0)&&(x.outcoming_ok==1)&&(x.outcoming_not==0)&&(x.incoming_ok==0)&&(x.incoming_not==1)&&<CallReceivedTwoToneIcon style={{color: '#ffff00'}}/>}
            {(x.you_are_calling==1)&&(x.outcoming_ok==1)&&(x.outcoming_not==0)&&(x.incoming_ok==0)&&(x.incoming_not==0)&&<CallReceivedTwoToneIcon style={{color: 'red'}}/>}
            
            {cameraPermission&&<IconButton disabled={!checkIfActiveFunction(x.contact)} onClick={(e)=>handleCallFunction(x.contact,e)} >
              <PhoneEnabledTwoToneIcon sx={{color: !checkIfActiveFunction(x.contact)?'grey':'black'}} fontSize='large'/>              
            </IconButton>}
          </Container>
        </MenuItem>)}
      </Menu>
    </div>
  );
}

export default NavBar;