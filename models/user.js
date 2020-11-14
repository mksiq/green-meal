let bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique : true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre("save", function(next) {
    let user = this;

    // Generate a unique salt and hash the password.
    bcrypt.genSalt(10)
    .then((salt) => {
        bcrypt.hash(user.password, salt)
        .then((encryptedPwd) => {
            // Password was hashed, update the user password.
            // The new hashed password will be saved to the database.
            user.password = encryptedPwd;
            next();
        })
        .catch((err) => {
            console.log(`Error occurred when hashing. ${err}`);
         });
    })
    .catch((err) => {
       console.log(`Error occurred when salting. ${err}`);
    });
});

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;