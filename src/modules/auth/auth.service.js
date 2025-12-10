import UserModel from "../../DB/models/User.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { decrypt, encrypt, secretKey } from "../../utils/cryptoUtils.js";


//1. Signup
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, phone, age } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists." });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const { iv, encryptedData } = encrypt(phone, secretKey);

        const user = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone: `${iv}:${encryptedData}`,
            age
        })
        return res.json({ message: 'Done', user })
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error, info: error.message, stack: error.stack })
    }
}

//2. login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = bcrypt.compareSync(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }


        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
}

//3. Update logged-in user information
export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, age, email } = req.body;

        if (email) {
            const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(409).json({ message: "Email already in use by another account" });
            }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { name, phone, age, email },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                age: updatedUser.age
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

//4. Delete logged-in user.
export const deleteUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });

    } catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

//5. Get logged-in user data by his ID.
export const getUser = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const [iv,encryptedPhone] = user.phone.split(":")
        const decryptedPhone = decrypt(encryptedPhone, iv, secretKey);

        const userData = {
            ...user._doc,
            phone: decryptedPhone
        };

        return res.status(200).json({
            message: "User found successfully",
            userData
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};