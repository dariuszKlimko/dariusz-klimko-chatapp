import { useState, useEffect, useContext, useRef, useLayoutEffect } from "react";
import socket from './Socket.js';
import uuid from 'react-uuid';
import { useMediaQuery } from 'react-responsive';
import Progress from "./progress/Progress.js";
import CallUserFlagContext from "../contexts/CallUserFlagContext";
import BottomInputNavbarContext from "../contexts/BottomInputNavbarContext";
import MessageInputDataContext from "../contexts/MessageInputDataContext";
import VideoContext from "../contexts/VideoContext.js";
import CallMadeContext from '../contexts/CallMadeContext.js';
import AnswerMadeContext from '../contexts/AnswerMadeContext.js';
import CandidateAnswerContext from '../contexts/CandidateAnswerContext.js';
import AnswerVideoDisconnectFlagContext from '../contexts/AnswerVideoDisconnectFlagContext';
import BusyFlagContext from '../contexts/BusyFlagContext';
import ConversationFlagContext from '../contexts/ConversationFlagContext';
import MissedCallAnswerFlagContext from "../contexts/MissedCallAnswerFlagContext";
import ImCallingFlagContext from "../contexts/ImCallingFlagContext.js";
import InteractContext from "../contexts/InteractContext.js";
import MobileContext from "../contexts/MobileContext.js";
import AudioCallingContext from '../contexts/AudioCallingContext'
import AudioBusyContext from '../contexts/AudioBusyContext'
import { IconButton } from '@mui/material';
import FullscreenTwoToneIcon from '@mui/icons-material/FullscreenTwoTone';
import FullscreenExitTwoToneIcon from '@mui/icons-material/FullscreenExitTwoTone';
import VideocamTwoToneIcon from '@mui/icons-material/VideocamTwoTone';
import VideocamOffTwoToneIcon from '@mui/icons-material/VideocamOffTwoTone';
import ScreenShareTwoToneIcon from '@mui/icons-material/ScreenShareTwoTone';
import VideoCameraFrontTwoToneIcon from '@mui/icons-material/VideoCameraFrontTwoTone';


