import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";    
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

// Password encryption
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Checking password (custom method injecting in schema)
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Generate access token 
userSchema.methods.generateAccessToken = async function() {
    
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }

    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const secretKeyExpiry = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY};
    
    jwt.sign(payload, secretKey, secretKeyExpiry);
}

// Generate refresh token 
userSchema.methods.generateRefreshToken = async function() {

    const payload = {
        _id: this._id
    }

    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    const secretKeyExpiry = { expiresIn: process.env.REFRESH_TOKEN_EXPIRY};
    
    jwt.sign(payload, secretKey, secretKeyExpiry);
}



export const User = mongoose.model("User", userSchema); 