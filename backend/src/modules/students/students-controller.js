const asyncHandler = require("express-async-handler");
const {
  getAllStudents,
  addNewStudent,
  getStudentDetail,
  setStudentStatus,
  updateStudent,
} = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
  const { name, className, section, roll } = req.query;

  const filterPayload = {
    name: name || null,
    className: className || null,
    section: section || null,
    roll: roll || null,
  };

  const students = await getAllStudents(filterPayload);

  res.status(200).json({
    success: true,
    students: students,
    count: students.length,
  });
});

const handleAddStudent = asyncHandler(async (req, res) => {
  try {
    // Get all the data from request body
    const payload = req.body;

    // Basic validation - only check for name
    if (!payload.name || payload.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    // Call the service to add student
    const result = await addNewStudent(payload);

    // Return success response
    res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add student",
    });
  }
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatePayload = {
    id: parseInt(id),
    ...req.body,
  };

  const result = await updateStudent(updatePayload);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await getStudentDetail(parseInt(id));

  res.status(200).json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const reviewerId = req.user?.id || 1; // Default reviewer ID

  const result = await setStudentStatus({
    userId: parseInt(id),
    reviewerId: reviewerId,
    status: status,
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  handleGetAllStudents,
  handleGetStudentDetail,
  handleAddStudent,
  handleStudentStatus,
  handleUpdateStudent,
};