function Video() {

  const timeStamp = new Date().toString()

  const isSmallScreen610 = useMediaQuery({ query: '(max-width: 610px)' })
  
  const videoHeightRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const movingVideoRef = useRef(null)

  const peer = useRef(null)
  const cndt = useRef([])

  const [fScreen, setFScreen] = useState(false)
  const [screenShare, setScreenShare] = useState(false)
  const [screenShareIcons, setScreenShareIcons] = useState(false)
  const [progressFlag, setProgressFlag] = useState(false)
  const [connected, setConnected] = useState(false)
  const [disconnect, setDisconnect] = useState(false)
  const [privateIp, setPrivateIp] = useState('')
  const [caller, setCaller] = useState(false)

  const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)
  const [bottomInputNavbar, setBottomInputNavbar] = useContext(BottomInputNavbarContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [video, setVideo] = useContext(VideoContext)
  const [callMade, setCallMade]  = useContext(CallMadeContext)
  const [answerMade, setAnswerMade] = useContext(AnswerMadeContext)
  const [imCallingFlag, setImCallingFlag] = useContext(ImCallingFlagContext)
  const [candidateAnswer, setCandidateAnswer] = useContext(CandidateAnswerContext)
  const [answerVideoDisconnectFlag, setAnswerVideoDisconnectFlag] = useContext(AnswerVideoDisconnectFlagContext)
  const [busyFlag, setBusyFlag] = useContext(BusyFlagContext)
  const [conversationFlag, setConversationFlag] = useContext(ConversationFlagContext)
  const [missedCallAnswerFlag, setMissedCallAnswerFlag] = useContext(MissedCallAnswerFlagContext)
  const [interact, setInteract] = useContext(InteractContext)
  const [mobile, setMobile] = useContext(MobileContext)
  const [audioCalling] = useContext(AudioCallingContext)
  const [audioBusy] = useContext(AudioBusyContext)

  const configuration = { 
    iceServers: 
    [
      {
        urls: process.env.REACT_APP_STUN_HOST
      },
      {
        urls: process.env.REACT_APP_TURN_HOST,
        username: process.env.REACT_APP_STUN_TURN_USERNAME,
        credential: process.env.REACT_APP_STUN_TURN_PASSWORD
      }
    ]
  };

// ---------------------------------------------------------
  const webrtcEventsFunction = (pc) =>{
    if(pc!=null){
      pc.onicecandidate = (e) =>{
        if(e.candidate) {
          socket.emit("candidate call", {
            candidate: e.candidate,
            toSocket: messageInputData.socketId
          })
        }
      }
      pc.ontrack = e =>{
        remoteVideoRef.current.srcObject = e.streams[0]
      }
      peer.current = pc
    }
  }
// ---------------------------------------------------------
  const webrtcCleanupFunction = async() =>{
    try{
      if( peer.current != null && localVideoRef.current.hasOwnProperty('srcObject')){ 
        localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(function(track) {
          track.stop();
        });
        if(peer.current!=null){
          await peer.current.close()
        }
        cndt.current = [] 
        peer.current = null
        setCallUserFlag(false)
        setAnswerMade('')
        setCandidateAnswer('')
        setDisconnect(false)
        setImCallingFlag(false)
        setConversationFlag(false)
        setVideo(false)
      }
      if(interact)audioCalling.pause()
      if(interact)audioBusy.pause()
    }
    catch(err){
      console.error("Error: " + err);
    }
  }
// ---------------------------------------------------------
  const checkIfFullScreen = () =>{
    document.addEventListener("fullscreenchange", function () {
      !document.fullscreen&&setDisconnect(true);
    }, false);
    document.addEventListener("mozfullscreenchange", function () {
      !document.mozFullScreen&&setDisconnect(true);
    }, false);
  
    document.addEventListener("webkitfullscreenchange", function () {
        !document.webkitIsFullScreen&&setDisconnect(true);
    }, false);
  }
// ---------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(interact)audioCalling.play()
        if(peer.current==null){
          !mobile&&setMobile(true)
          if(callUserFlag){
            setCaller(true)

            peer.current = new RTCPeerConnection(configuration)
            localVideoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
            localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(track=>peer.current.addTrack(track,localVideoRef.current.srcObject)) 
            if(peer.current!=null){
              const offer = await peer.current.createOffer();
              await peer.current.setLocalDescription(offer);
              socket.emit("call user", {
                offer: offer,
                toSocket: messageInputData.socketId
              })
            }
            webrtcEventsFunction(peer.current)
          }
        }
      }
      catch(err){
        console.error("Error: " + err);
      }
    }
    fetchData()
    return () => {
      webrtcCleanupFunction()
    }
  },[])
// ---------------------------------------------------------
  useEffect(()=>{
    let timer = null
    if(!connected&&callUserFlag){
      timer = setTimeout(()=>{
        const uid = uuid()
        if(interact)audioCalling.pause()
        if(interact)audioBusy.play()
        socket.emit("missed call", {
          toSocket: messageInputData.socketId,
          created_at: timeStamp,
          uuid: uid
        })
        setProgressFlag(true)
        setBusyFlag(false)
        webrtcCleanupFunction()
      },15000)
    }
    return () => {
      if(!connected&&callUserFlag){
        clearTimeout(timer)
      }
    }
  },[connected])
// --------------------------------------------------------------------------------
  const videoAcceptFunction = async () =>{
    try{
      setProgressFlag(true)

      peer.current = new RTCPeerConnection(configuration)
      webrtcEventsFunction(peer.current)

      const { offer, fromSocket} = callMade
      if(interact)audioCalling.pause()
      await peer.current.setRemoteDescription(offer)
      localVideoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({ audio: true, video: true,})
      localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(track=>peer.current.addTrack(track,localVideoRef.current.srcObject))
      if(localVideoRef.current.srcObject){
        const answer = await peer.current.createAnswer();
        await peer.current.setLocalDescription(answer);
        socket.emit("make answer", {
          answer: answer,
          toSocket: fromSocket
        });
      }
      setCallUserFlag(true)
      setConnected(true)
    }
    catch(err){
      console.error("Error: " + err);
    }
  }
