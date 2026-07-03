let students = [];
let editId = null;

const $ = (selector) => document.querySelector(selector);
const modal = $("#studentModal");
const form = $("#studentForm");
const table = $("#studentTable");
const studentCount = $("#studentCount");
const search = $("#search");
const standardFilter = $("#standardFilter");
const gradeFilter = $("#gradeFilter");
const openModalBtn = $("#openModal");
const closeModalBtn = $(".close");
const saveBtn = $("#saveBtn");
const elements = {
  inputs: {
    name: $("#name"),
    age: $("#age"),
    standard: $("#standard"),
    gender: $("#gender"),
    birthDate: $("#birthDate"),
    grade: $("#grade"),
  },
};

const getFormData = () =>
  Object.entries(elements.inputs).reduce(
    (data, [key, input]) => ({
      ...data,[key]: input.value.trim(),}),{} );

const resetForm = () => {
  form.reset();
  editId = null;
  saveBtn.textContent = "Save Student";
};

const closeModal = () => {
  modal.style.display = "none";
  resetForm();
};

const isFormValid = (student) => {
  const emptyField = Object.values(student).some((value) => !value);
  if (emptyField) {
    alert("Please fill all fields.");
    return false;
  }
  if (Number(student.age) <= 1) {
    alert("Please enter a valid age.");
    return false;
  }
  return true;
};

const addStudent = (student) => {
    students.push({id: Date.now(), ...student,});
};

const updateStudent = (updatedStudent) => {
  students = students.map((student) =>
    student.id === editId ? { ...student, ...updatedStudent } : student
  );
};

const deleteStudent = (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this student?");
  if (!confirmDelete) return;
  students = students.filter((student) => student.id !== id);
  renderStudents();
};

const fillForm = (student) => {
  Object.entries(student).forEach(([key, value]) => {
    if (elements.inputs[key]) {
      elements.inputs[key].value = value;
    }
  });
};

const editStudent = (id) => {
  const selectedStudent = students.find((student) => student.id === id);
  if (!selectedStudent) return;
  editId = id;
  fillForm(selectedStudent);

  saveBtn.textContent = "Update Student";
  modal.style.display = "flex";
};

const getFilteredStudents = () => {
  const searchText = search.value.toLowerCase();
  const selectedStandard = standardFilter.value;
  const selectedGrade =gradeFilter.value;

  return students
    .filter(({ name, standard, grade }) => {
      const matchesName = name.toLowerCase().includes(searchText);
      const matchesStandard = !selectedStandard || standard === selectedStandard;
      const matchesGrade = !selectedGrade || grade === selectedGrade;

      return matchesName && matchesStandard && matchesGrade;
    })
    .sort((first, second) => {
      const standardDifference = Number(first.standard) - Number(second.standard);

      return standardDifference || first.name.localeCompare(second.name);
    });
};

const getStudentRow = ({id, name,age,standard,gender,birthDate,grade,}) => `
  <tr>
    <td>${name}</td>
    <td>${age}</td>
    <td>${standard}</td>
    <td>${gender}</td>
    <td>${birthDate}</td>
    <td>${grade}</td>
    <td class="action-buttons">
    <button data-action="edit" data-id="${id}" class="icon-btn" title="Edit">
      <i class="fa-solid fa-pen-to-square"></i>
    </button>

    <button data-action="delete" data-id="${id}" class="icon-btn" title="Delete">
      <i class="fa-solid fa-trash"></i>
    </button>
  </td>
  </tr>
`;

const renderStudents = () => {
  const filteredStudents = getFilteredStudents();

  if (filteredStudents.length === 0) {
    table.innerHTML = `
        <tr>
            <td colspan="7">No students found</td>
        </tr>
    `;
} else {
    table.innerHTML = filteredStudents.map(getStudentRow).join("");
}
studentCount.textContent = students.length;
}

const handleFormSubmit = (event) => {
  event.preventDefault();
  const studentData = getFormData();
  if (!isFormValid(studentData)) return;
  editId ? updateStudent(studentData) : addStudent(studentData);
  renderStudents();
  closeModal();
};

const handleTableClick = (event) => {
  const { action, id } = event.target.closest("button")?.dataset || {};
  if (action === "edit") editStudent(Number(id));
  if (action === "delete") deleteStudent(Number(id));
};

const closeModalOnOutsideClick = (event) => {
  if (event.target === elements.modal) {
    closeModal();
  }
};

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});
closeModalBtn.addEventListener("click", closeModal);
form.addEventListener("submit", handleFormSubmit);
table.addEventListener("click", handleTableClick);
modal.addEventListener("click", closeModalOnOutsideClick);

[search, standardFilter, gradeFilter].forEach(
  (element) => element.addEventListener("input", renderStudents)
);

renderStudents();