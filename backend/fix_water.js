import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Department from "./models/Department.js";
import User from "./models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const fixData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find duplicate Water Supply
    const waterDepts = await Department.find({ name: /Water Supply/i });
    if (waterDepts.length > 1) {
      console.log(`\nFound ${waterDepts.length} Water Supply Departments. Consolidating...`);
      const keepId = waterDepts[0]._id;
      for (let i = 1; i < waterDepts.length; i++) {
        const removeId = waterDepts[i]._id;
        console.log(`Moving employees from ${removeId} to ${keepId}`);
        await User.updateMany({ department: removeId }, { department: keepId });
        await Department.findByIdAndDelete(removeId);
      }
      
      // Re-sync array for the valid one
      const finalEmps = await User.find({ department: keepId });
      waterDepts[0].employees = finalEmps.map(e => e._id);
      await waterDepts[0].save();
      console.log("Resolved duplicates.");
    }
    
    console.log("Finished db check");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixData();
