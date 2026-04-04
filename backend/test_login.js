import fetch from "node-fetch";

const testLogin = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gmail.com", password: "password" }), // assuming password is password or similar
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};

testLogin();
