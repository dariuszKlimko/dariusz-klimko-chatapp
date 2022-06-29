import { useState, useEffect, useContext, useRef } from "react";
import socket from '../components/Socket.js';
import SocketIOFileUpload from 'socketio-file-upload';
import uuid from 'react-uuid';
import FileType from "./FileType";
import BottomInputNavbarContext from "../contexts/BottomInputNavbarContext";
import AddFileContext from "../contexts/AddFileContext";
import MessageInputDataContext from "../contexts/MessageInputDataContext";
import UserDataContext from '../contexts/UserDataContext';
import ChatContext from "../contexts/ChatContext.js";
import { Box, IconButton } from '@mui/material';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';


function AddFile() {

  const timeStamp = new Date().toString()

  var uploader = new SocketIOFileUpload(socket);
  const inputFileRef = useRef(null)

  const boxHeightRef = useRef(null)
  const smallImageRevieRef = useRef(null)

  const [uploadedFile, setUploadedFile] = useState([])
  const [previewImg, setPreviewImg] = useState({link: '', type: ''})
  const [iofiles, setIofiles] = useState('')

  const [bottomInputNavbar, setBottomInputNavbar] = useContext(BottomInputNavbarContext)
  const [addFile, setAddFile] = useContext(AddFileContext)
  const [userData, setUserData] = useContext(UserDataContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [chat, setChat] = useContext(ChatContext)
 
// ------------------------------------------------------------------------------------------
  const sendFilesFunction = () =>{
    iofiles&&iofiles.map(y=>{
      const uid = uuid()
      const created_at = timeStamp
      uploader.addEventListener("start", (e)=>{ 
        e.file.meta.uuid = `${uid}`;
        e.file.meta.fromContact = `${userData.tel}`;
        e.file.meta.toContact = `${messageInputData.contact}`;
        e.file.meta.toSocketId = `${messageInputData.socketId}`;
        e.file.meta.created_at = `${created_at}`;
      })
      uploader.submitFiles([y])
    })
    setAddFile(false)
  }
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const result = uploadedFile.map(x=>x.file)
    setIofiles(result)
  },[uploadedFile])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    boxHeightRef.current.style.height = `${window.innerHeight-bottomInputNavbar+10}px`
  },[])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    const result = smallImageRevieRef.current.getBoundingClientRect().top
    smallImageRevieRef.current.style.height = `${window.innerHeight-result-10}px`
  },[])
// ------------------------------------------------------------------------------------------
  useEffect(()=>{
    if((uploadedFile.length>0)&&(previewImg.link==='')){
      setPreviewImg({type: uploadedFile[0].type, link: uploadedFile[0].objectUrl})
    }
  },[uploadedFile])
// ------------------------------------------------------------------------------------------
  const selectImg = (x,y,e) =>{
    e.preventDefault()
    setPreviewImg({link: x, type: y})
  }
// ------------------------------------------------------------------------------------------
  const typeFunction = (x) =>{
    let result = [...x].reverse().join('').split('.')[0]
    result = [...result].reverse().join('')
    return result
  }
// ------------------------------------------------------------------------------------------
  const uploadFilesFunction = (files) =>{
    const result = [...files].map(x=>{
      return {uuid: uuid(), file: x, objectUrl: URL.createObjectURL(x), type: typeFunction(x.name)}
    })
    setUploadedFile([...uploadedFile, ...result])
  }
// ------------------------------------------------------------------------------------------
  return (
    <div ref={boxHeightRef}>
      <Box 
        sx={{
          backgroundColor: '#5f6a83',
          border: '1px solid black',
          borderRadius: '5px',
          minWidth: '260px',
          minHeight: 'inherit',
          position: 'relative',
        }}
      > 
        <IconButton onClick={()=>setAddFile(false)} sx={{position:'absolute', left: 0, top: 0, clear:' both'}}>
          <CloseTwoToneIcon sx={{color: 'black'}}/>
        </IconButton>
        <IconButton onClick={sendFilesFunction} sx={{position:'absolute', right: 0, top: 0, clear:' both'}}>
          <SendTwoToneIcon />
        </IconButton>
        <div className='fotoReview'>
          <a href={previewImg.link} download>
            <FileType
              type={previewImg.type}
              link={previewImg.link}
              cssClass={'imgReview'}
            />
          </a>
        </div>
        <div className='hrLine'/>
        <div ref={smallImageRevieRef} className="smallImageRevie">
          {uploadedFile.length!==0&&uploadedFile.map(x=><div key={x.uuid} onClick={e=>selectImg(x.objectUrl, x.type ,e)}>
          <FileType
              type={x.type}
              link={x.objectUrl}
              cssClass={'fileUpload'}
            />
          </div>)}
          <div className='smallIcon'>
            <IconButton  variant='contained'  component="label">
              <AddCircleTwoToneIcon fontSize='large' />
              <input
                ref={inputFileRef}
                id='siofu_input'
                hidden
                required
                type='file'
                accept=",.bmp,.gif,.jpeg,.jpg,.png,.pdf,.xls,.docx,.doc,.csv,.mp3,.mp4"
                onChange={(e)=>{
                  [...e.target.files].map((x,i)=>{
                    if(e.target.files[i].size > 2200000){
                      alert("File is too big!");
                      return e.target.value=''
                    } 
                    else if((e.target.files.length -1)===i){
                      return uploadFilesFunction(e.target.files)
                    }
                  })
                }}
                multiple/> 
            </IconButton>
          </div>
        </div>
      </Box>
    </div>
  );
}
  
export default AddFile;
