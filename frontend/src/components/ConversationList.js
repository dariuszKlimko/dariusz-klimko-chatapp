import { useContext } from 'react';
import '../App.css';
import ConversationListChild from './ConversationListChild';
import AllContactsContext from '../contexts/AllContactsContext';
import MessageInputDataContext from '../contexts/MessageInputDataContext';
import ChatContext from '../contexts/ChatContext';
import UserDataContext from '../contexts/UserDataContext';
import MobileContext from '../contexts/MobileContext';
import AddFileContext from '../contexts/AddFileContext';
import ContactsContext from '../contexts/ContactsContext';
import OfflineContext from '../contexts/OfflineContext.js';

function ConversationList() {

  const [allContacts, setAllContacts] = useContext(AllContactsContext)
  const [messageInputData, setMessageInputData] = useContext(MessageInputDataContext)
  const [chat, setChat] = useContext(ChatContext)
  const [mobile, setMobile] = useContext(MobileContext)
  const [userData, setUserData] = useContext(UserDataContext)
  const [addFile, setAddFile] = useContext(AddFileContext)
  const [contacts, setContacts] = useContext(ContactsContext)
  const [offline, setOffline] = useContext(OfflineContext)

// --------------------------------------------------------------------------------------------------
  const handleInputMessage = (x,e) =>{
    e.preventDefault()
    setMobile(true)
    setAddFile(false)
    setContacts(true)
    if(x.hasOwnProperty('socketId')){
      setMessageInputData({name: x.name, contact: parseInt(x.contacts), avatar: x.avatar, socketId: x.socketId})
    } 
    else{
      setMessageInputData({name: x.name, contact: parseInt(x.contacts), avatar: x.avatar})
    }
  }
// --------------------------------------------------------------------------------------------------
  const messagesFunction = (contacts) =>{
    const result = chat&&chat.filter(x=>parseInt(x.conversationWith)===parseInt(contacts)).filter(x=>(x.conversation.length))
    if(result[0]!==undefined){
      const result_1 = result[0].conversation.filter(x=>parseInt(x.fromContact)!==parseInt(userData.tel)).filter(x=>!parseInt(x.seen))
      return result_1.length?result_1.length:''
    } else{
      return ''
    }
  }
// --------------------------------------------------------------------------------------------------
  return (
    <div >
      <ConversationListChild
        allContacts={allContacts}
        chat={chat}
        messageInputData={messageInputData}
        userData={userData}
        mobile={mobile}
        handleInputMessage={handleInputMessage}
        messagesFunction={messagesFunction}
        offline={offline}
      />
    </div>
  );
}

export default ConversationList;