// ------------------------------------------------------------------------------------------ 
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(interact)audioCalling.pause()
        const {answer, fromSocket, candidate} = answerMade
        await peer.current.setRemoteDescription(answer)
        const uid = uuid()
        socket.emit("answer made call", {
          toSocket: fromSocket,
          created_at: timeStamp,
          uuid: uid
        })
        setProgressFlag(true)
        setConnected(true)
      }
      catch(err){
        console.error("Error: " + err);
      }
    }
    answerMade&&fetchData()  
    return () => {
      if(answerMade){
        webrtcCleanupFunction()
      } 
    }
  },[answerMade])
// ------------------------------------------------------------------------------------------ 
  useEffect(()=>{
      if(candidateAnswer!=''){
        const {candidate, fromSocket} = candidateAnswer
        cndt.current = [...cndt.current, candidate]
        if(cndt.current.length!=0){
          cndt.current.map(c=>{
            localVideoRef.current&&localVideoRef.current.srcObject&&peer.current.addIceCandidate(c)
          })
        }
      }
  },[candidateAnswer])
// ------------------------------------------------------------------------------------------ 
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(answerVideoDisconnectFlag&&video){
          const result = fScreen&&closeFullscreen()
          if(result === true){
            checkIfFullScreen()
          }
          else{
            setDisconnect(true)
          }
          if(progressFlag===true||peer.current!=null){
            localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(function(track) {
              track.stop();
            });
          }
          if(callUserFlag&&!remoteVideoRef.current.srcObject) {
            if(interact)audioBusy.play()
          }
          if(interact)audioCalling.pause()
          if(peer.current!=null){
            await peer.current.close()
          }
          cndt.current = []
          peer.current =null
          setConversationFlag(false)
          setAnswerVideoDisconnectFlag(false)
          setCallUserFlag(false)
          setAnswerMade('')
          setCandidateAnswer('')
          setImCallingFlag(false)
          setVideo(false)
        }
      }
      catch(err){
        console.error("Error: " + err);
      }
    }
    fetchData() 
    return () => {
      if(answerVideoDisconnectFlag&&video){
        webrtcCleanupFunction()
      }
    }
  },[answerVideoDisconnectFlag])
// --------------------------------------------------------------------------
  useEffect(()=>{
    let timer = null
    if(busyFlag){
      setProgressFlag(true)
      if(interact)audioCalling.pause()
      if(interact)audioBusy.play()
      timer = setTimeout(()=>{
        setVideo(false)
        setCallUserFlag(false)
        setBusyFlag(false)
      },4000)
    }
    return () => clearTimeout(timer)
  },[busyFlag])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(progressFlag&&peer.current!=null){
          localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(function(track) {
            track.stop();
          });
        }
        if(interact)audioCalling.pause()
        if(peer.current!=null){
          await peer.current.close(); 
        }
        peer.current = null
        setConversationFlag(false)
        setMissedCallAnswerFlag(false)
        setCallUserFlag(false)
        setAnswerMade('')
        setCandidateAnswer('')
        setImCallingFlag(false)
        setVideo(false)
      }
      catch(err){
        console.error("Error: " + err);
      }
    }
    missedCallAnswerFlag&&fetchData()
    return () => {
      if(missedCallAnswerFlag){
        webrtcCleanupFunction()
      }
    }
  },[missedCallAnswerFlag])
// ------------------------------------------------------------------------------------------
  const videoScreenResize = () =>{
    if(remoteVideoRef.current){
      const rh = remoteVideoRef.current.clientHeight
      const rw = remoteVideoRef.current.clientWidth
      const vh = videoHeightRef.current.clientHeight
      const vw = videoHeightRef.current.clientWidth
      if((rh<=vh)){
        remoteVideoRef.current.style.width = `${vw}px`
        remoteVideoRef.current.style.maxHeight = `${vh}px`
      }
      if((rw)>=vw){
        remoteVideoRef.current.style.height = `${vh}px`
      }
    }
  }
