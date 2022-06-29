import { useState } from 'react';
import uuid from 'react-uuid'
import '../App.css';
import { Container, Avatar, Badge } from '@mui/material';


function ConversationListChild({allContacts, chat, messageInputData, userData, mobile, handleInputMessage, messagesFunction, offline }) {

  const [color, setColor] = useState('info')

// --------------------------------------------------------------------------------------------------
  return (
    <div >
      {allContacts&&allContacts.map(x=>(parseInt(x.accepted)&&!(parseInt(x.rejected)||parseInt(x.rejected_by_contact)))?<div onClick={(e) => handleInputMessage(x,e)} style={{cursor:'pointer', paddingRight:'0.2vw'}} key={uuid()}> 
        <Container
          sx={{
            backgroundColor: parseInt(x.accepted_by_contact)?`${color+'.main'}`:'#ffa726',
            borderRadius: 1,
            border: '1px solid black',
            display: 'flex',
            overflowX: 'hidden',
            alignItems: 'center',
            '&:hover': {
            backgroundColor: parseInt(x.accepted_by_contact)?`${color+'.dark'}`:'#f57c00'
            },
          }}
        >  
          <Badge
            badgeContent={messagesFunction(x.contacts)}
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: 25,
                height: 15,
                minWidth: 15,
                fontSize: 9,
                backgroundColor: !offline&&x.socketId?'#76ff03':(messagesFunction(x.contacts)!='')?'#ff9800':''
              },
            }}
          >
            <Avatar sx={{width: 33, height: 33, bgcolor: 'black', marginLeft: -2.5}} alt={x.name} src={x.avatar} />
          </Badge>
          &nbsp;
          <div style={{width:'95%', marginLeft:'10px'}}>
              {<div className='partOfLastMessage' style={{color: !offline&&x.socketId?'#76ff03':'black'}}><b>{x.name}</b></div>}
              {chat&&chat.map((y,i)=>{
                if(parseInt(x.contacts)===y.conversationWith){
                  if(y.conversation.length!==0){
                    return <div key={uuid()} className='partOfLastMessage'>{y.conversation[y.conversation.length-1].message}</div>
                  }else if(y.conversation.length===0){
                    return <div key={uuid()} className='partOfLastMessage'>...</div>
                  }
                }
              })}
          </div>
        </Container>
        <div style={{minHeight:'0.4vh'}}/>
      </div>:'' )}
    </div>
  );
}

export default ConversationListChild;