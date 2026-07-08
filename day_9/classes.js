class Storage {
  static load(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }
  static save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  static saveAll() {
    Storage.save("books", books);
    Storage.save("students", students);
    Storage.save("history", history);
  }
}
class Person {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Student extends Person {
  constructor(id, name) {
    super(id, name);
    this.records = [];
  }

  borrowBook(title) {
    this.records.push({
      book: title,
      borrowedAt: new Date().toLocaleString(),
      returnedAt: "",
      status: "Borrowed",
    });
  }

  returnBook(title) {
    const record = this.records.find(
      (record) => record.book === title && record.status === "Borrowed",
    );
    if (!record) return;
    record.status = "Returned";
    record.returnedAt = new Date().toLocaleString();
  }

  borrowedCount() {
    return this.records.filter((record) => record.status === "Borrowed").length;
  }
}

class Item {
  constructor(id, title) {
    this.id = id;
    this.title = title;
  }
}

class Book extends Item {
  constructor(id, title, author, category, copies) {
    super(id, title);
    this.author = author;
    this.category = category;
    this.totalCopies = copies;
    this.availableCopies = copies;
    this.borrowedBy = [];
  }
  borrow(studentId, studentName) {
    if (this.availableCopies === 0) return false;
    this.availableCopies--;
    this.borrowedBy.push({
      studentId,
      studentName,
    });
    return true;
  }
  return(studentId) {
    const index = this.borrowedBy.findIndex(
      (student) => student.studentId === studentId,
    );
    if (index === -1) return false;
    this.borrowedBy.splice(index, 1);
    this.availableCopies++;
    return true;
  }
  borrowedCopies() {
    return this.totalCopies - this.availableCopies;
  }
  isAvailable() {
    return this.availableCopies > 0;
  }
}

let books = Storage.load("books").map((book) =>
  Object.assign(
    new Book(book.id, book.title, book.author, book.category, book.totalCopies),
    book,
  ),
);
let students = Storage.load("students").map((student) =>
  Object.assign(new Student(student.id, student.name), student),
);

let history = Storage.load("history");
let editBookId = null;
let nextBookId =
  books.length > 0 ? Math.max(...books.map((book) => book.id)) + 1 : 1;

const totalBooksEl = document.getElementById("totalBooks");
const availableBooksEl = document.getElementById("availableBooks");
const borrowedBooksEl = document.getElementById("borrowedBooks");

const bookForm = document.getElementById("bookForm");
const saveBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const copiesInput = document.getElementById("copies");

const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");

const bookTable = document.getElementById("bookTable");
const historyTable = document.getElementById("historyTable");
const studentTable = document.getElementById("studentTable");

function updateDashboard() {
  totalBooksEl.textContent = books.length;
  availableBooksEl.textContent = books.reduce(
    (total, book) => total + book.availableCopies,
    0,
  );
  borrowedBooksEl.textContent = books.reduce(
    (total, book) => total + book.borrowedCopies(),
    0,
  );
}

function renderHistory() {
  historyTable.innerHTML = "";
  historyTable.innerHTML = history
    .map(
      (item) => `
      <tr>
        <td>${item.book}</td>
        <td>${item.action}</td>
        <td>${item.time}</td>
      </tr>
    `,
    )
    .join("");
}

function renderStudents() {
  studentTable.innerHTML = "";
  studentTable.innerHTML = students
    .map(
      (student) => `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.borrowedCount()}</td>
        <td>
          <button data-action="viewStudent"
            data-id="${student.id}"
          > View
          </button>
        </td>
      </tr>
    `,
    )
    .join("");
}

function renderBooks() {
  bookTable.innerHTML = "";
  let filteredBooks = books;
  const searchValue = searchInput.value.toLowerCase();
  if (filterStatus.value === "Available") {
    filteredBooks = filteredBooks.filter((book) => book.isAvailable());
  }

  if (filterStatus.value === "Out") {
    filteredBooks = filteredBooks.filter((book) => !book.isAvailable());
  }
  filteredBooks = filteredBooks.filter((book) =>
    book.title.toLowerCase().includes(searchValue),
  );

  bookTable.innerHTML = filteredBooks
    .map(
      (book) => `
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>
          ${book.availableCopies} / ${book.totalCopies}
        </td>
        <td>
          <button class="borrow" data-action="borrow"
            data-id="${book.id}"
          > Borrow
          </button>
        </td>
        <td>
          <button class="return" data-action="return"
            data-id="${book.id}"
          > Return
          </button>
        </td>
        <td>
          <button class="edit" data-action="edit"
            data-id="${book.id}"
          > Edit
          </button>
          <button class="delete" data-action="delete"
            data-id="${book.id}"
          > Delete
          </button>
        </td>
      </tr>
    `,
    )
    .join("");
  updateDashboard();
}

function refresh() {
  Storage.saveAll();
  renderBooks();
  renderStudents();
  renderHistory();
}

function deleteBook(id) {
  books = books.filter((book) => book.id !== id);
  refresh();
}

function editBook(id) {
  const book = books.find((book) => book.id === id);
  if (!book) return;
  titleInput.value = book.title;
  authorInput.value = book.author;
  categoryInput.value = book.category;
  copiesInput.value = book.totalCopies;
  editBookId = id;
  saveBtn.textContent = "Update Book";
}

refresh();

function borrowBook(id) {
  const book = books.find((book) => book.id === id);
  if (!book || !book.isAvailable()) {
    alert("No copies available.");
    return;
  }

  const studentId = prompt("Enter Student ID:");
  if (!studentId) return;
  const studentName = prompt("Enter Student Name:");
  if (!studentName) return;
  if (!book.borrow(studentId, studentName)) return;
  let student = students.find((student) => student.id === studentId);

  if (!student) {
    student = new Student(studentId, studentName);
    students.push(student);
  }
  student.borrowBook(book.title);

  history.unshift({
    book: book.title,
    action: `${studentName} borrowed the book`,
    time: new Date().toLocaleString(),
  });

  refresh();
}

function returnBook(id) {
  const book = books.find((book) => book.id === id);
  if (!book || book.borrowedBy.length === 0) {
    alert("No borrowed copies.");
    return;
  }

  const list = book.borrowedBy
    .map(
      (student, index) =>
        `${index + 1}. ${student.studentId} - ${student.studentName}`,
    )
    .join("\n");

  const choice = Number(
    prompt(`Who is returning the book?\n\n${list}\n\nEnter number:`),
  );

  if (!choice || choice < 1 || choice > book.borrowedBy.length) return;
  const borrower = book.borrowedBy[choice - 1];
  if (!book.return(borrower.studentId)) return;
  const student = students.find((student) => student.id === borrower.studentId);
  if (student) {
    student.returnBook(book.title);
  }

  history.unshift({
    book: book.title,
    action: `${borrower.studentName} returned the book`,
    time: new Date().toLocaleString(),
  });

  refresh();
}

function viewStudent(id) {
  const student = students.find((student) => student.id == id);

  if (!student) return;
  studentName.textContent = student.name;
  studentHistory.innerHTML = "";
  student.records.forEach((record) => {
    studentHistory.innerHTML += `
      <tr>
        <td>${record.book}</td>
        <td>${record.borrowedAt}</td>
        <td>${record.returnedAt || "-"}</td>
        <td>${record.status}</td>
      </tr>
    `;
  });

  studentModal.style.display = "flex";
}

function toggleSection(section) {
  const historyMode = section === "history";
  historySection.style.display = historyMode ? "block" : "none";
  studentsSection.style.display = historyMode ? "none" : "block";
  historyTab.classList.toggle("active", historyMode);
  studentsTab.classList.toggle("active", !historyMode);
}

// Form Submit
bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (editBookId === null) {
    books.push(
      new Book(
        nextBookId++,
        titleInput.value.trim(),
        authorInput.value.trim(),
        categoryInput.value.trim(),
        Number(copiesInput.value),
      ),
    );
  } else {
    const book = books.find((book) => book.id === editBookId);
    book.title = titleInput.value.trim();
    book.author = authorInput.value.trim();
    book.category = categoryInput.value.trim();
    editBookId = null;
    saveBtn.textContent = "Add Book";
  }

  refresh();
  bookForm.reset();
});

// Book Table Events
const bookActions = {
  edit: editBook,
  delete: deleteBook,
  borrow: borrowBook,
  return: returnBook,
};

bookTable.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  bookActions[button.dataset.action]?.(Number(button.dataset.id));
});

// Student Table Events
studentTable.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "viewStudent") {
    viewStudent(button.dataset.id);
  }
});

filterStatus.addEventListener("change", renderBooks);
searchInput.addEventListener("input", renderBooks);
historyTab.addEventListener("click", () => toggleSection("history"));
studentsTab.addEventListener("click", () => toggleSection("students"));
closeModal.addEventListener("click", () => {
  studentModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === studentModal) {
    studentModal.style.display = "none";
  }
});
toggleSection("history");
refresh();
