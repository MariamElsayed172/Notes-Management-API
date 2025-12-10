import express from 'express'
import { auth } from '../../middleware/auth.middleware.js'
import * as noteService from './note.service.js'

const router = express.Router()

router.post("/", auth, noteService.createNote)
router.patch("/all", auth, noteService.updateAllTitles)
router.get("/paginate-sort", auth, noteService.getPaginatedNotes)
router.get("/note-by-content", auth, noteService.getNoteByContent)
router.get("/note-with-user", auth, noteService.getAllNotes)
router.get("/aggregate", auth, noteService.getNotesByAggregate)
router.delete("/", auth, noteService.deleteAllNotes)
router.get("/:noteId", auth, noteService.getNoteById)
router.patch("/:noteId", auth, noteService.updateNote)
router.put("/:noteId", auth, noteService.replaceNote)
router.delete("/:noteId", auth, noteService.deleteNoteById)

export default router