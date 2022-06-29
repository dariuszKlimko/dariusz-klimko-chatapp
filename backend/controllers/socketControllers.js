require('dotenv').config()
const connection = require('./mysql')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
const allUsers = (users, io) =>{
      for (let [id, socket] of io.of("/").sockets) {
            users.push({
                  userID: id,
                  username: socket.username,
                  tel: socket.tel,
            });
      }
      users.reverse().forEach((x,i,arr)=>{
            arr.forEach((y, j)=>{
                  j>i&&x.tel===y.tel?arr[i].tel = 0:arr[i]=x
            })
      })
      const result = users.filter(x=>x.tel)
      result.sort((a,b)=>{
            return a.username - b.username
      })
      return result
}

    
const chatMessageDatabase = (uuid, toContact, fromContact, toSocketId, message, filePath, created_at) =>{
      let table_name = ''
      fromContact>toContact?table_name=`a${fromContact}b${toContact}c`:table_name=`a${toContact}b${fromContact}c`
      let sql = `
            INSERT INTO ?? (uuid, message,  filePath, fromContact, delivered, seen, created_at) 
            VALUES ('${uuid}','${message}', '${filePath}','${fromContact}', '0', '0','${created_at}')
      `;
      connection.query(sql, table_name, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'chatMessageDatabase error')
            } else{
                  console.log('message received')
            }
      });
}

const usersFunction = (users, socket) =>{
      const index = users.findIndex(x=>((x.userID===socket.id)&&(x.tel!==0)))
      return users.splice(index, 1)
}

const insertContactFunction = (tel, myname, avatar, contact, name) =>{

      const table_name = 'contacts_'+tel.toString()
      const table_contact = 'contacts_'+contact.toString()
      let accepted = 1
      let accepted_by_contact = 0
      let rejected = 0
      let rejected_by_contact = 0
      let seen = 1

      if(tel===contact){
            console.log('this is Your contact')
      } else{
            sql = `
                  SELECT avatar FROM users
                  WHERE
                  tel = '${contact}'
            `;

            connection.query(sql, [table_name, table_name], (err, result, fields) => {
                  if (err){
                        console.log(err.message, 'insertContactFunction error')
                  } else{
                        let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                        const avatarContact = resultArray[0].avatar

                        sql = `
                              INSERT INTO ?? (name, contacts, accepted, accepted_by_contact, rejected, rejected_by_contact, seen, avatar) 
                              SELECT * FROM (SELECT '${name}' AS name, '${contact}' AS contacts, '${accepted}' AS accepted, '${accepted_by_contact}' AS accepted_by_contact, '${rejected}' AS rejected, '${rejected_by_contact}' AS rejected_by_contact, '${seen}' AS seen, '${avatarContact}' AS avatar) AS tmp
                              WHERE NOT EXISTS 
                              (SELECT contacts FROM ?? WHERE contacts = '${contact}')
                        `;
                        connection.query(sql, [table_name, table_name], (err, result, fields) => {
                              if (err){
                              console.log(err.message, 'insertContactFunction error')
                              } else{
                                    let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                                    accepted = 0
                                    accepted_by_contact = 1
                                    rejected = 0
                                    rejected_by_contact = 0
                                    seen = 0
                                    if(resultArray[2]!==0){
                                          sql = `
                                                INSERT INTO ?? (name, contacts, accepted, accepted_by_contact, rejected, rejected_by_contact, seen, avatar) 
                                                SELECT * FROM (SELECT '${myname}' AS name, '${tel}' AS contacts, '${accepted}' AS accepted, '${accepted_by_contact}' AS accepted_by_contact, '${rejected}' AS rejected, '${rejected_by_contact}' AS rejected_by_contact, '${seen}' AS seen, '${avatar}' AS avatar) AS tmp
                                                WHERE NOT EXISTS 
                                                (SELECT contacts FROM ?? WHERE contacts = '${tel}')
                                          `;
                                          connection.query(sql, [table_contact, table_contact], (err, result, fields) => {
                                                if (err){
                                                console.log(err.message, 'insertContactFunction error')
                                                } else{
                                                      let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                                                      if(resultArray[2]!==0){
                                                            sql = `
                                                                  SELECT * FROM ??
                                                                  WHERE 
                                                                  contacts = ${contact}
                                                            `;

                                                            connection.query(sql, table_name, (err, result, fields) => {
                                                                  if (err){
                                                                  console.log(err.message, 'insertContactFunction error')
                                                                  } else{
                                                                  // ------------------------------------------------
                                                                        let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                                                                        let table_conversation = ''
                                                                        tel>contact?table_conversation = `a${tel}b${contact}c`:table_conversation = `a${contact}b${tel}c`
                                                                        
                                                                        sql = `CREATE TABLE IF NOT EXISTs ?? (
                                                                              id INT PRIMARY KEY AUTO_INCREMENT,
                                                                              uuid VARCHAR(255) NOT NULL,
                                                                              message LONGTEXT NOT NULL,
                                                                              filePath VARCHAR(255) NOT NULL,
                                                                              fromContact VARCHAR(255) NOT NULL,
                                                                              delivered VARCHAR(255) NOT NULL,
                                                                              seen VARCHAR(255) NOT NULL,
                                                                              created_at VARCHAR(255) NOT NULL
                                                                        )`;
                                                                        connection.query(sql, table_conversation, (err, result, fields) => {
                                                                              if (err){
                                                                                    console.log(err.message, 'insertContactFunction error')
                                                                              } else{
                                                                                    console.log('contact inserted')
                                                                              }
                                                                        })
                                                                  // ------------------------------------------------
                                                                  }
                                                            })
                                                      } else{
                                                            console.log('contact already exist')
                                                      }
                                                }
                                          });
                                    } else{
                                          console.log('contact already exist')
                                    }
                              }
                        });
                  }
            })
      }
}

