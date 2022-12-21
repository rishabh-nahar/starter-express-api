const mongoose = require('mongoose');

const gameSession = new mongoose.Schema({
        sessionID:{
            
        }

    },
    {
        collection: "games"
    }
)

const model = mongoose.model("gammes",gameSession)
module.exports = model