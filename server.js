
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: Read JSON data from requests
app.use(express.json());

// In-memory student array (No database)
let students = [];

// Auto-generated ID
let nextId = 1;

// Helper function to validate student data
function validStudent(name, course, age) {
    return (
        typeof name === "string" &&
        name.trim() !== "" &&
        typeof course === "string" &&
        course.trim() !== "" &&
        typeof age === "number" &&
        Number.isFinite(age) &&
        age > 0
    );
}

// 1. POST - Add a new student
app.post("/api/students", (req, res) => {
    const { name, course, age } = req.body;

    // Check missing or invalid data
    if (!validStudent(name, course, age)) {
        return res.status(400).json({
            message: "Missing or invalid student data"
        });
    }

    // Check duplicate name
    const existing = students.find(
        student => student.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existing) {
        return res.status(409).json({
            message: "Student name already exists"
        });
    }

    // Create student
    const newStudent = {
        id: nextId++,
        name: name.trim(),
        course: course.trim(),
        age: age
    };

    students.push(newStudent);

    return res.status(201).json({
        message: "Student added successfully",
        student: newStudent
    });
});

// 2. GET - Get all students or filter by course
app.get("/api/students", (req, res) => {
    const { course } = req.query;

    if (course) {
        const filteredStudents = students.filter(
            student => student.course.toLowerCase() === course.toLowerCase()
        );

        return res.status(200).json(filteredStudents);
    }

    return res.status(200).json(students);
});

// 3. GET - Get a student by ID
app.get("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    return res.status(200).json(student);
});

// 4. PUT - Update a student by ID
app.put("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, course, age } = req.body;

    // Check missing or invalid data
    if (!validStudent(name, course, age)) {
        return res.status(400).json({
            message: "Missing or invalid student data"
        });
    }

    // Check duplicate name (excluding current student)
    const duplicate = students.find(
        s => s.id !== id &&
        s.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
        return res.status(409).json({
            message: "Student name already exists"
        });
    }

    // Update student
    student.name = name.trim();
    student.course = course.trim();
    student.age = age;

    return res.status(200).json({
        message: "Student updated successfully",
        student: student
    });
});

// 5. DELETE - Delete a student by ID
app.delete("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const deletedStudent = students.splice(index, 1)[0];

    return res.status(200).json({
        message: "Student deleted successfully",
        student: deletedStudent
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});