const deleteContactFunction = (tel, contact) =>{
      const table_name = 'contacts_'+tel.toString()
      const table_contact = 'contacts_'+contact.toString()
      let table_conversation = ''
      tel>contact?table_conversation = `a${tel}b${contact}c`:table_conversation = `a${contact}b${tel}c`

      let sql = `
            DELETE FROM ??
            WHERE 
                  contacts = '${contact}'
      `;

      connection.query(sql, table_name, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'deleteContactFunction error')
            } else{
                  let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                  if(resultArray[1]!==0){
                        let sql = `
                        DELETE FROM ??
                        WHERE 
                              contacts = '${tel}'
                        `;
                        connection.query(sql, table_contact, (err, result, fields) => {
                              if (err){
                                    console.log(err.message, 'deleteContactFunction error')
                              } else{
                                    let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                                    if(resultArray[1]!==0){
                                          // -----------------------------------------
                                          sql = `
                                                DROP TABLE ??
                                          `;
                                          connection.query(sql, table_conversation, (err, result, fields) => {
                                                if (err){
                                                      console.log(err.message, 'deleteContactFunction error')
                                                } else{
                                                      console.log('contact deleted')
                                                }
                                          })
                                          // -----------------------------------------
                                    } else{
                                          console.log('nothing to delete')
                                    }
                              }
                        });
                  } else{
                        console.log('nothing to delete')
                  }
            }
      });
}

const allContacts = (tel) =>{
      return new Promise((resolve, reject) => {
            let sql = `
                  SELECT name, avatar FROM users
                  WHERE
                  tel = '${tel}'
            `;
            connection.query(sql, (err, result, fields) => {
                  if (err){
                        console.log(err.message, 'allContacts error')
                  } else{
                        let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                        const name = resultArray[0].name
                        const avatar = resultArray[0].avatar
                        const table_name = 'contacts_'+tel.toString()
                        sql = `
                              SELECT * FROM ??
                        `;
                        connection.query(sql, table_name, (err, result, fields) => {
                              if (err){
                                    console.log(err.message, 'allContacts error')
                              } else{
                                    let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                                    resultArray.forEach((x, i, arr)=>{
                                          arr[i].socketId=undefined
                                    })
                                    if(result.length!==0){
                                          resolve({name: name, tel: tel, avatar: avatar, contacts: resultArray,  message: 'all your contacts'})
                                    } else{
                                          console.log('no contacts in your database')
                                          resolve({name: name, tel: tel, avatar: avatar, contacts: [], message: 'no contacts in database'})
                                    }
                              }
                        });
                  }
            });   
      });
}

const functionNavBar = (tel,contact,x,name) =>{
      return new Promise((resolve, reject) => {
            const table_name = 'contacts_'+tel.toString()
            sql = `
                  UPDATE ??
                        SET
                        ${name} = '${x}'
                        WHERE
                              contacts = '${contact}'
            `;
            connection.query(sql, table_name, (err, result, fields) => {
                  if (err){
                        console.log(err.message, 'functionNavBar error')
                        reject({tel: tel, avatar: null, message: 'database error'})
                  } else{
                        sql = `
                              SELECT * FROM ??
                        `;
                        connection.query(sql, table_name, (err, result, fields) => {
                              let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                              if (err){
                                    console.log(err.message, 'functionNavBar error')
                                    reject({message: 'database error'})
                              } else{
                                    resolve({contacts: resultArray})
                              }
                        })
                  }
            })
      });
}

