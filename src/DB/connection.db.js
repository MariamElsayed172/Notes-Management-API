import mongoose from 'mongoose'
const connectDB = async () => {
    try {
        const result = await mongoose.connect("mongodb://localhost:27017/StickyNotes")
        console.log(result.models);
        console.log("DB connected");
    } catch (error) {
        console.log(`Fail to connect on DB `, error);

    }

}
export default connectDB