const mongoose = require('mongoose');

const User = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique:true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    },
    {collection:'users'}
)
const model = mongoose.model("users",User)
module.exports = model