// ------------------------------------------------------------------------------------------
  useLayoutEffect(()=>{
    videoScreenResize()
  })
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    let timer = null
    if(!fScreen&&videoHeightRef.current){
      timer = setTimeout(()=>{
        if(videoHeightRef.current)videoHeightRef.current.style.height = `${window.innerHeight-bottomInputNavbar-15}px`
        videoScreenResize()
      },50)
    }
    return () => clearTimeout(timer)
  },[fScreen])
// ------------------------------------------------------------------------------------------
  window.addEventListener("resize", ()=>{
    videoScreenResize()
  })
// ------------------------------------------------------------------------------------------ 
  useEffect(()=>{
    movingVideoRef.current.addEventListener('dragstart',drag_start,false); 
    document.addEventListener('dragover',drag_over,false); 
    document.addEventListener('drop',drop,false); 
  },[])
// ------------------------------------------------------------------------------------------
  useLayoutEffect(()=>{
    videoHeightRef.current.style.height = `${window.innerHeight-bottomInputNavbar-15}px`
  })
// ------------------------------------------------------------------------------------------  
  const drag_start = (e) =>{
    var style = window.getComputedStyle(e.target, null);
    e.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"),10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - e.clientY));
  } 
  const drag_over = (e) =>{ 
    e.preventDefault(); 
    return false; 
  } 
  const drop = (e) =>{ 
    e.preventDefault();
    var offset = e.dataTransfer.getData("text/plain").split(',');
    if(movingVideoRef.current === null){
      return false
    } else{
      movingVideoRef.current.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
      movingVideoRef.current.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';
    }
    return false
  }
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(!screenShare&&localVideoRef.current&&localVideoRef.current.srcObject){
          const constraints = { 
            audio: true, 
            video: { 
              width: (videoHeightRef.current.clientWidth), 
              height: (window.innerHeight-bottomInputNavbar-15) 
            } 
          };
          const videoTrack = localVideoRef.current&&localVideoRef.current.srcObject.getVideoTracks()[0];
          const sender = localVideoRef.current&&localVideoRef.current.srcObject&&peer.current.getSenders().find(function(s) {
              return s.track.kind == videoTrack.kind;
          });
          localVideoRef.current.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
          const videoTrackMixer = localVideoRef.current&&localVideoRef.current.srcObject.getVideoTracks()[0];
          sender.replaceTrack(videoTrackMixer);
          setScreenShareIcons(false)
        }
      }
      catch(err){
        console.error("Error: " + err);
      }
    }
    fetchData()  
  },[screenShare]) 
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        if(screenShare&&localVideoRef.current&&localVideoRef.current.srcObject){
          let displayMediaOptions = {
            video: {
              cursor: "always",
            },
            audio: false
          };
          const videoTrack = localVideoRef.current&&localVideoRef.current.srcObject.getVideoTracks()[0];
          const sender = localVideoRef.current&&localVideoRef.current.srcObject&&peer.current.getSenders().find(function(s) {
              return s.track.kind == videoTrack.kind;
          });
          localVideoRef.current.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
          const videoTrackMixer = localVideoRef.current&&localVideoRef.current.srcObject.getVideoTracks()[0];
          sender.replaceTrack(videoTrackMixer);
          setScreenShareIcons(true)
        }
      }
      catch(err){
        setScreenShare(false)
        console.error("Error: " + err);
      }
    }
    fetchData() 
  },[screenShare])
// ------------------------------------------------------------------------------------------
  const openFullScreen = () =>{
    if (videoHeightRef.current.requestFullscreen) {
      videoHeightRef.current.requestFullscreen();
      setFScreen(true)
    } else if (videoHeightRef.current.webkitRequestFullscreen) { /* Safari */
    videoHeightRef.current.webkitRequestFullscreen();
      setFScreen(true)
    } else if (videoHeightRef.current.msRequestFullscreen) { /* IE11 */
    videoHeightRef.current.msRequestFullscreen();
      setFScreen(true)
    }
  }
