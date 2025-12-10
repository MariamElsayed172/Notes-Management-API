import express from 'express'
import connectDB from './DB/connection.db.js'
import authController from './modules/auth/auth.controller.js'
import noteController from './modules/note/note.controller.js'

const bootstrap = async () => {
    const app = express()
    const port = 3000

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


    //DB
    await connectDB()
    //app-router
    app.get('/', (req, res) => res.json({message:'hello world'}))
    app.use('/auth', authController)
    app.use('/note', noteController)

    app.get('{/*dummy}', (req, res) => res.status(404).json({message:'In-valid routing'}))
    return app.listen(port, () => console.log(`app listening on port ${port}!`))
}
export default bootstrap