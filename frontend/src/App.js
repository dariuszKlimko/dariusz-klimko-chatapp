import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import axios from 'axios';
import './App.css';
import Login from './views/Login';
import ForceLogout from './views/ForceLogout';
import Home from './views/Home'
import PageNotFound from './views/PageNotFound';
import UserDataContext from './contexts/UserDataContext'
import MessageInputDataContext from './contexts/MessageInputDataContext';
import ChatContext from './contexts/ChatContext';
import AllContactsContext from './contexts/AllContactsContext';
import HeightOfMessageInputContext from './contexts/HeightOfMessageInputContext';
import InputHeightContext from './contexts/InputHeightContext';
import MessageFlagContext from './contexts/MessageFlagContext'
import MobileContext from './contexts/MobileContext'
import AddFileContext from './contexts/AddFileContext'
import BottomInputNavbarContext from './contexts/BottomInputNavbarContext'
import MessageProgressContext from './contexts/MessageProgressContext'
import VideoContext from './contexts/VideoContext'
import CallUserFlagContext from './contexts/CallUserFlagContext'
import OfferVideoContext from './contexts/OfferVideoContext'
import PeerConnectionContext from './contexts/PeerConnectionContext'
import RemoteVideoContext from './contexts/RemoteVideoContext'
import CallMadeContext from './contexts/CallMadeContext'
import AnswerMadeContext from './contexts/AnswerMadeContext'
import ConversationFlagContext from './contexts/ConversationFlagContext'
import ImCallingFlagContext from './contexts/ImCallingFlagContext'
import MakeAnswerFlagContext from './contexts/MakeAnswerFlagContext'
import CandidateAnswerContext from './contexts/CandidateAnswerContext'
import AnswerVideoDisconnectFlagContext from './contexts/AnswerVideoDisconnectFlagContext';
import ContactsContext from './contexts/ContactsContext';
import BusyFlagContext from './contexts/BusyFlagContext';
import WebCamExistContext from './contexts/WebCamExistContext'
import AllCallsContext from './contexts/AllCallsContext'
import CameraPermissionContext from './contexts/CameraPermissionContext'
import MissedCallAnswerFlagContext from './contexts/MissedCallAnswerFlagContext'
import RecaptchaResultContext from './contexts/RecaptchaResultContext'
import RecaptchaTokenContext from './contexts/RecaptchaTokenContext';
import ConditionContext from './contexts/CondidionContext'
import DiscardContext from './contexts/DiscardContext'
import InteractContext from './contexts/InteractContext'
import OfflineContext from './contexts/OfflineContext'
import AudioMessageContext from './contexts/AudioMessageContext'
import AudioContactContext from './contexts/AudioContactContext'
import AudioCallingContext from './contexts/AudioCallingContext'
import AudioBusyContext from './contexts/AudioBusyContext'
import { createTheme, ThemeProvider } from '@mui/material';
import audio_1 from './audio/Messenger_-_Sound_Sms_Message_Tone_Notification_efepn7.mp3'
import audio_2 from './audio/Sms_Tone_p99loh.mp3'
import audio_3 from './audio/phone-calling-1_tdmwfg.mp3'
import audio_4 from './audio/phone-busy-1_nn011n.mp3'


const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 0,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});


