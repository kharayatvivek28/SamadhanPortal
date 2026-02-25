// Seed script — run with: node utils/seedData.js
// Creates departments and employees using the admin API

import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const departments = [
  { name: 'Public Works', description: 'Roads, bridges, public infrastructure and maintenance' },
  { name: 'Revenue & Taxation', description: 'Property tax, land records and revenue collection' },
  { name: 'Water Supply & Sanitation', description: 'Drinking water, drainage and sewage management' },
  { name: 'Health & Family Welfare', description: 'Public hospitals, health centres and sanitation drives' },
  { name: 'Education', description: 'Government schools, scholarships and education policy' },
  { name: 'Transport', description: 'Public transport, road permits and traffic management' },
];

const employeesByDept = {
  'Public Works': [
    { name: 'Rajesh Kumar', email: 'rajeshkumar@gmail.com' },
    { name: 'Priya Sharma', email: 'priyasharma@gmail.com' },
    { name: 'Amit Patel', email: 'amitpatel@gmail.com' },
    { name: 'Sunita Verma', email: 'sunitaverma@gmail.com' },
    { name: 'Vikram Singh', email: 'vikramsingh@gmail.com' },
  ],
  'Revenue & Taxation': [
    { name: 'Anjali Gupta', email: 'anjaligupta@gmail.com' },
    { name: 'Rohit Mehta', email: 'rohitmehta@gmail.com' },
    { name: 'Kavita Joshi', email: 'kavitajoshi@gmail.com' },
    { name: 'Suresh Nair', email: 'sureshnair@gmail.com' },
    { name: 'Deepika Reddy', email: 'deepikareddy@gmail.com' },
  ],
  'Water Supply & Sanitation': [
    { name: 'Manoj Tiwari', email: 'manojtiwari@gmail.com' },
    { name: 'Rashmi Desai', email: 'rashmidesai@gmail.com' },
    { name: 'Arjun Rao', email: 'arjunrao@gmail.com' },
    { name: 'Pooja Mishra', email: 'poojamishra@gmail.com' },
    { name: 'Dinesh Pandey', email: 'dineshpandey@gmail.com' },
  ],
  'Health & Family Welfare': [
    { name: 'Neha Kapoor', email: 'nehakapoor@gmail.com' },
    { name: 'Sanjay Yadav', email: 'sanjayyadav@gmail.com' },
    { name: 'Meera Iyer', email: 'meeraiyer@gmail.com' },
    { name: 'Ravi Chauhan', email: 'ravichauhan@gmail.com' },
    { name: 'Anita Saxena', email: 'anitasaxena@gmail.com' },
  ],
  'Education': [
    { name: 'Harish Bhatt', email: 'harishbhatt@gmail.com' },
    { name: 'Swati Agarwal', email: 'swatiagarwal@gmail.com' },
    { name: 'Govind Menon', email: 'govindmenon@gmail.com' },
    { name: 'Lakshmi Pillai', email: 'lakshmipillai@gmail.com' },
    { name: 'Nitin Kulkarni', email: 'nitinkulkarni@gmail.com' },
  ],
  'Transport': [
    { name: 'Ashok Thakur', email: 'ashokthakur@gmail.com' },
    { name: 'Pallavi Dubey', email: 'pallavidubey@gmail.com' },
    { name: 'Kiran Bhat', email: 'kiranbhat@gmail.com' },
    { name: 'Sunil Jha', email: 'suniljha@gmail.com' },
    { name: 'Ritu Srivastava', email: 'ritusrivastava@gmail.com' },
  ],
};

async function seed() {
  // 1. Login as admin
  console.log('Logging in as admin...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '123456789' }),
  });

  if (!loginRes.ok) {
    console.error('Admin login failed:', await loginRes.text());
    process.exit(1);
  }

  const admin = await loginRes.json();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${admin.token}`,
  };
  console.log('Admin logged in ✓');

  // 2. Create departments
  console.log('\nCreating departments...');
  const deptMap = {};

  for (const dept of departments) {
    const res = await fetch(`${BASE}/admin/departments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dept),
    });

    if (res.ok) {
      const d = await res.json();
      deptMap[dept.name] = d._id;
      console.log(`  ✓ ${dept.name}`);
    } else {
      const err = await res.json();
      console.log(`  ⚠ ${dept.name}: ${err.message}`);
    }
  }

  // 3. Create employees and assign to departments
  console.log('\nCreating employees...');

  for (const [deptName, employees] of Object.entries(employeesByDept)) {
    console.log(`\n  Department: ${deptName}`);
    const departmentId = deptMap[deptName];

    for (const emp of employees) {
      const res = await fetch(`${BASE}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: emp.name,
          email: emp.email,
          password: '123456789',
          role: 'employee',
          departmentId: departmentId || null,
        }),
      });

      if (res.ok) {
        console.log(`    ✓ ${emp.name} (${emp.email})`);
      } else {
        const err = await res.json();
        console.log(`    ⚠ ${emp.name}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);