const seenDatabase = (tel, contact, uuid) =>{

      let table_conversation = ''
      tel>contact?table_conversation = `a${tel}b${contact}c`:table_conversation = `a${contact}b${tel}c`

      sql = `
            UPDATE ??
                  SET
                        seen = '1'
                  WHERE
                        uuid = '${uuid}'
      `;
      connection.query(sql, table_conversation, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'seenDatabase error')
            } else{
                  console.log('message seen updated')
            }
      })
}

const deliveredDatabase = (tel, contact, uuid) =>{

      let table_conversation = ''
      tel>contact?table_conversation = `a${tel}b${contact}c`:table_conversation = `a${contact}b${tel}c`

      sql = `
            UPDATE ??
                  SET
                        delivered = '1'
                  WHERE
                        uuid = '${uuid}'
      `;
      connection.query(sql, table_conversation, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'deliveredDatabase error')
            } else{
                  console.log('message seen updated')
            }
      })
}

const allMessageDelivered = (tel) =>{
      return new Promise((resolve, reject)=>{

            const table_name = 'contacts_'+tel.toString()
            sql = `
                  SELECT contacts FROM ??
            `;
            connection.query(sql, table_name, (err, result, fields) => {
                  if (err){
                        console.log(err.message, 'allMessageDelivered error')
                        reject({contacts:[], message: 'database error'})
                  } else{
                        const resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                        const conversationsArray = resultArray.map(x=>tel>parseInt(x.contacts)?`a${tel}b${x.contacts}c`:`a${x.contacts}b${tel}c`)
                        if(conversationsArray.length!==0){
                              conversationsArray.forEach((x,i)=>{
                                    sql=`
                                          UPDATE ??
                                                SET
                                                      delivered = '1'
                                                WHERE
                                                      delivered = '0'
                                    `;
                                    connection.query(sql, x, (err, result, fields) => {
                                          if (err){
                                                console.log(err.message, 'allMessageDelivered error')
                                                reject({contacts:[], message: 'database error'})
                                          } else{
                                                const resultDelivered = resultArray.map(x=>x.contacts)
                                                resolve({contacts: resultDelivered})
                                          } 
                                    })
                              })
                        } 
                        else if(conversationsArray.length===0){
                              resolve({contacts:[]})
                        }
                  }
            });
      })
}

const contactsSeenDatabase = (tel) =>{

      const contacts_table = 'contacts_'+tel
     
      sql = `
            UPDATE ??
                  SET
                        seen = '1'
                  WHERE
                        seen = '0'
      `;
      connection.query(sql, contacts_table, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'contactsSeenDatabase error')
            } else{
                  console.log('contacts seen updated')
            }
      })
}

const callingFunction = (uuid, tel, name, contact, avatar, you_are_calling, outcoming_ok, outcoming_not, incoming_ok, incoming_not, seen, created_at) =>{
      let table_name = 'calls_'+tel.toString()
      let sql = `
            INSERT INTO ?? (uuid, name, contact, avatar, you_are_calling, outcoming_ok, outcoming_not, incoming_ok, incoming_not, seen, created_at) 
            VALUES ('${uuid}', '${name}', '${contact}', '${avatar}', '${you_are_calling}', '${outcoming_ok}', '${outcoming_not}', '${incoming_ok}', '${incoming_not}', '${seen}', '${created_at}')
      `;
      connection.query(sql, table_name, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'callingFunction error')
            } else{
                  console.log('message received')
            }
      });
}

const getAvatar = (tel) =>{
      return new Promise((resolve, reject) => {
            let sql = `
                  SELECT avatar FROM users
                  WHERE
                  tel = '${tel}'
            `;
            connection.query(sql, (err, result, fields) => {
                  if (err){
                        console.log(err.message, 'getAvatar error')
                        reject({avatar: '', message: 'database error'})
                  } else{
                        let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                        resolve(resultArray[0].avatar)
                  }
            });   
      });
}

const callsSeenDatabase = (tel) =>{

      const calls_table = 'calls_'+tel
     
      sql = `
            UPDATE ??
                  SET
                        seen = '1'
                  WHERE
                        seen = '0'
      `;
      connection.query(sql, calls_table, (err, result, fields) => {
            if (err){
                  console.log(err.message, 'callsSeenDatabase error')
            } else{
                  console.log('calls seen updated')
            }
      })
}

module.exports = {
      allUsers,
      chatMessageDatabase,
      usersFunction,
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
}
      