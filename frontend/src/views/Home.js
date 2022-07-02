import {  useContext, useEffect, useRef, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import uuid from 'react-uuid';
import { useMediaQuery } from 'react-responsive';
import usePrevious from '../customHooks/usePrevious.js';
import useMouseMove from '../customHooks/useMouseMove.js';
import useAxios from '../customHooks/useAxios';
import '../App.css';
import socket from '../components/Socket.js';
import NavBar from '../components/NavBar';
import Search from '../components/Search';
import MessageInputNavbar from '../components/MessageInputNavbar';
import MessageInput from '../components/MessageInput';
import MessagePlace from '../components/MessagePlace';
import AddFile from '../components/AddFile.js';
import Video from '../components/Video.js';
import ConversationList from '../components/ConversationList';
import UserDataContext from '../contexts/UserDataContext';
import AllContactsContext from '../contexts/AllContactsContext';
import MessageInputDataContext from '../contexts/MessageInputDataContext';
import ChatContext from '../contexts/ChatContext';
import MobileContext from '../contexts/MobileContext';
import AddFileContext from '../contexts/AddFileContext';
import MessageProgressContext from '../contexts/MessageProgressContext';
import VideoContext from '../contexts/VideoContext';
import CallMadeContext from '../contexts/CallMadeContext';
import AnswerMadeContext from '../contexts/AnswerMadeContext';
import ConversationFlagContext from '../contexts/ConversationFlagContext';
import CandidateAnswerContext from '../contexts/CandidateAnswerContext';
import AnswerVideoDisconnectFlagContext from '../contexts/AnswerVideoDisconnectFlagContext';
import BusyFlagContext from '../contexts/BusyFlagContext';
import WebCamExistContext from '../contexts/WebCamExistContext';
import AllCallsContext from '../contexts/AllCallsContext';
import CameraPermissionContext from '../contexts/CameraPermissionContext.js';
import MissedCallAnswerFlagContext from '../contexts/MissedCallAnswerFlagContext';
import ConditionContext from '../contexts/CondidionContext.js';
import InteractContext from '../contexts/InteractContext'
import CallUserFlagContext from '../contexts/CallUserFlagContext.js';
import OfflineContext from '../contexts/OfflineContext.js';
import AudioMessageContext from '../contexts/AudioMessageContext'
import AudioContactContext from '../contexts/AudioContactContext'


function Home() {

  const urlContacts = '/contacts'
  const urlClearCookies = '/clearCookies'
  const urlCalls = '/calls'
  const urlConversations = '/conversations'

  const navigate = useNavigate();

  const timeStamp = new Date().toString()

  const isSmallScreen = useMediaQuery({ query: '(min-width: 610px)' })
  
  const accessTokenExist = Cookies.get('accessTokenExist')

  const searchRef = useRef(null)
  const subColumn1Ref = useRef(null)

  const [chatMessageRecieved, setChatMessageRecieved] = useState('')
  const [chatFileRecieved, setChatFileRecieved] = useState('')
  const [chatMessageProgress, setChatMessageProgress] = useState('')
  const [usersRecieved, setUsersRecieved] = useState('')
  const [chatMessageSeen, setChatMessageSeen] = useState('')
  const [chatMessageDelivered, setChatMessageDelivered] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [callsUpdate, setCallsUpdate] = useState('')
  const [contact, setContact] = useState('')
  const [insertContact, setInsertContact] = useState(false)
  const [yourIp, setYourIp] = useState('')

  const [userData, setUserData] = useContext(UserDataContext)
  const [allContacts, setAllContacts] = useContext(AllContactsContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [chat, setChat] = useContext(ChatContext)
  const [mobile, setMobile] = useContext(MobileContext)
  const [addFile, setAddFile] = useContext(AddFileContext)
  const [messageProgress, setMessageProgress] = useContext(MessageProgressContext)
  const [video, setVideo] = useContext(VideoContext)
  const [callMade, setCallMade]  = useContext(CallMadeContext)
  const [answerMade, setAnswerMade] = useContext(AnswerMadeContext)
  const [conversationFlag, setConversationFlag] = useContext(ConversationFlagContext)
  const [candidateAnswer, setCandidateAnswer] = useContext(CandidateAnswerContext)
  const [answerVideoDisconnectFlag, setAnswerVideoDisconnectFlag] = useContext(AnswerVideoDisconnectFlagContext)
  const [busyFlag, setBusyFlag] = useContext(BusyFlagContext)
  const [webCamExist, setWebCamExist] = useContext(WebCamExistContext)
  const [allCalls, setAllCalls] = useContext(AllCallsContext)
  const [cameraPermission, setCameraPermission] = useContext(CameraPermissionContext)
  const [missedCallAnswerFlag, setMissedCallAnswerFlag] = useContext(MissedCallAnswerFlagContext)
  const [condition, setCondition] = useContext(ConditionContext)
  const [interact, setInteract] = useContext(InteractContext)
  const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)
  const [offline, setOffline] = useContext(OfflineContext)
  const [audioMessage] = useContext(AudioMessageContext)
  const [audioContact] = useContext(AudioContactContext)

  const prevAllContacts = usePrevious(allContacts);
  const audioInteract = useMouseMove()
  const { response: responseGetConversations, error: errorGetConversations, fetchHook: fetchHookGetConversations } = useAxios({url:urlConversations, method: 'get', headers: null, data: null})

// --------------------------------------------------------------------------------------------------
  const recaptcha = document.querySelector('.grecaptcha-badge')
  recaptcha.style.display = 'none'
// -----------------------------------------------------
  useEffect(()=>{
    responseGetConversations&&setChat(responseGetConversations.conversations)
  },[responseGetConversations])
// -----------------------------------------------------
  useEffect(()=>{
    let cancelRequest = false
    !cancelRequest&&fetchHookGetConversations()
    return () => cancelRequest = true
  },[])
  // --------------------------------------------------------------------------------------------------
  useEffect(()=>{
    if(!interact){
      audioInteract&&setInteract(audioInteract)
    }
  },[audioInteract])
// --------------------------------------------------------------------------------------------------
  useEffect(() => {
      if(!accessTokenExist){
          navigate('/login')
      } else{
        setCondition(true)
      }
  },[])
// // --------------------------------------------------------------------------------------------------
  useEffect(()=>{
    if(chatMessageRecieved){
      const {uuid, toContact, fromContact, toSocketId, message, filePath, created_at } = chatMessageRecieved
      if(chat&&chat.length!==0){
        const result = [...chat]
        result.find((x,i)=>{
          if(parseInt(x.conversationWith)===parseInt(fromContact)){
            return x.conversation.push({uuid: uuid, message: message, filePath: filePath, fromContact: fromContact, created_at: created_at, seen: 0,  delivered: 0,})
          } 
          else if((parseInt(x.conversationWith)!==parseInt(fromContact))&&((result.length-1)===i)){
            return result.push({conversationWith: parseInt(fromContact), conversation: [{uuid: uuid, message: message, filePath: filePath, fromContact: fromContact, created_at: created_at, seen: 0, delivered: 0}]})
          }
        })
        setChat(result)
        interact&&audioMessage.play()
      }
      else if(chat&&chat.length===0){
        setChat([{conversationWith: parseInt(fromContact), conversation: [{uuid: uuid, message: message, filePath: filePath, fromContact: fromContact, created_at: created_at, seen: 0, delivered: 0}]}])
        interact&&audioMessage.play()
      }
    }
  },[chatMessageRecieved])
// --------------------------------------------------------------------------------------------------
  useEffect(()=>{
    if(chatFileRecieved){
      const {uuid, toContact, fromContact, toSocketId, message, filePath, created_at } = chatFileRecieved
      if(chat&&chat.length!==0){
        const result = [...chat]
        result.find((x,i)=>{
          if(parseInt(x.conversationWith)===parseInt(fromContact)){
            return x.conversation.push({uuid: uuid, message: message, filePath: filePath, fromContact: toContact, created_at: created_at, seen: 0,  delivered: 0,})
          } 
          else if((parseInt(x.conversationWith)!==parseInt(fromContact))&&((result.length-1)===i)){
            return result.push({conversationWith: parseInt(fromContact), conversation: [{uuid: uuid, message: message, filePath: filePath, fromContact: toContact, created_at: created_at, seen: 0, delivered: 0}]})
          }
        })
        setChat(result)
      }
      else if(chat&&chat.length===0){
        setChat([{conversationWith: parseInt(fromContact), conversation: [{uuid: uuid, message: message, filePath: filePath, fromContact: toContact, created_at: created_at, seen: 0, delivered: 0}]}])
      }
    }
  },[chatFileRecieved])
// --------------------------------------------------------------------------------------------------
  useEffect(()=>{
    if(chatMessageProgress){
      const {fromContact, toContact, toSocketId } = chatMessageProgress
      setMessageProgress({contact: fromContact})
    }
  },[chatMessageProgress])
// --------------------------------------------------------- 
  useEffect(()=>{
    if(usersRecieved){
      const result = allContacts&&allContacts.map(x => {
        let y = usersRecieved.find(z => z.tel === parseInt(x.contacts));
        return y ? { ...x,socketId: y.userID } : {avatar: x.avatar, contacts: x.contacts, accepted: x.accepted, accepted_by_contact: x.accepted_by_contact, rejected: x.rejected, rejected_by_contact: x.rejected_by_contact, created_at: x.created_at, id: x.id, seen: x.seen, name: x.name};
      });
      result&&result.sort((a,b)=>{
        return b.hasOwnProperty('socketId')-a.hasOwnProperty('socketId')
      });
      setAllContacts(result)
    }
  },[usersRecieved])
// --------------------------------------------------------- 
  useEffect(()=>{
    if(allContacts){
      const result = chat&&chat.filter(x=>{
        return allContacts.find(y=>{
          return parseInt(x.conversationWith)===parseInt(y.contacts)
        })
      })
      setChat(result)
    }
  },[allContacts])
  // --------------------------------------------------------- 
  useEffect(()=>{
    if(allContacts){
      let videoUser = allContacts.find(x=>parseInt(x.contacts)===parseInt(messageInputData.contact))
      if(videoUser&&!videoUser.hasOwnProperty('socketId')&&callUserFlag&&video){
        setAnswerVideoDisconnectFlag(true)
        socket.emit('activeUsers')
      }
    }
  },[allContacts,messageInputData])
// --------------------------------------------------------- 
  useEffect(()=>{
    if(contact){
      const  result = [...chat]
      const result_1 = chat.filter(x=>parseInt(contact)===parseInt(x.conversationWith))
      if(result_1.length===0){
        result.push({conversationWith: contact, conversation: []})
      }
      setChat(result)
    }
  },[contact])
// --------------------------------------------------------- 
  useEffect(()=>{
    const {toContact, fromContact, uuid} = chatMessageSeen
    const result = [...chat]
    if(chat.length!==0){
      result.find((x,i)=>{
        if(parseInt(x.conversationWith)===parseInt(fromContact)){
          x.conversation.find((y,j)=>{
            if(y.uuid==uuid){
              return y.seen=1
            }
          })
        } 
      })
    }
    setChat(result)
  },[chatMessageSeen])
// --------------------------------------------------------- 
  useEffect(()=>{
    const {contact} = chatMessageDelivered
    if(chat.length!==0){
      const result = chat.map((x) => {
        return {...x,conversationWith: (parseInt(x.conversationWith)!==parseInt(contact))?x.conversationWith:x.conversationWith, conversation: x.conversation.map(y=> {return {...y,delivered: (parseInt(y.fromContact)!==parseInt(contact))?y.delivered:1}}) }
      })
      setChat(result)
    }
  },[chatMessageDelivered])
// ---------------------------------------------------------------
  useEffect(()=>{
    if(callMade){
      const {offer, fromSocket} = callMade
      if(!video&&webCamExist){
        const result = allContacts&&allContacts.filter(x=>x.socketId==fromSocket)
        setMessageInputData({accepted: result[0].accepted, accepted_by_contact: result[0].accepted_by_contact, avatar: result[0].avatar, contact: result[0].contacts, name: result[0].name, rejected: result[0].rejected, socketId: fromSocket})
        setAnswerVideoDisconnectFlag(false)
        setVideo(true)
      } 
      else if(video||!webCamExist){
        const uid = uuid()
        socket.emit("user busy", {
          toSocket: fromSocket,
          created_at: timeStamp,
          uuid: uid
        })
      }
    }
  },[callMade])
// ---------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        if (stream.getVideoTracks().length > 0 && stream.getAudioTracks().length > 0){
          setWebCamExist(true)
        } else {
          setWebCamExist(false)
        }
      } 
      catch(error){
        console.log(error.message, 'error')
      }
    }
    !offline&&userData&&fetchData()
  },[userData, offline])
