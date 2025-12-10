import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return value !== value.toUpperCase();
            },
            message: "Title must not be fully uppercase."
        }
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const NoteModel = model("Note", noteSchema);
export default NoteModel;