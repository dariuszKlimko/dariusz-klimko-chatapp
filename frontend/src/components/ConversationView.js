import { useState, useEffect, useContext, useRef } from "react";
import BottomInputNavbarContext from "../contexts/BottomInputNavbarContext";
import CallUserFlagContext from '../contexts/CallUserFlagContext'
import PeerConnectionContext from '../contexts/PeerConnectionContext'
import { IconButton } from '@mui/material';
import FullscreenTwoToneIcon from '@mui/icons-material/FullscreenTwoTone';
import FullscreenExitTwoToneIcon from '@mui/icons-material/FullscreenExitTwoTone';
import VideocamOffTwoToneIcon from '@mui/icons-material/VideocamOffTwoTone';
import ScreenShareTwoToneIcon from '@mui/icons-material/ScreenShareTwoTone';
import VideoCameraFrontTwoToneIcon from '@mui/icons-material/VideoCameraFrontTwoTone';

function ConversationView() {

  const videoHeightRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const movingVideoRef = useRef(null)
 
  const [fullScreen, setFullScreen] = useState(false)
  const [screenShare, setScreenShare] = useState(false)

  const [bottomInputNavbar, setBottomInputNavbar] = useContext(BottomInputNavbarContext)
  const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)
  const [peerConnection, setPeerConnection] = useContext(PeerConnectionContext)

// ------------------------------------------------------------------------------------------ 
  useEffect(()=>{
    movingVideoRef.current.addEventListener('dragstart',drag_start,false); 
    document.body.addEventListener('dragover',drag_over,false); 
    document.body.addEventListener('drop',drop,false); 
  },[])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    videoHeightRef.current.style.height = `${window.innerHeight-bottomInputNavbar-15}px`
  },[])
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
    var offset = e.dataTransfer.getData("text/plain").split(',');
    movingVideoRef.current.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
    movingVideoRef.current.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';
    e.preventDefault();
    return false;
  }
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      if(!screenShare){
        const constraints = { 
          audio: true, 
          video: { 
            width: (videoHeightRef.current.clientWidth), 
            height: (window.innerHeight-bottomInputNavbar-15) 
          } 
        };
        try {
          localVideoRef.current.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
          if(localVideoRef.current.srcObject.getTracks().length!==0){
            localVideoRef.current.srcObject.getTracks().forEach(track => setPeerConnection(peerConnection.addTrack(track, localVideoRef.current.srcObject)));
          }
        } catch(err) {
          console.error("Error: " + err);
        }
      }
    }
    fetchData()
  },[screenShare]) 
// -----------------------------------------------------------------------------------------
  useEffect(()=>{
    peerConnection.ontrack = e => {
      console.log(e.streams,'e.streams')
      e.streams.getTracks().forEach(track=>{
        remoteVideoRef.current.srcObject.addTrack(track)
      });
    };
  },[peerConnection])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const fetchData = async() =>{
      if(screenShare){
        const displayMediaOptions = {
          video: {
            cursor: "always"
          },
          audio: false
        };
        try {
          localVideoRef.current.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        } catch(err) {
          console.error("Error: " + err);
        }
      }
    }
    fetchData()
  },[screenShare])
// ------------------------------------------------------------------------------------------
  const openFullScreen = () =>{
    if (videoHeightRef.current.requestFullscreen) {
      videoHeightRef.current.requestFullscreen();
      setFullScreen(true)
    } else if (videoHeightRef.current.webkitRequestFullscreen) { /* Safari */
    videoHeightRef.current.webkitRequestFullscreen();
      setFullScreen(true)
    } else if (videoHeightRef.current.msRequestFullscreen) { /* IE11 */
    videoHeightRef.current.msRequestFullscreen();
      setFullScreen(true)
    }
  }
// ------------------------------------------------------------------------------------------  
  const closeFullscreen = () =>{
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullScreen(false)
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
      setFullScreen(false)
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
      setFullScreen(false)
    }
  }
// ------------------------------------------------------------------------------------------
  const videoDisconnectFunction = async () =>{
    localVideoRef.current.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    remoteVideoRef.current.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    setCallUserFlag(false)
  }
// ------------------------------------------------------------------------------------------
  const screenShareFunction = async () =>{
    fullScreen&&closeFullscreen()
    setScreenShare(true)
  }
// ------------------------------------------------------------------------------------------
  const disableScreenShareFunction = () =>{
    fullScreen&&closeFullscreen()
    setScreenShare(false)
  }
// ------------------------------------------------------------------------------------------
  return (
    <div ref={videoHeightRef} className='videoScreen'>
      <video autoPlay className="remoteVideo" ref={remoteVideoRef} style={{width: fullScreen&&'100%', height: fullScreen&&'100%'}}/>
      <aside draggable="true" id="dragme" ref={movingVideoRef}>
        <video autoPlay className='localVideo' ref={localVideoRef} muted />
      </aside>
      <div className="videoButtons">
        {!fullScreen&&<IconButton onClick={openFullScreen}>
          <FullscreenTwoToneIcon sx={{color:'white'}}/>
        </IconButton>}
        {fullScreen&&<IconButton onClick={closeFullscreen}>
          <FullscreenExitTwoToneIcon sx={{color:'white'}}/>
        </IconButton>}
        {callUserFlag&&<IconButton onClick={videoDisconnectFunction}>
          <VideocamOffTwoToneIcon sx={{color: 'red'}}/>
        </IconButton>}
        {!screenShare&&<IconButton onClick={screenShareFunction}>
          <ScreenShareTwoToneIcon sx={{color:'white'}}/>
        </IconButton>}
        {screenShare&&<IconButton onClick={disableScreenShareFunction }>
          <VideoCameraFrontTwoToneIcon sx={{color:'white'}}/>
        </IconButton>}
      </div>
    </div>
  );
}
  
export default ConversationView;