// ---------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(navigator.userAgent.match(/firefox|fxios/i)!==null){
          setCameraPermission(true)
        } else{
          const result = await navigator.permissions.query({ name: "camera" })
          if(result.state == "granted"){
            setCameraPermission(true)
          } else{
            setCameraPermission(false)
          }
        }
      }
      catch(error){
        console.log(error.message, 'error')
      }
    }
    !offline&&webCamExist&&fetchData()
  },[webCamExist, offline])
// ---------------------------------------------------------------
  useEffect(()=>{
    if(insertContact){
      socket.emit('activeUsers')
      interact&&audioContact.play()
      setInsertContact(false)
    }
  },[insertContact])
// ---------------------------------------------------------------
  useEffect(()=>{
    if(callsUpdate){
      const {uuid,name,contact,avatar,you_are_calling,outcoming_ok,outcoming_not,incoming_ok,incoming_not,seen,created_at} = callsUpdate
      let arr = [...allCalls]
      arr = arr.reverse()
      arr = [...arr,{id:'',uuid,name,contact,avatar,you_are_calling,outcoming_ok,outcoming_not,incoming_ok,incoming_not,seen,created_at}]
      arr = arr.reverse()
      setAllCalls(arr)
    }
  },[callsUpdate])
// ---------------------------------------------------------------
  useEffect(() => {
    if(offline){
      const result = [...allContacts]
      result.forEach(x => delete x.socketId )
      setAllContacts(result)
    }
  },[offline])

  const offlineFunction = () => {
    setOffline(true)
  }
  const onlineFunction = () =>{
    socket.emit('activeUsers')
    setOffline(false)
  }

  useEffect(()=>{
    window.addEventListener('online', () => onlineFunction());
    window.addEventListener('offline', () => offlineFunction());
    return () => {
      window.removeEventListener('offline', () => console.log('offline event listener cleaned up'));
      window.removeEventListener('online', () => console.log('online event listener cleaned up'));
    }
  },[])
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
  useEffect(()=>{
    if(userData){
      const username = userData.name
      const tel = userData.tel
      socket.auth = {username, tel}
      socket.connect()
    }
  },[userData])

  useEffect(()=>{
    socket.on('chat message', ({uuid, toContact, fromContact, toSocketId, message, filePath, created_at }) => {
      setChatMessageRecieved({uuid, toContact, fromContact, toSocketId, message, filePath, created_at })
    })
    return () => socket.off('chat message')
  },[])

  useEffect(()=>{
    socket.on('chat file', ({uuid, toContact, fromContact, toSocketId, message, filePath, created_at }) => {
      setChatFileRecieved({uuid, toContact, fromContact, toSocketId, message, filePath, created_at })
    })
    return () => socket.off('chat file')
  },[])
    
  useEffect(()=>{
    socket.on('message progress', ({fromContact, toContact, toSocketId }) => {
      setChatMessageProgress({fromContact, toContact, toSocketId })
    })
    return () => socket.off('message progress')
  },[])
    
  useEffect(()=>{
    socket.on('insert contact', ({contacts}) => {
      setAllContacts(contacts)
      setInsertContact(true)
    })
    return () => socket.off('insert contact')
  },[])

  useEffect(()=>{
    socket.on('insert contact me', ({contacts, contact}) => {
      setAllContacts(contacts)
      setContact(contact)
      socket.emit('activeUsers')
    })
    return () => socket.off('insert contact')
  },[])
    
  useEffect(()=>{
    socket.on('accept', ({contacts, contact}) => {
      setAllContacts(contacts)
      setContact(contact)
      socket.emit('activeUsers')
    })
    return () => socket.off('accept')
  },[])
   
  useEffect(()=>{
    socket.on('reject', ({contacts}) => {
      setAllContacts(contacts)
      socket.emit('activeUsers')
    })
    return () => socket.off('reject')
  },[])
    
  useEffect(()=>{
    socket.on('undo reject', ({contacts}) => {
      setAllContacts(contacts)
      socket.emit('activeUsers')
    })
    return () => socket.off('undo reject')
  },[])
    
  useEffect(()=>{
    socket.on('delete contact', ({contacts}) => {
      setAllContacts(contacts)
      setMessageInputData({name: allContacts[0]&&allContacts[0].name, contact: parseInt(allContacts[0]&&allContacts[0].contacts), avatar: allContacts[0]&&allContacts[0].avatar})
      socket.emit('activeUsers')
    })
    return () => socket.off('delete contact')
  },[])
    
  useEffect(()=>{
    socket.on("seen", ({toContact, fromContact, uuid}) => {
      setChatMessageSeen({toContact, fromContact, uuid})
    })
    return () => socket.off("seen")
  },[])
   
  useEffect(()=>{
    socket.on("delivered", ({contact}) => {
      setChatMessageDelivered({contact})
    })
    return () => socket.off("delivered")
  },[])
    
  useEffect(()=>{
    socket.on("users", (users) => {
      setUsersRecieved(users)
    })
    return () => socket.off("users")
  },[])
    
  useEffect(()=>{
    socket.on("call made", ({offer, fromSocket})=>{
      setCallMade({offer: offer, fromSocket: fromSocket})
    })
    return () => socket.off("call made")
  },[])
    
  useEffect(()=>{
    socket.on("user busy answer", () => {
      setBusyFlag(true)
    })
    return () => socket.off("user busy answer")
  },[])

  useEffect(()=>{
    socket.on("answer made", ({answer, fromSocket, candidate})=>{
      setAddFile(false)
      setAnswerMade({answer: answer, fromSocket: fromSocket, candidate: candidate})
    })
    return () => socket.off("answer made")
  },[])
    
  useEffect(()=>{
    socket.on("candidate answer", ({candidate, fromSocket})=>{
      setCandidateAnswer({candidate: candidate, fromSocket: fromSocket})
      setConversationFlag(true)
    })
    return () => socket.off("candidate answer")
  },[])
    
  useEffect(()=>{
    socket.on("answer video disconnect", ({fromSocket})=>{
      setAnswerVideoDisconnectFlag(true)
      // socket.emit('activeUsers')
    })
    return () => socket.off("answer video disconnect")
  },[])

  useEffect(()=>{
    socket.on("calls update", ({uuid,name,contact,avatar,you_are_calling,outcoming_ok,outcoming_not,incoming_ok,incoming_not,seen,created_at})=>{
      setCallsUpdate({id:'',uuid,name,contact,avatar,you_are_calling,outcoming_ok,outcoming_not,incoming_ok,incoming_not,seen,created_at})
    })
    return () => socket.off("calls update")
  },[])

  useEffect(()=>{
    socket.on("missed call answer", ({fromSocket})=>{
      setMissedCallAnswerFlag(true)
      socket.emit('activeUsers')
    })
    return () => socket.off("missed call answer")
  },[])
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
  useEffect(() => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const fetchData = async() =>{
      try{
        socket.emit('activeUsers')
        const result = await axios.get(urlContacts, {cancelToken: source.token})
        if(result.data.message==='all your contacts'){
          setUserData({name: result.data.name, tel: result.data.tel, avatar: result.data.avatar})
          setAllContacts(result.data.contacts)
        }
        else if(result.data.message==='no contacts in database'){
          setUserData({name: result.data.name, tel: result.data.tel, avatar: result.data.avatar})
        }
      }
      catch(error){
        if (axios.isCancel(error)) {
          console.log('/recaptchaVerify cleaned up');
        } else {
          console.log(error,'error')
          await axios.post(urlClearCookies, '', {cancelToken: source.token})
          window.location.href='/login'
        }
      }
    }
    accessTokenExist&&fetchData()
    return () => source.cancel()
  },[accessTokenExist])
