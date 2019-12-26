const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://testing:12344321@cluster0-zwpfy.mongodb.net/spotifave?retryWrites=true&w=majority", {
    useNewUrlParser: true, useUnifiedTopology: true
});

module.exports = mongoose.connection;
