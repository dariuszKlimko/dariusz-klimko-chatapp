import { useContext, useEffect, useRef, useState } from 'react';
import uuid from 'react-uuid';
import socket from './Socket';
import '../App.css';
import ChatContext from '../contexts/ChatContext';
import MessageInputDataContext from "../contexts/MessageInputDataContext";
import UserDataContext from '../contexts/UserDataContext';
import HeightOfMessageInputContext from '../contexts/HeightOfMessageInputContext';
import InputHeightContext from '../contexts/InputHeightContext';
import AddFileContext from '../contexts/AddFileContext';
import { animateScroll } from "react-scroll";
import FileType from './FileType';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';


function MessagePlace() {

  const divHeightRef = useRef(null)

  const elRef = useRef([])
  const timerRef = useRef(null)

  const [width, setWidth] = useState('')

  const [chat, setChat] = useContext(ChatContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [userData, setUserData] = useContext(UserDataContext)
  const [heightOfMessageInput, setHeightOfMessageInput] = useContext(HeightOfMessageInputContext)
  const [inputHeight, setInputHeight] = useContext(InputHeightContext)
  const [addFile, setAddFile] = useContext(AddFileContext)

// -----------------------------------------------------
  useEffect(() => {
    animateScroll.scrollToBottom({duration: 0, containerId:'messagePlaceId'})
    return () => window.scrollTo(0, 0)
  }, [chat, messageInputData])
// -----------------------------------------------------
  useEffect(()=>{
    return () => clearInterval(timerRef.current)
  },[])
// -----------------------------------------------------
  useEffect(()=>{
    if(inputHeight){
      divHeightRef.current.parentElement.style.height = `${inputHeight+10}px`
      animateScroll.scrollToBottom({duration: 0, containerId:'messagePlaceId'})
    }
    return () => window.scrollTo(0, 0)
  },[inputHeight])
// -----------------------------------------------------
  useEffect(()=>{
    animateScroll.scrollToBottom({duration: 0, containerId:'messagePlaceId'})
    if(inputHeight){
      divHeightRef.current.parentElement.style.height = `${inputHeight-150}px`
    }
    return () => window.scrollTo(0, 0)
  },[width])
// ----------------------------------------------------- 
  if(addFile){
    window.addEventListener("resize", ()=>{
      setWidth(window.innerWidth)
    })
  }
// -----------------------------------------------------
  useEffect(()=>{
    const differ = divHeightRef.current.parentElement.clientHeight - heightOfMessageInput
    const messagePlaceBottom = divHeightRef.current.parentElement.getBoundingClientRect().bottom
    if(((messagePlaceBottom+10)>=inputHeight)&&(differ!==0)){
      divHeightRef.current.parentElement.style.height = `${inputHeight-150}px`
      timerRef.current = setTimeout(()=>{
        animateScroll.scrollToBottom({duration: 0, containerId:'messagePlaceId'})
      },1)
    }
    return () => window.scrollTo(0, 0)
  },[heightOfMessageInput,inputHeight])
// -----------------------------------------------------
  const reverseStringFunction = (tel, contact, uuid) =>{
    const result = [...chat]
    if(chat.length!==0){
      result.find((x,i)=>{
        if(parseInt(x.conversationWith)===parseInt(contact)){
          x.conversation.find((y,j)=>{
            if(y.uuid==uuid){
              return y.seen=1
            }
          })
        } 
      })
    }
    setChat(result)
    socket.emit('seen', { tel: tel, contact: contact, uuid: uuid, toSocketId: messageInputData.socketId});
  }
// -----------------------------------------------------
  useEffect(()=>{
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const result = [...entry.target.textContent].reverse().join("")
          const seen = result.split('"')[1].split(':')[0]
          const tel = [...result.split(':')[1].split('#')[0]].reverse().join("")
          const contact = [...result.split('#')[1].split('/')[0]].reverse().join("")
          const uuid = [...result.split('/')[1].split(';')[0]].reverse().join("")
          if((parseInt(tel)!==parseInt(contact))&&!parseInt(seen)){
            reverseStringFunction(tel, contact, uuid)
          }
        }
      })
    })
    elRef.current.forEach((el) => {
      if(el){
        observer.observe(el);
      }
    })   
  },[elRef.current[0]])