// ---------------------------------------------------------------------------
  useEffect(()=>{
    const result = allContacts&&allContacts.filter(x=>parseInt(x.accepted)!==0)
    if(result.length>0&&result[0].hasOwnProperty('socketId')){
      setMessageInputData({name: result[0].name, contact: parseInt(result[0].contacts), accepted: result[0].accepted, accepted_by_contact: result[0].accepted_by_contact, rejected: result[0].rejected, avatar: result[0].avatar, socketId: result[0].socketId})
    } 
    else if(result.length>0&&!result[0].hasOwnProperty('socketId')){
      setMessageInputData({name: result[0].name, contact: parseInt(result[0].contacts), accepted: result[0].accepted, accepted_by_contact: result[0].accepted_by_contact, rejected: result[0].rejected, avatar: result[0].avatar})
    }
    else if(result.length===0){
      setMessageInputData('')
    }
  },[refresh])
// ----------------------------------------------------------------------------
  useEffect(()=>{
    const searchButtomDistance = searchRef.current.getBoundingClientRect().bottom
    subColumn1Ref.current.style.height = `${window.innerHeight-searchButtomDistance-10}px`
  })
// ----------------------------------------------------------------------------
  useEffect(()=>{
    if(allContacts){
      if(JSON.stringify(prevAllContacts)!== JSON.stringify(allContacts)){
        setRefresh(!refresh)
      } 
    }
  },[allContacts])
