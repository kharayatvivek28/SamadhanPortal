import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Department from "../models/Department.js";
import User from "../models/User.js";

// Load env vars from the backend directory
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // Define Departments
    const departmentsData = [
      {
        name: "Water Supply and Sanitation",
        description: "Handles water supply issues, sewage problems, and sanitation maintenance.",
        icon: "Droplets",
      },
      {
        name: "Public Works Department",
        description: "Repairs and maintains roads, bridges, and public infrastructure.",
        icon: "Building2",
      },
      {
        name: "Electricity Board",
        description: "Manages power outages, street lights, and billing issues.",
        icon: "Zap",
      },
      {
        name: "Municipal Corporation",
        description: "Handles garbage collection, stray animals, and property tax disputes.",
        icon: "MapPin",
      },
    ];

    console.log("Inserting departments...");
    const createdDepartments = [];
    for (const dept of departmentsData) {
      const existing = await Department.findOne({ name: dept.name });
      if (!existing) {
        const newDept = await Department.create(dept);
        createdDepartments.push(newDept);
        console.log(`Created department: ${newDept.name}`);
      } else {
        createdDepartments.push(existing);
        console.log(`Department already exists: ${existing.name}`);
      }
    }

    // Define Employees
    const employeesData = [
      {
        name: "Rajesh Kumar",
        email: "rajesh.water@example.com",
        password: "password123", // Will be hashed in pre-save hook
        role: "employee",
        isVerified: true,
        departmentName: "Water Supply and Sanitation",
      },
      {
        name: "Anjali Gupta",
        email: "anjali.pwd@example.com",
        password: "password123",
        role: "employee",
        isVerified: true,
        departmentName: "Public Works Department",
      },
      {
        name: "Amit Patel",
        email: "amit.electricity@example.com",
        password: "password123",
        role: "employee",
        isVerified: true,
        departmentName: "Electricity Board",
      },
      {
        name: "Priya Sharma",
        email: "priya.mc@example.com",
        password: "password123",
        role: "employee",
        isVerified: true,
        departmentName: "Municipal Corporation",
      },
    ];

    console.log("Inserting employees...");
    for (const emp of employeesData) {
      const existingEmp = await User.findOne({ email: emp.email });
      if (!existingEmp) {
        // Find department ID to link
        const dept = createdDepartments.find(d => d.name === emp.departmentName);
        if (dept) {
          await User.create({
            name: emp.name,
            email: emp.email,
            password: emp.password,
            role: emp.role,
            isVerified: emp.isVerified,
            department: dept._id,
          });
          console.log(`Created employee: ${emp.name} for ${dept.name}`);
        }
      } else {
        console.log(`Employee already exists: ${existingEmp.email}`);
      }
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error with data import:", error);
    process.exit(1);
  }
};

seedData();