// -----------------------------------------------------
  const typefunction = (link) =>{
    let result = [...link].reverse().join('').split('.')[0]
    result = [...result].reverse().join('')
    return result
  }
// -----------------------------------------------------
  const checkIfHyperlink = (text) =>{
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url)=>{
      return '<a target="_blank" href="' + url + '" style={{text-decoration: "none"}}>' + url + '</a>'
    })
  }
// -----------------------------------------------------
  const chatDisplay = () =>{
    return chat&&chat.map(x=>{
      if(parseInt(x.conversationWith)===parseInt(messageInputData.contact)){
        return x.conversation.map((y,i,arr)=>{
          if(parseInt(y.fromContact)===parseInt(userData.tel)){
            return <div key={uuid()}>
              {(i===0)&&<div className='rightConversationDate' style={{border:'1px solid black'}}>{y.created_at.slice(4,15)}</div>}
              {(i>0)&&(y.created_at.slice(4,15)!==arr[i-1].created_at.slice(4,15))&&<div className='rightConversationDate' style={{border:'1px solid black'}}>{y.created_at.slice(4,15)}</div>}
              <div 
                ref={el => (elRef.current[i] = el)} 
                className='rightConversation'
                style={{maxWidth: ((typefunction(y.filePath)==='pdf')||(typefunction(y.filePath)==='xls')||(typefunction(y.filePath)==='docx')||(typefunction(y.filePath)==='doc')||(typefunction(y.filePath)==='csv')||(typefunction(y.filePath)==='mp3')||(typefunction(y.filePath)==='mp4'))&&'23%'}}
              >
                {(y.filePath==='')&&<div dangerouslySetInnerHTML={{ __html: checkIfHyperlink(y.message) }}/>}
                {(y.filePath!=='')&&<a href={y.filePath} target="_blank" download>
                  <FileType
                    type={typefunction(y.filePath)}
                    link={y.filePath}
                    cssClass={'fileUpload'}
                  />
                </a>}
                <div style={{fontSize:'60%'}}>{y.created_at.slice(16,21)}&nbsp;&nbsp;<CheckCircleTwoToneIcon fontSize='60%' style={{ color: parseInt(y.delivered)?'black':'#424242'}}/><CheckCircleTwoToneIcon fontSize='60%' style={{ color: parseInt(y.seen)?'black':'#424242'}}/></div>
                <div style={{fontSize:'0%', opacity: 1, maxHeight: '0px', maxWidth: '20px'}}>;{y.uuid}/{y.fromContact}#{userData.tel}:{y.seen}"</div>
              </div>
            </div>    
          }
          else{
            return <div key={uuid()}>
              {(i===0)&&<div className='leftConversationDate' style={{border:'1px solid black'}}>{y.created_at.slice(4,15)}</div>}
              {i>0&&(y.created_at.slice(4,15)!==arr[i-1].created_at.slice(4,15))&&<div className='leftConversationDate' style={{border:'1px solid black'}}>{y.created_at.slice(4,15)}</div>}
              <div 
                ref={el => (elRef.current[i] = el)} 
                className='leftConversation'
                style={{maxWidth: ((typefunction(y.filePath)==='pdf')||(typefunction(y.filePath)==='xls')||(typefunction(y.filePath)==='docx')||(typefunction(y.filePath)==='doc')||(typefunction(y.filePath)==='csv')||(typefunction(y.filePath)==='mp3')||(typefunction(y.filePath)==='mp4'))&&'23%'}}
              >
                {(y.filePath==='')&&<div dangerouslySetInnerHTML={{ __html: checkIfHyperlink(y.message) }}/>}
                {(y.filePath!=='')&&<a href={y.filePath} target="_blank" download>
                  <FileType
                    type={typefunction(y.filePath)}
                    link={y.filePath}
                    cssClass={'fileUpload'}
                  />
                </a>}
                <div style={{fontSize:'60%'}}>{y.created_at.slice(16,21)}</div>
                <div style={{fontSize:'0%', opacity: 1, maxHeight: '0px', maxWidth: '20px'}}>;{y.uuid}/{y.fromContact}#{userData.tel}:{y.seen}"</div>
              </div>
            </div>
          }
        })
      }
    });
  }
// ------------------------------------------------------------------------------------------
  return (
    <div className='messagePlace'  id='messagePlaceId' >
      <div ref={divHeightRef}>{chatDisplay()}</div>
    </div>
  );
}

export default MessagePlace;