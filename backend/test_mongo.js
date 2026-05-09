const mongoose = require('mongoose');
const uri = "mongodb+srv://sahnisugandhi_db_user:Sug%4020013@cluster0.cmzpono.mongodb.net/ai_movie_platform?retryWrites=true&w=majority";

async function test() {
  try {
    console.log("Connecting...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected!");
    
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    console.log("Querying...");
    const user = await User.findOne({ email: "test@test.com" });
    console.log("Query success! User:", user);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}
test();
