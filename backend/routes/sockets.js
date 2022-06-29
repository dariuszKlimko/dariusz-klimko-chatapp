const fs = require('fs');
const {uploadConversationFile} = require('../controllers/cloudinary')
const siofu = require("socketio-file-upload");

const { 
  allUsers, 
  chatMessageDatabase, 
  insertContactFunction, 
  deleteContactFunction, 
  allContacts, 
  functionNavBar,
  seenDatabase,
  deliveredDatabase,
  allMessageDelivered,
  contactsSeenDatabase,
  callingFunction,
  getAvatar,
  callsSeenDatabase
} = require('../controllers/socketControllers')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
module.exports = function(io) {
  io.use((socket, next) => { 
    const {username, tel} = socket.handshake.auth;
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    socket.tel = tel;
    next();
  })
  
  io.on('connection', (socket) => {
    let users = []
  // -----------------------------------
    var uploader = new siofu();
    uploader.dir = './upld';
    uploader.listen(socket);
    uploader.on("saved", async (e)=>{
      try{
        const uuid = e.file.meta.uuid
        const toContact = e.file.meta.toContact
        const fromContact = e.file.meta.fromContact
        const toSocketId = e.file.meta.toSocketId
        const created_at = e.file.meta.created_at
        const message = ''

        const uplResult = await uploadConversationFile(e.file.pathName)
        if(uplResult){
          const filePath = uplResult.url
          fs.unlink(`${e.file.pathName}`, function (err) {
            if (err) console.log(err, 'unlink');
          });
          chatMessageDatabase(uuid, toContact, fromContact, toSocketId, message, filePath, created_at )
          socket.emit("chat file",{
            uuid: uuid,
            toContact: fromContact,
            fromContact: toContact,
            toSocketId: socket.id,
            message: message,
            filePath: filePath,
            created_at: created_at,
          })
          const allSockets = allUsers(users, io)
          allSockets.map(x=>{
            if(parseInt(x.tel)===parseInt(toContact)){
              deliveredDatabase(fromContact, toContact, uuid)
              socket.emit("delivered",{
                contact: fromContact
              })
            }
          })
          socket.to(toSocketId).emit("chat message", {
            uuid: uuid,
            toContact: toContact,
            fromContact: fromContact,
            toSocketId: socket.id,
            message: message,
            filePath: filePath,
            created_at: created_at,
          });
          users = []
        }
      }
      catch(err){
        console.log(err.message, 'save error')
      }
    });
    uploader.on("error", function(event){
      console.log("Error from siofu", event);
    });
  // -----------------------------------
    socket.on("activeUsers",async ()=>{
      try{
        const allSockets = allUsers(users, io)
        const result = await Promise.all(allSockets.map( async x=>{
          if(x.userID==socket.id){
            return await allMessageDelivered(x.tel)
          }
        }))

        io.emit("users", allUsers(users, io))

        let result_1 = result[0].contacts.map(x=>{
          return allSockets.map(y=>{
            if(parseInt(x)===parseInt(y.tel)){
              return {userID: y.userID, tel: y.tel}
            }
          })
        })
        result_1 = result_1.flat().filter(x=>x)
        result_1.map(x=>{
          socket.to(x.userID).emit("delivered",{
            contact: x.tel
          });
        })
      users = []
      }
      catch(err){
        console.log(err.message, 'file socketio error')
      }
    })
  // -------------------------
    socket.on("insert contact", async ({tel, myname, avatar, contact, name})=>{
      try{
        insertContactFunction(tel, myname, avatar, contact, name)
        const allSockets = allUsers(users, io)
        const telResult = await allContacts(tel)
        const contactResult = await allContacts(contact)
        
        socket.emit("insert contact me",{ 
          contacts: telResult.contacts,
          contact: contact
        })
        allSockets.map(x=>{
          if(parseInt(x.tel)===parseInt(contact)){
            socket.to(x.userID).emit("insert contact", { 
              contacts: contactResult.contacts,
            });
          }
        })
      users = []
      }
      catch(err){
        console.log(err.message, "insert contact error")
      }
    })
  // -------------------------
    socket.on("delete contact", async ({tel, contact})=>{
      try{
        deleteContactFunction(tel, contact)
        const allSockets = allUsers(users, io)
        const telResult = await allContacts(tel)
        const contactResult = await allContacts(contact)
  
        socket.emit("delete contact",{ 
          contacts: telResult.contacts,
        });
        allSockets.map(x=>{
          if(parseInt(x.tel)===parseInt(contact)){
            socket.to(x.userID).emit("delete contact", { 
              contacts: contactResult.contacts,
            });
          }
        })
      users = []
      }
      catch(err){
        console.log(err.message, "delete contact error")
      }
    })
  // -------------------------
    socket.on("accept", async ({tel, contact})=>{
      try{
        const x = 1
        const name_1 = 'accepted'
        const name_2 = 'accepted_by_contact'
        const telResult = await functionNavBar(tel, contact, x, name_1)
        const contactResult = await functionNavBar(contact, tel, x, name_2)
        const allSockets = allUsers(users, io)
        socket.emit("accept",{ 
          contacts: telResult.contacts,
          contact: parseInt(contact)
        })
        allSockets.map(x=>{
          if(parseInt(x.tel)===parseInt(contact)){
            socket.to(x.userID).emit("accept", { 
              contacts: contactResult.contacts
            });
          }
        })
      users = []
      }
      catch(err){
        console.log(err.message, "accept error")
      }
    })
  // -------------------------
    socket.on("reject", async ({tel, contact})=>{
      try{
        const x = 1
        const name_1 = 'rejected'
        const name_2 = 'rejected_by_contact'
        const telResult = await functionNavBar(tel, contact, x, name_1)
        const contactResult = await functionNavBar(contact, tel, x, name_2)
        const allSockets = allUsers(users, io)
        socket.emit("reject",{ 
          contacts: telResult.contacts
        })
        allSockets.map(x=>{
          if(parseInt(x.tel)===parseInt(contact)){
            socket.to(x.userID).emit("reject", { 
              contacts: contactResult.contacts
            });
          }
        })
      users = []
      }
      catch(err){
        console.log(err.message, "reject error")
      }
    })
  // -------------------------
    socket.on("undo reject", async ({tel, contact})=>{
      try{
        const x = 0
        const name_1 = 'rejected'
        const name_2 = 'rejected_by_contact'
        const telResult = await functionNavBar(tel, contact, x, name_1)
        const contactResult = await functionNavBar(contact, tel, x, name_2)
        const allSockets = allUsers(users, io)
        socket.emit("undo reject",{ 
          contacts: telResult.contacts
        })
        allSockets.map(x=>{
          if(parseInt(x.tel)===parseInt(contact)){
            socket.to(x.userID).emit("undo reject", { 
              contacts: contactResult.contacts
            });
          }
        })
      users = []
      }
      catch(err){
        console.log(err.message, "undo reject error")
      }
    })
  // -------------------------
    socket.on("seen", ({ tel, contact, uuid, toSocketId }) => {
      seenDatabase(tel, contact, uuid)
  
      socket.to(toSocketId).emit("seen", {
        toContact: contact,
        fromContact: tel,
        uuid: uuid
      });
    });
  // -------------------------
    socket.on("contacts seen", ({tel}) => {contactsSeenDatabase(tel)});
  // -------------------------
  socket.on("message progress", ({fromContact, toContact, toSocketId}) => {
    socket.to(toSocketId).emit("message progress", {
      fromContact: fromContact,
      toContact: toContact,
      toSocketId: socket.id
    });
  });
  // -------------------------
    socket.on("chat message", ({ uuid, toContact, fromContact, toSocketId, message, created_at }) => {
      const filePath = ''
      chatMessageDatabase(uuid, toContact, fromContact, toSocketId, message, filePath, created_at )
      
      const allSockets = allUsers(users, io)
      allSockets.map(x=>{
        if(parseInt(x.tel)===parseInt(toContact)){
          deliveredDatabase(fromContact, toContact, uuid)
          socket.emit("delivered",{
            contact: fromContact
          })
        }
      })
  
      socket.to(toSocketId).emit("chat message", {
        uuid: uuid,
        toContact: toContact,
        fromContact: fromContact,
        toSocketId: socket.id,
        message: message,
        filePath: filePath,
        created_at: created_at,
      });
      users = []
    });
  // -------------------------
    socket.on("call user", ({offer, toSocket})=>{
      socket.to(toSocket).emit("call made", {
        offer: offer,
        fromSocket: socket.id
      });
    })
  // -------------------------
    socket.on("make answer", ({answer, toSocket})=>{
      socket.to(toSocket).emit("answer made", {
        answer: answer,
        fromSocket: socket.id
      });
    })
  // -------------------------
    socket.on("candidate call", ({candidate, toSocket})=>{
      socket.to(toSocket).emit("candidate answer", {
        candidate: candidate,
        fromSocket: socket.id
      });
    })
// -------------------------
  socket.on("answer made call", async({toSocket, created_at, uuid})=>{
    try{
      const allSockets = allUsers(users, io)
      let arr = []
      let result = allSockets.find(x=>x.userID===socket.id)
      arr.push(result)
      let avatar = await getAvatar(arr[0].tel)
      arr[0].avatar = avatar
      result = allSockets.find(x=>x.userID===toSocket)
      arr.push(result)
      avatar = await getAvatar(arr[1].tel)
      arr[1].avatar = avatar
      callingFunction(uuid, arr[0].tel, arr[1].username, arr[1].tel, arr[1].avatar, 1, 1,0,1,0, 1, created_at)
      callingFunction(uuid, arr[1].tel, arr[0].username, arr[0].tel,  arr[0].avatar, 0, 1,0,1,0, 1, created_at)
      socket.emit("calls update", {
        uuid: uuid,
        name: arr[1].username,
        contact: arr[1].tel,
        avatar: arr[1].avatar,
        you_are_calling: 1,
        outcoming_ok: 1,
        outcoming_not: 0,
        incoming_ok: 1,
        incoming_not: 0,
        seen: 1,
        created_at: created_at
      });
      socket.to(toSocket).emit("calls update", {
        uuid: uuid,
        name: arr[0].username,
        contact: arr[0].tel,
        avatar: arr[0].avatar,
        you_are_calling: 0,
        outcoming_ok: 1,
        outcoming_not: 0,
        incoming_ok: 1,
        incoming_not: 0,
        seen: 1,
        created_at: created_at
      });
    }
    catch(err){
      console.log(err.message, "candidate call error")
    }
  })
// -------------------------
    socket.on("call video disconnect", async({toSocket, created_at, uuid, connected, disconnect})=>{
      try{
        socket.to(toSocket).emit("answer video disconnect", {
          fromSocket: socket.id
        });
        if(!connected){
          const allSockets = allUsers(users, io)
          let arr = []
          let result = allSockets.find(x=>x.userID===socket.id)
          arr.push(result)
          let avatar = await getAvatar(arr[0].tel)
          arr[0].avatar = avatar
          result = allSockets.find(x=>x.userID===toSocket)
          arr.push(result)
          avatar = await getAvatar(arr[1].tel)
          arr[1].avatar = avatar
          if(disconnect==='is_calling'){
            callingFunction(uuid, arr[0].tel, arr[1].username, arr[1].tel, arr[1].avatar, 1, 1,1,0,0, 1, created_at)
            callingFunction(uuid, arr[1].tel, arr[0].username, arr[0].tel, arr[0].avatar, 0, 0,0,1,1, 0, created_at)
            socket.emit("calls update", {
              uuid: uuid,
              name: arr[1].username,
              contact: arr[1].tel,
              avatar: arr[1].avatar,
              you_are_calling: 1,
              outcoming_ok: 1,
              outcoming_not: 1,
              incoming_ok: 0,
              incoming_not: 0,
              seen: 1,
              created_at: created_at
            });
            socket.to(toSocket).emit("calls update", {
              uuid: uuid,
              name: arr[0].username,
              contact: arr[0].tel,
              avatar: arr[0].avatar,
              you_are_calling: 0,
              outcoming_ok: 0,
              outcoming_not: 0,
              incoming_ok: 1,
              incoming_not: 1,
              seen: 0,
              created_at: created_at
            });
          } else if(disconnect==='is_receiving'){
            callingFunction(uuid, arr[0].tel, arr[1].username, arr[1].tel,  arr[1].avatar, 0, 1,0,0,1, 1, created_at)
            callingFunction(uuid, arr[1].tel, arr[0].username, arr[0].tel,  arr[0].avatar, 1, 0,1,1,0, 0, created_at)
            socket.emit("calls update", {
              uuid: uuid,
              name: arr[1].username,
              contact: arr[1].tel,
              avatar: arr[1].avatar,
              you_are_calling: 0,
              outcoming_ok: 1,
              outcoming_not: 0,
              incoming_ok: 0,
              incoming_not: 1,
              seen: 1,
              created_at: created_at
            });
            socket.to(toSocket).emit("calls update", {
              uuid: uuid,
              name: arr[0].username,
              contact: arr[0].tel,
              avatar: arr[0].avatar,
              you_are_calling: 1,
              outcoming_ok: 0,
              outcoming_not: 1,
              incoming_ok: 1,
              incoming_not: 0,
              seen: 1,
              created_at: created_at
            });
          }  
        }
      }
      catch(err){
        console.log(err.message, "call video disconnect error")
      }
    })
  // -------------------------
    socket.on("user busy", async({toSocket, created_at, uuid})=>{
      try{
        const allSockets = allUsers(users, io)
        let arr = []
        let result = allSockets.find(x=>x.userID===socket.id)
        arr.push(result)
        let avatar = await getAvatar(arr[0].tel)
        arr[0].avatar = avatar
        result = allSockets.find(x=>x.userID===toSocket)
        arr.push(result)
        avatar = await getAvatar(arr[1].tel)
        arr[1].avatar = avatar
        callingFunction(uuid, arr[0].tel, arr[1].username, arr[1].tel,  arr[1].avatar, 1, 1,0,0,0, 0, created_at)
        callingFunction(uuid, arr[1].tel, arr[0].username, arr[0].tel,  arr[0].avatar, 0, 0,0,1,0, 1, created_at)
        socket.to(toSocket).emit("user busy answer", {
          fromSocket: socket.id
        });
        socket.emit("calls update", {
          uuid: uuid,
          name: arr[1].username,
          contact: arr[1].tel,
          avatar: arr[1].avatar,
          you_are_calling: 1,
          outcoming_ok: 1,
          outcoming_not: 0,
          incoming_ok: 0,
          incoming_not: 0,
          seen: 0,
          created_at: created_at
        });
        socket.to(toSocket).emit("calls update", {
          uuid: uuid,
          name: arr[0].username,
          contact: arr[0].tel,
          avatar: arr[0].avatar,
          you_are_calling: 0,
          outcoming_ok: 0,
          outcoming_not: 0,
          incoming_ok: 1,
          incoming_not: 0,
          seen: 1,
          created_at: created_at
        });
      }
      catch(err){
        console.log(err.message, "user busy error")
      }
    })
  // -------------------------
    socket.on("missed call", async({toSocket, created_at, uuid})=>{
      try{
        const allSockets = allUsers(users, io)
        let arr = []
        let result = allSockets.find(x=>x.userID===socket.id)
        arr.push(result)
        let avatar = await getAvatar(arr[0].tel)
        arr[0].avatar = avatar
        result = allSockets.find(x=>x.userID===toSocket)
        arr.push(result)
        avatar = await getAvatar(arr[1].tel)
        arr[1].avatar = avatar
        callingFunction(uuid, arr[0].tel, arr[1].username, arr[1].tel,  arr[1].avatar, 0, 0,0,1,0, 1, created_at)
        callingFunction(uuid, arr[1].tel, arr[0].username, arr[0].tel,  arr[0].avatar, 1, 1,0,0,0, 0, created_at)
        socket.to(toSocket).emit("missed call answer", {
          fromSocket: socket.id
        });
        socket.emit("calls update", {
          uuid: uuid,
          name: arr[1].username,
          contact: arr[1].tel,
          avatar: arr[1].avatar,
          you_are_calling: 0,
          outcoming_ok: 0,
          outcoming_not: 0,
          incoming_ok: 1,
          incoming_not: 0,
          seen: 1,
          created_at: created_at
        });
        socket.to(toSocket).emit("calls update", {
          uuid: uuid,
          name: arr[0].username,
          contact: arr[0].tel,
          avatar: arr[0].avatar,
          you_are_calling: 1,
          outcoming_ok: 1,
          outcoming_not: 0,
          incoming_ok: 0,
          incoming_not: 0,
          seen: 0,
          created_at: created_at
        });
      }
      catch(err){
        console.log(err.message, "missed call error")
      }
    })
  // -------------------------
    socket.on("calls seen", ({tel}) => {callsSeenDatabase(tel)});
  // -------------------------
    socket.on("disconnect", () => {
      const allSockets = allUsers(users, io)
      const result = allSockets.filter(x=>socket.id !== x.userID)
      io.emit("users", result);
      users = []
    });
  });
};