// --------------------------------------------------------------------------------------------------
  useEffect(()=>{
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const fetchData = async() =>{
      try{
        const result = await axios.get(urlCalls+'/'+userData.tel, {cancelToken: source.token})
        setAllCalls(result.data.reverse())
      }
      catch(error){
        if (axios.isCancel(error)) {
          console.log('/recaptchaVerify cleaned up');
        } else {
          console.log(error,'error')
        }
      }
    }
    userData&&fetchData()
    return () => source.cancel()
  },[userData])
// --------------------------------------------------------------------------------------------------
    return (
      <div className="App" style={{opacity: !condition&&'0.5', pointerEvents: !condition&&'none'}}>
        <div className='navbar'>
          {userData&&<NavBar
            yourIp = {yourIp}
          />}
        </div>
        <div style={{minHeight:'0.9vh'}}/>
        <div className='row'>
          <div className='column1' style={{ display:!isSmallScreen&&mobile&&'none', opacity: video&&'0.5', pointerEvents:video&&'none'}}>
            <div  ref={searchRef}>
              <Search/>
            </div>
            <div style={{minHeight:'0.9vh'}}/>
            <div ref={subColumn1Ref} className='subColumn1'>
              <ConversationList/>
            </div>
          </div>
          <div className='columnEmpty' style={{ display:!isSmallScreen&&'none'}}>&nbsp;</div>
          <div className="column2" style={{ display:!isSmallScreen&&!mobile&&'none'}}>
            <MessageInputNavbar/>
            {!addFile&&!video&&<div>
              <div style={{minHeight:'0.9vh'}}/>
              {userData&&<div>
                <MessagePlace/>
              </div>}
              <div style={{minHeight:'0.9vh'}}/>
              <MessageInput/>
              <div style={{minHeight:'0.9vh'}}/>
            </div>}
            {addFile&&!video&&<div>
              <div style={{minHeight:'0.9vh'}}/>
              <AddFile/>
            </div>}
            {video&&!addFile&&<div>
              <div style={{minHeight:'0.9vh'}}/>
              <Video/>
            </div>}
          </div>
        </div>
      </div>
    );
  }
  
  export default Home;