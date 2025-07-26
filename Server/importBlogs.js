import mongoose from "mongoose";
import fs from "fs";
import Blog from "./models/Blog.js"; // Adjust the path if necessary

mongoose.connect("mongodb://localhost:27017/PetConnect", {
});

const importData = async () => {
  try {
    // Read JSON file
    const blogs = JSON.parse(fs.readFileSync("./PetConnect.blogslatest.cleaned.json", "utf-8"));
 // Adjust path if needed
    
    // Insert data into MongoDB
    await Blog.insertMany(blogs);
    console.log("✅ Blogs Imported Successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error importing blogs:", error);
    mongoose.connection.close();
  }
};

importData();
