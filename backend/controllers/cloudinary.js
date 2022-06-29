require('dotenv').config()
const multer = require('multer')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.YOUR_API_KEY,
    api_secret: process.env.YOUR_API_SECRET,
    secure: true
});
  
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: process.env.CLOUDINARY_FOLDER_NAME,
    },
});

const upload = multer({ storage: storage });
// ----------------------------------------------------------------------
const uploadConversationFile = (path) =>{
    return new Promise((resolve, reject)=>{
        cloudinary.uploader.upload(path, {folder:process.env.CLOUDINARY_FOLDER_NAME_1, resource_type:'auto'}, (error, result) => {
            if(error){
                console.log(error,'cloudinary error')
                reject(error)
            } else{
                console.log('resources uploaded'); 
                resolve(result)
            }
        })
    })
}
// ----------------------------------------------------------------------
const uploadFile = upload.single('uploadedFile')
// ----------------------------------------------------------------------
module.exports = {
    uploadFile,
    uploadConversationFile
}