function App() {

  const recaptchaVerivyUrl = '/recaptchaVerify'

  const script = document.createElement("script")

  const [audioMessage] = useState(new Audio(audio_1))
  const [audioContact] = useState(new Audio(audio_2))
  const [audioCalling] = useState(new Audio(audio_3))
  const [audioBusy] = useState(new Audio(audio_4))

  const [userData, setUserData] = useState('')
  const [allContacts, setAllContacts] = useState([])
  const [messageInputData, setMessageInputData] = useState('')
  const [chat, setChat] = useState([])
  const [heightOfMessageInput, setHeightOfMessageInput] = useState('')
  const [inputHeight, setInputHeight] = useState('')
  const [messageFlag, setMessageFlag] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [addFile, setAddFile] = useState(false)
  const [bottomInputNavbar, setBottomInputNavbar] = useState('')
  const [messageProgress, setMessageProgress] = useState('')
  const [video, setVideo] = useState(false)
  const [callUserFlag, setCallUserFlag] = useState(false)
  const [makeAnswerFlag, setMakeAnswerFlag] = useState(false)
  const [offerVideo, setOfferVideo] = useState('')
  const [peerConnection, setPeerConnection] = useState('')
  const [remoteVideo, setRemoteVideo] = useState('')
  const [callMade, setCallMade]  = useState('')
  const [answerMade, setAnswerMade] = useState('')
  const [conversationFlag, setConversationFlag] = useState(false)
  const [imCallingFlag, setImCallingFlag] = useState(false)
  const [candidateAnswer, setCandidateAnwser] = useState('')
  const [answerVideoDisconnectFlag, setAnswerVideoDisconnectFlag] = useState(false)
  const [contacts, setContacts] = useState(false)
  const [busyFlag, setBusyFlag] = useState(false)
  const [webCamExist, setWebCamExist] = useState(false)
  const [cameraPermission, setCameraPermission] = useState(false)
  const [allCalls, setAllCalls] = useState('')
  const [missedCallAnswerFlag, setMissedCallAnswerFlag] = useState(false)
  const [condition, setCondition] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [recaptchaResult, setRecaptchaResult] = useState('')
  const [interact, setInteract] = useState(false)
  const [offline, setOffline] = useState(false)
  
// -----------------------------------------------------------------------------
  const handleLoaded = _ => {
    window.grecaptcha.ready(_ => {
    window.grecaptcha
        .execute(`${process.env.REACT_APP_SITE_KEY}`, { action: "homepage" })
        .then(token => {
        setRecaptchaToken(token)
        })
    })
  }
  useEffect(() => {
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_SITE_KEY}`
      script.addEventListener("load", handleLoaded)
      document.body.appendChild(script)
  }, [])
  useEffect(()=>{
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const fetchData = async() =>{
      try{
        const data = {recaptchaToken: recaptchaToken}
        const result = await axios.post(recaptchaVerivyUrl, data, {cancelToken: source.token})
        setRecaptchaResult(result.data.recaptchaResult.success)
      }
      catch(error){
        if (axios.isCancel(error)) {
          console.log('/recaptchaVerify cleaned up');
        } else {
          console.log(error,'error')
        }
      }  
    }
    recaptchaToken&&fetchData()
    return () => {source.cancel()}
  },[recaptchaToken])
// ---------------------------------------------------------------
  return (
    <MessageInputDataContext.Provider value={[messageInputData, setMessageInputData]}>
    <AllContactsContext.Provider value={[allContacts, setAllContacts]}>
    <UserDataContext.Provider value={[userData, setUserData]}>
    <ChatContext.Provider value={[chat, setChat]}>
    <HeightOfMessageInputContext.Provider value={[heightOfMessageInput, setHeightOfMessageInput]}>
    <InputHeightContext.Provider value={[inputHeight, setInputHeight]}>
    <MessageFlagContext.Provider value={[messageFlag, setMessageFlag]}>
    <MobileContext.Provider value={[mobile, setMobile]}>
    <AddFileContext.Provider value={[addFile, setAddFile]}>
    <BottomInputNavbarContext.Provider value={[bottomInputNavbar, setBottomInputNavbar]}>
    <MessageProgressContext.Provider value={[messageProgress, setMessageProgress]}>
    <VideoContext.Provider value={[video, setVideo]}>
    <CallUserFlagContext.Provider value={[callUserFlag, setCallUserFlag]}>
    <OfferVideoContext.Provider value={[offerVideo, setOfferVideo]}>
    <PeerConnectionContext.Provider value={[peerConnection, setPeerConnection]}>
    <RemoteVideoContext.Provider value={[remoteVideo, setRemoteVideo]}>
    <CallMadeContext.Provider value={[callMade, setCallMade]}>
    <AnswerMadeContext.Provider value={[answerMade, setAnswerMade]}>
    <ConversationFlagContext.Provider value={[conversationFlag, setConversationFlag]}>
    <ImCallingFlagContext.Provider value={[imCallingFlag, setImCallingFlag]}>
    <MakeAnswerFlagContext.Provider value={[makeAnswerFlag, setMakeAnswerFlag]}>
    <CandidateAnswerContext.Provider value={[candidateAnswer, setCandidateAnwser]}>
    <AnswerVideoDisconnectFlagContext.Provider value={[answerVideoDisconnectFlag, setAnswerVideoDisconnectFlag]}>
    <ContactsContext.Provider value={[contacts, setContacts]}>  
    <BusyFlagContext.Provider value={[busyFlag, setBusyFlag]}>  
    <WebCamExistContext.Provider value={[webCamExist, setWebCamExist]}>
    <AllCallsContext.Provider value={[allCalls, setAllCalls]}>
    <CameraPermissionContext.Provider value={[cameraPermission, setCameraPermission]}>
    <MissedCallAnswerFlagContext.Provider value={[missedCallAnswerFlag, setMissedCallAnswerFlag]}>
    <RecaptchaResultContext.Provider value={[recaptchaResult, setRecaptchaResult]}>
    <RecaptchaTokenContext.Provider value={[recaptchaToken, setRecaptchaToken]}> 
    <ConditionContext.Provider value={[condition, setCondition]}>
    <DiscardContext.Provider value={[discard, setDiscard]}>
    <InteractContext.Provider value={[interact, setInteract]}>
    <OfflineContext.Provider value={[offline, setOffline]}>
    <AudioMessageContext.Provider value={[audioMessage]}>
    <AudioContactContext.Provider value={[audioContact]}>
    <AudioCallingContext.Provider value={[audioCalling]}>
    <AudioBusyContext.Provider value={[audioBusy]}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            {recaptchaResult&&<Route exact path='/' element={<Home />}/>}
            {recaptchaResult&&<Route path='/login' element={<Login />}/>}
            {recaptchaResult&&<Route path='/forceLogout' element={<ForceLogout />}/>}
            <Route path="*" element={<PageNotFound />}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AudioBusyContext.Provider>
    </AudioCallingContext.Provider>
    </AudioContactContext.Provider>
    </AudioMessageContext.Provider>
    </OfflineContext.Provider>
    </InteractContext.Provider>
    </DiscardContext.Provider> 
    </ConditionContext.Provider>
    </RecaptchaTokenContext.Provider>
    </RecaptchaResultContext.Provider>
    </MissedCallAnswerFlagContext.Provider>
    </CameraPermissionContext.Provider>
    </AllCallsContext.Provider>
    </WebCamExistContext.Provider>
    </BusyFlagContext.Provider>  
    </ContactsContext.Provider>
    </AnswerVideoDisconnectFlagContext.Provider>
    </CandidateAnswerContext.Provider>
    </MakeAnswerFlagContext.Provider>
    </ImCallingFlagContext.Provider>
    </ConversationFlagContext.Provider>
    </AnswerMadeContext.Provider>
    </CallMadeContext.Provider>
    </RemoteVideoContext.Provider>
    </PeerConnectionContext.Provider>
    </OfferVideoContext.Provider>
    </CallUserFlagContext.Provider>
    </VideoContext.Provider>
    </MessageProgressContext.Provider>
    </BottomInputNavbarContext.Provider>
    </AddFileContext.Provider>
    </MobileContext.Provider>
    </MessageFlagContext.Provider>
    </InputHeightContext.Provider>
    </HeightOfMessageInputContext.Provider>
    </ChatContext.Provider>
    </UserDataContext.Provider>
    </AllContactsContext.Provider>
    </MessageInputDataContext.Provider>
  );
}

export default App;