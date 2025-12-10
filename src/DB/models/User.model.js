import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: {
        type: Number,
        required: true,
        min: [18, "Minimum age is 18"],
        max: [60, "Maximum age is 60"]
    }
    }, {})

const UserModel = model("User", userSchema)
export default UserModel