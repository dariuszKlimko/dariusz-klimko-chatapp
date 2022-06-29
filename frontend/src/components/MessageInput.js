import { useState, useEffect, useContext, useRef } from "react";
import socket from './Socket.js';
import uuid from 'react-uuid';
import '../App.css';
import TextareaAutosize from 'react-textarea-autosize';
import Picker from 'emoji-picker-react';
import { useMediaQuery } from 'react-responsive';
import UserDataContext from '../contexts/UserDataContext';
import ChatContext from '../contexts/ChatContext';
import MessageInputDataContext from "../contexts/MessageInputDataContext";
import HeightOfMessageInputContext from "../contexts/HeightOfMessageInputContext";
import InputHeightContext from "../contexts/InputHeightContext"
import MessageFlagContext from '../contexts/MessageFlagContext'
import AddFileContext from "../contexts/AddFileContext.js";
import CallUserFlagContext from "../contexts/CallUserFlagContext.js";
import { IconButton, Box, Popper } from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import SentimentSatisfiedTwoToneIcon from '@mui/icons-material/SentimentSatisfiedTwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';


function MessageInput() {

  const timeStamp = new Date().toString()
  
  const isSmallScreen901 = useMediaQuery({ query: '(min-width: 901px)' })
  const isSmallScreen610 = useMediaQuery({ query: '(max-width: 610px)' })

  const inputHeightRef = useRef(null)
  const timerRef = useRef(null)

  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [message, setMessage] = useState('')
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false)
  const [emit, setEmit] = useState(true)

  const [userData, setUserData] = useContext(UserDataContext)
  const [chat, setChat] = useContext(ChatContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [heightOfMessageInput, setHeightOfMessageInput] = useContext(HeightOfMessageInputContext)
  const [inputHeight, setInputHeight] = useContext(InputHeightContext)
  const [messageFlag, setMessageFlag] = useContext(MessageFlagContext)
  const [addFile, setAddFile] = useContext(AddFileContext)
  const [callUserFlag, setCallUserFlag] = useContext(CallUserFlagContext)

// ---------------------------------------------------------
  useEffect(()=>{
    setHeightOfMessageInput(inputHeightRef.current.clientHeight)
    setInputHeight(inputHeightRef.current.parentElement.getBoundingClientRect().top)
  })
// ---------------------------------------------------------
  useEffect(()=>{
    return () => clearTimeout(timerRef.current)
  },[])
// ---------------------------------------------------------
  window.addEventListener("resize", ()=>{
    if(inputHeightRef.current!==null){
      setInputHeight(inputHeightRef.current.parentElement.getBoundingClientRect().top)
    }
  })
// ---------------------------------------------------------
  useEffect(()=>{
    if(chosenEmoji){
      setMessage(message+chosenEmoji.emoji)
    }
  },[chosenEmoji])
// ---------------------------------------------------------
  const handleSetMessage = (arg) =>{
    if(emit===true){
      socket.emit('message progress', { fromContact: userData.tel, toContact: messageInputData.contact, toSocketId: messageInputData.socketId});
      setEmit(false)
    }
    else if(emit===false){
      timerRef.current = setTimeout(()=>{
        socket.emit('message progress', { fromContact: '', toContact: messageInputData.contact, toSocketId: messageInputData.socketId});
        setEmit(true)
      },2000)
    }
    setMessage(arg)
    setOpen(false)
  }
// ---------------------------------------------------------
  const sendMessage = (e) =>{
    if((message.trim()!="") || (message.trim().length!=0)){
      e.preventDefault()
      socket.emit('message progress', { fromContact: '', toContact: messageInputData.contact, toSocketId: messageInputData.socketId});
      setOpen(false)
      const uid = uuid()
      if(chat&&chat.length!==0){
        const result = [...chat]
        result.find((x,i)=>{
          if(parseInt(x.conversationWith)===parseInt(messageInputData.contact)){
            return x.conversation.push({uuid: uid, message: message, filePath: '', fromContact: userData.tel, created_at: timeStamp, seen: 0, delivered: 0})
          } 
          else if((parseInt(x.conversationWith)!==parseInt(messageInputData.contact))&&((result.length-1)===i)){
            return result.push({conversationWith: messageInputData.contact, conversation: [{uuid: uid, message: message, filePath: '', fromContact: userData.tel, created_at: timeStamp, seen: 0, delivered: 0}]})
          }
        })
        setChat(result)
      } 
      else if(chat&&chat.length===0){
        setChat([{conversationWith: messageInputData.contact, conversation: [{uuid: uid, message: message, filePath: '', fromContact: userData.tel, created_at: timeStamp, seen: 0, delivered: 0}]}])
      }
      socket.emit('chat message', { uuid: uid, toContact: messageInputData.contact, fromContact: userData.tel, toSocketId: messageInputData.socketId, message: message, created_at: timeStamp});
      setMessage('')
      setMessageFlag(!messageFlag)
    }
  }
// ---------------------------------------------------------
  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };
// ---------------------------------------------------------
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open)
  };
// ---------------------------------------------------------
  const setAddFileFunction = () => {
    setCallUserFlag(false)
    setAddFile(true)
  };
// ------------------------------------------------------------------------------------------
  return (
    <Box 
      sx={{
        backgroundColor: '#5f6a83',
        border: '1px solid black',
        borderRadius: '5px',
        display: 'flex',
        flexGrow: 1,
        minHeight: 33,
        alignItems: 'center',
        position: 'fixed',
        bottom: 4,
        width: isSmallScreen610?'99.2%':isSmallScreen901?'79.2%':'69.2%',
      }}
    >  
      &nbsp;&nbsp;
      <IconButton   onClick={handleClick} >
        <SentimentSatisfiedTwoToneIcon/>
      </IconButton>
      <IconButton  onClick={setAddFileFunction}>
        <AttachFileTwoToneIcon/>
      </IconButton>
      <Popper   open={open} anchorEl={anchorEl}>
        <Picker 
          onEmojiClick={onEmojiClick} 
          groupNames={{
            smileys_people: '',
            animals_nature: '',
            food_drink: '',
            travel_places: '',
            activities: '',
            objects: '',
            symbols: '',
            flags: '',
            recently_used: '',
          }} 
          disableSearchBar={true}  
          pickerStyle={{ 
            backgroundColor:'rgb(148, 155, 175)', 
            border:'1px solid black', 
            boxShadow: `0 0 0 rgb(148, 155, 175)`
          }}
        />
      </Popper>
      <TextareaAutosize
        ref={inputHeightRef}
        minRows={1}
        maxRows={5}
        onChange={e=>handleSetMessage(e.target.value)}
        value={message}
        onKeyDown={(e)=>e.key==='Enter'&&sendMessage(e)}
      />
      <div style={{ marginLeft:'auto', order:2}}>
        <IconButton  onClick={sendMessage}  >
          <SendTwoToneIcon />
        </IconButton>
      </div>
    </Box>
  );
}
  
export default MessageInput;