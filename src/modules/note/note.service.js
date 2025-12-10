import NoteModel from "../../DB/models/Note.model.js";

//1. Create a Single Note
export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user._id;

        const newNote = await NoteModel.create({ title, content, userId });

        return res.status(201).json({
            message: "Note created",
            note: newNote
        });

    } catch (err) {
        return res.status(400).json({
            message: "Failed to create note",
            error: err.message
        });
    }
};

//2. Update a single Note by its id and return the updated note.
export const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content } = req.body;
        const userId = req.user._id;

        const note = await NoteModel.findById(noteId);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not the owner" });
        }

        if (title) note.title = title;
        if (content) note.content = content;

        await note.save();

        return res.status(200).json({
            message: "Note updated successfully",
            note
        });

    } catch (err) {
        return res.status(400).json({
            message: "Failed to update note",
            error: err.message
        });
    }
};

//3. Replace the entire note
export const replaceNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;
        const { title, content } = req.body;

        const existingNote = await NoteModel.findById(noteId);

        if (!existingNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (existingNote.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Uou are not the owner" });
        }

        const replacedNote = await NoteModel.findByIdAndUpdate(
            noteId,
            { title, content, userId },
            { new: true, runValidators: true, overwrite: true }
        );

        return res.status(200).json({
            message: "Note replaced successfully",
            note: replacedNote
        });

    } catch (err) {
        return res.status(400).json({
            message: "Failed to replace note",
            error: err.message
        });
    }
};

//4. Updates the title of all notes
export const updateAllTitles = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title } = req.body;

        if (!title || title === title.toUpperCase()) {
            return res.status(400).json({
                message: "Invalid title. It must not be fully uppercase."
            });
        }

        const result = await NoteModel.updateMany(
            { userId },
            { $set: { title } }
        );

        return res.status(200).json({
            message: `All notes updated`,
            result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to update notes",
            error: err.message
        });
    }
};

//5. Delete a single Note by its id
export const deleteNoteById = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        const note = await NoteModel.findById(noteId);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not the owner" });
        }

        const deletedNote = await NoteModel.findByIdAndDelete(noteId);

        return res.status(200).json({
            message: "Note deleted successfully",
            note: deletedNote
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to delete note",
            error: err.message
        });
    }
};

//6. Retrieve a paginated list of notes
export const getPaginatedNotes = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const notes = await NoteModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalNotes = await NoteModel.countDocuments({ userId });

        return res.status(200).json({
            message: "done",
            page,
            totalPages: Math.ceil(totalNotes / limit),
            totalNotes,
            notes
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch notes",
            error: err.message
        });
    }
};

//7. Get a note by its id.
export const getNoteById = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        const note = await NoteModel.findById(noteId);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not the owner" });
        }

        return res.status(200).json({
            message: "Done",
            note
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error retrieving note",
            error: err.message
        });
    }
};

//8. Get a note for logged-in user by its content.
export const getNoteByContent = async (req, res) => {
    try {
        const userId = req.user._id;
        const { content } = req.query;

        if (!content) {
            return res.status(400).json({ message: "Content is required in query." });
        }

        const note = await NoteModel.findOne({
            userId,
            content
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({
            message: "Note found",
            note
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error retrieving note",
            error: err.message
        });
    }
};

//9. Retrieves all notes with user information, selecting only the “title, userId and createdAt”
export const getAllNotes = async (req, res) => {
    try {
        const userId = req.user._id;

        const notes = await NoteModel.find({ userId })
            .select("title userId createdAt")
            .populate({
                path: "userId",
                select: "email"
            });

        return res.status(200).json({
            message: "Done",
            notes
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to retrieve notes",
            error: err.message
        });
    }
};

//10. Using aggregation, retrieves all notes
export const getNotesByAggregate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title } = req.query;

        const pipeline = [
            {
                $match: {
                    userId,
                    ...(title && { title })
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    title: 1,
                    createdAt: 1,
                    "user.name": 1,
                    "user.email": 1
                }
            }
        ];

        const notes = await NoteModel.aggregate(pipeline);

        return res.status(200).json({
            message: "Done",
            notes
        });

    } catch (err) {
        return res.status(500).json({
            message: "Aggregation failed",
            error: err.message
        });
    }
};

//11. Delete all notes
export const deleteAllNotes = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await NoteModel.deleteMany({ userId });

        return res.status(200).json({
            message: "Deleted",
            deletedCount: result.deletedCount
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to delete user notes",
            error: err.message
        });
    }
};