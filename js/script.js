class Expense {
    constructor(name, amount, category, date, id = Date.now()) {
        this.name = name;
        this.amount = Number(amount);
        this.category = category;
        this.date = date;
        this.id = id;
    }
}

class ExpenseManager {
    constructor() {
        this.expenses = this.loadExpenses();
        this.currentCategory = "All";
    }

    addExpense(expense) {
        this.expenses = [...this.expenses, expense];
        this.saveExpenses();
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
    }

    getFilteredExpenses() {
        if (this.currentCategory === "All") {
            return this.expenses;
        }

        return this.expenses.filter(
            expense => expense.category === this.currentCategory
        );
    }

    getTotal(expenses) {
        return expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );
    }

    saveExpenses() {
        localStorage.setItem(
            "expenses",
            JSON.stringify(this.expenses)
        );
    }

    loadExpenses() {
        const savedExpenses = localStorage.getItem("expenses");

        if (!savedExpenses) {
            return [];
        }

        const parsedExpenses = JSON.parse(savedExpenses);

        return parsedExpenses.map(expense => {
            const { name, amount, category, date, id } = expense;

            return new Expense(
                name,
                amount,
                category,
                date,
                id
            );
        });
    }
}

const expenseForm = document.getElementById("expenseForm");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const categoryFilter = document.getElementById("categoryFilter");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");

const manager = new ExpenseManager();

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-GB");
}

function createExpenseHTML(expense) {
    const { id, name, amount, category, date } = expense;

    return `
        <div class="expense-item">
            <div class="expense-name">${name}</div>
            <div>${amount.toFixed(2)} UAH</div>
            <div>${category}</div>
            <div>${formatDate(date)}</div>
            <button class="delete-button" data-id="${id}">
                Delete
            </button>
        </div>
    `;
}

function renderExpenses() {
    const filteredExpenses = manager.getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        expenseList.innerHTML = `
            <div class="empty-message">
                No expenses found
            </div>
        `;
    } else {
        expenseList.innerHTML = filteredExpenses
            .map(createExpenseHTML)
            .join("");
    }

    const total = manager.getTotal(filteredExpenses);

    totalAmount.textContent = total.toFixed(2);
}

function setCurrentDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

expenseForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = amountInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || !amount || !category || !date) {
        return;
    }

    const expense = new Expense(
        name,
        amount,
        category,
        date
    );

    manager.addExpense(expense);

    expenseForm.reset();
    setCurrentDate();
    renderExpenses();
});

expenseList.addEventListener("click", event => {
    if (!event.target.classList.contains("delete-button")) {
        return;
    }

    const id = Number(event.target.dataset.id);

    manager.deleteExpense(id);
    renderExpenses();
});

categoryFilter.addEventListener("change", event => {
    manager.currentCategory = event.target.value;
    renderExpenses();
});

setCurrentDate();
renderExpenses();