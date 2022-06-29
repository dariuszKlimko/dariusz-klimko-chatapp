# chatapp

## Table of contents
* [General info](#general-info)
* [Prerequire](#prerequire)
* [Technologiess](#technologies)
* [Setup](#setup)
  * [Frontend](#frontend)
  * [Backend](#backend)
* [Run app](#run-app)

## General info
This is fullstack project and this is my third app.
## Prerequire
 * [mySQL](https://www.mysql.com/) database (mysql_host, mysql_port, mysql_user, mysql_password, database_name)
 * [cloudinary](https://cloudinary.com/) account (cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_folder_name, cloudinary_folder_name_1)(create two folders in cloudinary)
 * generate secret for access token
 * [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) credentials (recaptcha_site_key, recaptcha_secret_key)
 * ### option
   * STUN/TURN server credentials (your_stun_server_host, your_turn_server_host, your_stun/turn_server_username, your_stun/turn_server_passowrd)
   * [aws](https://aws.amazon.com/) account (amazon_web_services_access_key_id, amazon_web_services_secret_access_key, amazon_web_services_region)
   * [twilio](https://www.twilio.com/) account (twilio_account_s_id, twilio_auth_token, twilio_messaging_service_s_id)
## Technologies
* [Node.js](https://nodejs.org/en/)
  * [Express.js](https://expressjs.com/)
  * [React.js](https://create-react-app.dev/)
  * [Socket.IO](https://socket.io/)
  * [WebRTC](https://webrtc.org/)

## Setup
Create folder "ChatApp".
 * ### Frontend
  Open "ChatApp" in e.g. vscode editor and run:
  ```
  npx create-react-app frontend
  ```
  In package.json paste: 
  ```
  "proxy": "http://localhost:8000",
  ```
  Download .env file and paste into frontend folder.
  
  Open .env and insert all keys and ect.
   * recaptcha_site_key
   * your_domain = http://localhost:8000/
   * your_stun_server_host
   * your_turn_server_host
   * your_stun/turn_server_username
   * your_stun/turn_server_passowrd
  
  Open "src" folder and delete all files inside.
  
  Download frontend code from "src" in repository and paste into "src".
  ```
   public/
   src/
     audio/
     components/
     contexts/
     customHooks/
     fileType/
     views/
     App.css
     App.js
     App.test.js
     index.css
     index.js
     reportWebVitals.js
     setupTests.js
   .env
   .gitignore
   .README.md
  ```
  Go to "frontend" folder and install packages.
  ```
  cd frontend
  ```
  ```
  npm install @emotion/react@11.7.1 @emotion/styled@11.6.0 @mui/icons-material@5.3.1 @mui/material@5.3.0 @mui/styles@5.5.1
  ```
  ```
  npm install axios emoji-picker-react@3.5.1 js-cookie@3.0.1 material-ui-phone-number@^3.0.0 react-file-viewe@1.2.1 react-responsive react-router-dom@6.2.1
  ```
  ```
  npm install react-scroll@1.8.6 react-textarea-autosize@8.3.3 react-uuid@1.0.2 socket.io-client@4.4.1 socketio-file-upload@0.7.3
  ```
 * ### Backend
 In "Ecommerce" create folder "backend".
 
 Download all files (without package.json and package-lock.json) from folder "backend" in repository and paste it into Ecommerce/backend.
 ```
 backend/
   controllers/
   routes/
   upld/
   .env
   .gitignore
   app.js
 ```
 In file .env insert all keys and ect:
 * mysql_host
 * mysql_port
 * mysql_user
 * mysql_password
 * database_name
 * your_domain = http://localhost:3000/
 * cloudinary_cloud_name
 * cloudinary_api_key
 * cloudinary_api_secret
 * cloudinary_folder_name
 * cloudinary_folder_name_1
 * generate_random_secret_for_jwt
 * recaptcha_secret_key
 * amazon_web_services_access_key_id
 * amazon_web_services_secret_access_key
 * amazon_web_services_region
 * twilio_account_s_id
 * twilio_auth_token
 * twilio_messaging_service_s_id
 
 Open "backend" in e.g. vscode editor and run:
  ```
  npm init
  ```
  Install express.js.
  ```
  npm install express
  ```
  Install nodemon.
  ```
  npm install nodemon
  ```
  Open package.json file and find item "scripts" and replace it with:
  ```
  "scripts": {
    "start": "node app.js",
    "app": "nodemon app.js"
  },
  ```
  
  Go to "backend" folder and install packages.
  ```
  cd backend
  ```
  ```
  npm install aws-sdk axios cloudinary cookie-parser cors crypto dotenv fs jsonwebtoken
  ```
  ```
  npm install multer multer-storage-cloudinary mysql passport passport-jwt path socket.io socketio-file-upload twilio
  ```
## Run app
Run backend application.
```
cd backend
```
```
nodemon
```
Run frontend application.
```
cd frontend
```
```
npm start
```
