const mongoose = require('mongoose');

const InvenSet = new mongoose.Schema({
    ID:{
        type: mongoose.SchemaTypes.Number,
        require: true
    },
    HP:{
        type: mongoose.SchemaTypes.Number,
        require: true
    },
    XP:{
        type: mongoose.SchemaTypes.Number,
        require: true
    },
    Weapon:{
        type: mongoose.SchemaTypes.String
    },
    Killcount:{
        type: mongoose.SchemaTypes.Number,
        require: true
    }
});
module.exports = mongoose.model("Inventory", InvenSet);