// ------------------------------------------------------------------------------------------  
  const closeFullscreen = () =>{
    if (document.exitFullscreen) {
      setFScreen(false)
      document.exitFullscreen();
      return true
    } else if (document.webkitExitFullscreen) { /* Safari */
      setFScreen(false)
      document.webkitExitFullscreen();
      return true
    } else if (document.msExitFullscreen) { /* IE11 */
      setFScreen(false)
      document.msExitFullscreen();
      return true
    }
  }
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      if(!busyFlag){
        const uid = uuid()
        socket.emit("call video disconnect", {
          toSocket: messageInputData.socketId,
          created_at: timeStamp,
          uuid: uid,
          connected: connected,
          disconnect: caller?'is_calling':'is_receiving'
        })
      }
      if(peer.current!=null){
        localVideoRef.current&&localVideoRef.current.srcObject.getTracks().forEach(function(track) {
          track.stop();
        });
      }
      if(peer.current!=null){
        await peer.current.close()
      } 
      cndt.current = []
      peer.current = null
      setDisconnect(false)
      setConversationFlag(false)
      setCallUserFlag(false)
      setAnswerMade('')
      setCandidateAnswer('')
      setImCallingFlag(false)
      setVideo(false)
    }
    disconnect&&fetchData()
    return () => disconnect&&setDisconnect(false)
  },[disconnect])
// ------------------------------------------------------------------------------------------
  const videoDisconnectFunction = () =>{
    const result = fScreen&&closeFullscreen()
    if(result === true){
      checkIfFullScreen()
    }
    else{
      setDisconnect(true)
    }
  }
// ------------------------------------------------------------------------------------------
  const screenShareFunction = async () =>{
    fScreen&&closeFullscreen()
    setScreenShare(true)
  }
// ------------------------------------------------------------------------------------------
  const disableScreenShareFunction = () =>{
    fScreen&&closeFullscreen()
    setScreenShare(false)
  }
// ------------------------------------------------------------------------------------------
  return (
    <div ref={videoHeightRef}  className='videoScreen'>
      {<div>
        <video autoPlay className="remoteVideo" ref={remoteVideoRef} style={{width: fScreen&&'100%', height: fScreen&&'100%'}}/>
        <aside draggable="true" id="dragme" ref={movingVideoRef}>
          <video autoPlay className='localVideo' ref={localVideoRef} muted />
        </aside>
        {!progressFlag&&<Progress
          name={messageInputData.name}
          tel={messageInputData.contact}
        />}
        <div style={{color: 'blue', fontSize: '150%'}}>{privateIp}</div>
        <div className="videoButtons">
          {!isSmallScreen610&&!fScreen&&<IconButton onClick={openFullScreen} disabled={localVideoRef.current&&localVideoRef.current.srcObject?false:true}>
            <FullscreenTwoToneIcon sx={{color:'white'}}/>
          </IconButton>}
          {!isSmallScreen610&&fScreen&&<IconButton onClick={closeFullscreen}>
            <FullscreenExitTwoToneIcon sx={{color:'white'}}/>
          </IconButton>}
          <IconButton onClick={videoDisconnectFunction} disabled={(localVideoRef.current&&localVideoRef.current.srcObject||!caller)?false:true}>
            <VideocamOffTwoToneIcon sx={{color:'red'}}/>
          </IconButton>
          {(!callUserFlag)&&<IconButton onClick={videoAcceptFunction} disabled={!progressFlag?false:true}>
            <VideocamTwoToneIcon sx={{color:'#76ff03'}}/>
          </IconButton>}
          {!isSmallScreen610&&!screenShareIcons&&<IconButton onClick={screenShareFunction} disabled={localVideoRef.current&&localVideoRef.current.srcObject?false:true}>
            <ScreenShareTwoToneIcon sx={{color:'white'}}/>
          </IconButton>}
          {!isSmallScreen610&&screenShareIcons&&<IconButton onClick={disableScreenShareFunction}>
            <VideoCameraFrontTwoToneIcon sx={{color:'white'}}/>
          </IconButton>}
        </div>
      </div>}
    </div>
  );
}
  
export default Video;
