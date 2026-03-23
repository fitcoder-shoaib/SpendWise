const mockData = require("../data/mockData");
const { createId } = require("../utils/id");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const state = clone(mockData);

function getUsers() {
  return state.users;
}

function getTransactions() {
  return state.transactions;
}

function getGoals() {
  return state.goals;
}

function getFriends() {
  return state.friends;
}

function findUserById(userId) {
  return state.users.find((user) => user.id === userId) || null;
}

function findUserByEmail(email) {
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function addUser(payload) {
  const user = {
    id: createId("user"),
    totalSavings: 0,
    weeklySavings: 0,
    savingsLedger: [],
    ...payload
  };

  state.users.push(user);
  return user;
}

function addTransaction(payload) {
  const transaction = { id: createId("txn"), ...payload };
  state.transactions.push(transaction);
  return transaction;
}

function addGoal(payload) {
  const goal = { id: createId("goal"), linkedAutoSave: false, ...payload };
  state.goals.push(goal);
  return goal;
}

function findGoalById(goalId) {
  return state.goals.find((goal) => goal.id === goalId) || null;
}

module.exports = {
  getUsers,
  getTransactions,
  getGoals,
  getFriends,
  findUserById,
  findUserByEmail,
  findGoalById,
  addUser,
  addTransaction,
  addGoal
};
