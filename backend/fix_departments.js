import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Department from "./models/Department.js";
import User from "./models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const fixData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check departments
    const departments = await Department.find();
    console.log("DEPARTMENTS:");
    for (const d of departments) {
      const emps = await User.find({ department: d._id });
      console.log(`- [${d._id}] ${d.name} (Employees: ${emps.map(e => e.name).join(", ")})`);
      
      // Update department employees array just in case it's out of sync
      d.employees = emps.map(e => e._id);
      await d.save();
    }
    
    // Find duplicate Public Works
    const pubWorks = await Department.find({ name: /Public Work/i });
    if (pubWorks.length > 1) {
      console.log(`\nFound ${pubWorks.length} Public Works Departments. Consolidating...`);
      const keepId = pubWorks[0]._id;
      for (let i = 1; i < pubWorks.length; i++) {
        const removeId = pubWorks[i]._id;
        console.log(`Moving employees from ${removeId} to ${keepId}`);
        await User.updateMany({ department: removeId }, { department: keepId });
        await Department.findByIdAndDelete(removeId);
      }
      
      // Re-sync array for the valid one
      const finalEmps = await User.find({ department: keepId });
      pubWorks[0].employees = finalEmps.map(e => e._id);
      await pubWorks[0].save();
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
