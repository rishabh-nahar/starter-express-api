//Server
const express = require('express');
const app = express();
const cors  = require('cors'); // for crossorigin 
const mongoose = require('mongoose'); // to connect to databse

const toID = mongoose.Types.ObjectId

const User = require('./models/user.models')
const Game = require('./models/games.models');
const { Socket } = require('socket.io');
const { aggregate } = require('./models/user.models');

require('dotenv').config()

app.use(cors())
app.use(express.json())

// mongoose.connect(process.env.ATLAS_URI)
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,(err,res)=>{
    if(err){
        console.log(err);
    }
})

// API to test connection with backend - localhost:8081/test
app.get('/test',(req,res)=>{
     res.json({'status':"connected"})
     console.log("Connected");
})


//LOGIN & REGISTER
// API for login - localhost:8081/api/login
app.get('/api/login',async (req,res)=>{
     console.log(req.query);
    try{
         const user = await User.findOne({
              username: req.query.username,
              password: req.query.password,    
         })
         if(user){
              res.json({
                    status: "ok",
                    message: "Logged in successfully",
                    user_id: user._id,
                    statusCode: 200,
                    user:  user.username,
                    name: user.name,
                    email: user.email
              })
         }
         else{
              res.json({
                   status: "Error",
                   message:"Enter correct details.",
                   statusCode: 406,
              })
         }
    }
    catch(err){
         console.log("Log in error",err);
    }
})

// API for registeration - localhost:8081/api/register
app.post('/api/register',async (req,res)=>{
    console.log(req.body);
    try{
     let user = await User.findOne({email: req.body.email})
     let message = ""; let statusCode;
     if(!user){
          user = await User.create({
               name: req.body.name,
               username: req.body.username,
               email:req.body.email,
               password:req.body.password
          })
          message = "Registered successfully"
          statusCode = 200
     }
     else{
          message = "Email exist!"
          statusCode = 406
     }
     res.json({
          status: "ok",
          message: message,
          user_id: user._id,
          statusCode: statusCode,
          user_id: user._id,
          user:  user.username,
          name: user.name,
          email: user.email
     })
    }
    catch(err){
          res.json({
               status:"error",
               statusCode: 505,
               error:err,
               message: "Internal server error, try again later"
          })
          console.log("Error",err);
    }
})



// API to find game for user from userID
app.get('/api/findGames',async (req,res)=>{
     // console.log("data recieved:",req.query);
     try {
          let rivalPlayersIDs = []; let gameData = []
          const game = await Game.find({
               $or: [{ playerX :  req.query.userID }, {playerO :  req.query.userID }],   
          })
          console.log(req.query);
          game.map((d,k)=>{ 
               if(req.query.userID != d.playerX){
                    rivalPlayersIDs.push(d.playerX)
               }    
               else{
                    rivalPlayersIDs.push(d.playerO) 
               }
          })
          
          const userDetails = await User.find({
               _id: { 
                    $in : rivalPlayersIDs 
               }
          })
          console.log("Rivals:",userDetails);
          game.map((d,k)=>{
               console.log(k,userDetails[k].name)
               gameData[k] = {
                    rival:userDetails[k].name,
                    playerX: game[k].playerX,
                    playerO: game[k].playerO,
                    status: game[k].status,
                    boardArray: game[k].boardArray,
                    turn: game[k].turn,
                    timaStamp: game[k]._id.getTimestamp(),
                    _id: game[k]._id
               }
               // {...game[k] , rival : userDetails[k].name, timeStamp: game[k]._id.getTimestamp()}
          })
          console.log(gameData);
          if (game) {
               res.json({
                    status:"OK",
                    statusCode: 200,
                    gameData:gameData,
               })
          }
     } catch (error) {
          console.log("Error:", error);
     }
})

// API to find player from email 
app.get('/api/findPlayer',async (req,res)=>{
     console.log(req.query);
    try{
         const user = await User.findOne({
              email: req.query.email,   
          })
          if(user){
              const usersAlreadyPlaying = await Game.findOne({
                   playerX : req.query.userID,
                   playerO : user._id
              })
              console.log("User already playing:",usersAlreadyPlaying);
              if(usersAlreadyPlaying != null){
                    res.json({
                         status: "ok",
                         message: "You are already playing with "+user.username,
                         user_id: user._id,
                         statusCode: 406,
                         user:  user.username,
                         name: user.name,
                    })
              }
              else{
                   res.json({
                         status: "ok",
                         message: "Player found",
                         user_id: user._id,
                         statusCode: 200,
                         user:  user.username,
                         name: user.name,
                         email: user.email
                   })
              }
         }
         else{
              res.json({
                   status: "Error",
                   message:"Email not found",
                   statusCode: 406,
              })
         }
    }
    catch(err){
         console.log("Internal Server error, Try again later",err);
    }
})

// API to create game session between two player 
app.post('/api/createGame',async (req,res)=>{
     console.log(req.body);
     try {     
          const game = await Game.create({
               playerX:toID( req.body.playerX),
               playerO: toID(req.body.playerO)
          })
          res.json({
               status: "ok",
               message: "Starting game",
               game_id: game._id,
               statusCode: 200,
          })
     } catch (error) {
          res.json({
               status: "Error",
               message:"Internal Error, try again later",
               statusCode: 406,
          })
     }
})


app.get('/api/getGameDetails',async (req,res)=>{
     console.log(req.query);
     try{
          const gameDetails = await Game.findOne({
               _id: req.query.room,   
           })
           if(gameDetails){
               res.json({
                    status: "ok",
                    message: "Game data found",
                    statusCode: 200,
                    gameData: gameDetails
                    })
               }
          }
          catch(err){
               res.json({
                    status: "not ok",
                    message: "Error finding game details",
                    statusCode: 406,
                    })
          }
     })

const server = app.listen(8081,()=>{
     console.log("Running on port 8081");
})


const io = require('socket.io')(server,{
     cors:{
          origin: "*",
     }
})

io.on("connection",(socket)=>{
     console.log("Connected and socket id is", socket.id);
     socket.on("create-connection",room=>{
          socket.join(room)
     })
     socket.on("next-turn",async (board,piece,room)=>{
          try{
               const updateBoard = await Game.updateOne({_id: room},{boardArray: board},(err,docs)=>{
                    if (err) console.log("Error updating board",err);
                    else console.log("Board updare", docs);
               })
          }
          catch(err){
               console.log("Error",err);
          }

          socket.to(room).emit("recieve-new-board",board,piece,room)
          
     })
})
