const mongoose = require('mongoose');
const Schema = mongoose.Schema

const games = new Schema({
        playerX:{
            type: Schema.Types.ObjectId, 
            ref: "users"
        },
        playerO:{
            type: Schema.Types.ObjectId, 
            ref: "users"
        },
        turn:{
            type: String,
            require: true,
            default:"X"
        },
        status:{
            type: String,
            require: true,
            default:"Start game"
        },
        boardArray:{
            type: Array,
            default: ["","","","","","","","",""]
        }
    },
    {
        collection: "games"
    }
)

const model = mongoose.model("games",games)
module.exports = model