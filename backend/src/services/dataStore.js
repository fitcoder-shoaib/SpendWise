const { mkdirSync } = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const mockData = require("../data/mockData");
const { createId } = require("../utils/id");
const { hashPassword } = require("../utils/password");
const env = require("../config/env");

const dbDirectory = path.dirname(env.sqlitePath);
mkdirSync(dbDirectory, { recursive: true });

const db = new DatabaseSync(env.sqlitePath);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    total_savings REAL NOT NULL DEFAULT 0,
    weekly_savings REAL NOT NULL DEFAULT 0,
    fixed_monthly_savings REAL NOT NULL DEFAULT 3000,
    daily_spending_limit REAL NOT NULL DEFAULT 2000,
    auto_round_off INTEGER NOT NULL DEFAULT 1,
    daily_auto_save_threshold REAL NOT NULL DEFAULT 1200,
    daily_auto_save_amount REAL NOT NULL DEFAULT 120,
    leaderboard_show_percentage INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL NOT NULL DEFAULT 0,
    deadline TEXT NOT NULL,
    linked_auto_save INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS savings_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weekly_savings REAL NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0
  );
`);

function toNumber(value) {
  return Number(value || 0);
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    savingsSettings: {
      fixedMonthlySavings: toNumber(row.fixed_monthly_savings),
      dailySpendingLimit: toNumber(row.daily_spending_limit),
      autoRoundOff: Boolean(row.auto_round_off),
      dailyAutoSaveThreshold: toNumber(row.daily_auto_save_threshold),
      dailyAutoSaveAmount: toNumber(row.daily_auto_save_amount),
      leaderboardShowPercentage: Boolean(row.leaderboard_show_percentage)
    },
    totalSavings: toNumber(row.total_savings),
    weeklySavings: toNumber(row.weekly_savings)
  };
}

function mapTransactionRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    amount: toNumber(row.amount),
    category: row.category,
    type: row.type,
    description: row.description,
    date: row.date
  };
}

function mapGoalRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: toNumber(row.target_amount),
    currentAmount: toNumber(row.current_amount),
    deadline: row.deadline,
    linkedAutoSave: Boolean(row.linked_auto_save)
  };
}

function mapSavingsEntryRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    amount: toNumber(row.amount),
    note: row.note,
    date: row.date
  };
}

function mapFriendRow(row) {
  return {
    id: row.id,
    name: row.name,
    weeklySavings: toNumber(row.weekly_savings),
    streak: Number(row.streak || 0)
  };
}

function seedIfEmpty() {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (Number(countRow.count) > 0) {
    return;
  }

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, total_savings, weekly_savings,
      fixed_monthly_savings, daily_spending_limit, auto_round_off,
      daily_auto_save_threshold, daily_auto_save_amount, leaderboard_show_percentage
    ) VALUES (
      @id, @name, @email, @password_hash, @total_savings, @weekly_savings,
      @fixed_monthly_savings, @daily_spending_limit, @auto_round_off,
      @daily_auto_save_threshold, @daily_auto_save_amount, @leaderboard_show_percentage
    )
  `);
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, user_id, amount, category, type, description, date)
    VALUES (@id, @user_id, @amount, @category, @type, @description, @date)
  `);
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, linked_auto_save)
    VALUES (@id, @user_id, @name, @target_amount, @current_amount, @deadline, @linked_auto_save)
  `);
  const insertSavingsEntry = db.prepare(`
    INSERT INTO savings_entries (id, user_id, source, amount, note, date)
    VALUES (@id, @user_id, @source, @amount, @note, @date)
  `);
  const insertFriend = db.prepare(`
    INSERT INTO friends (id, name, weekly_savings, streak)
    VALUES (@id, @name, @weekly_savings, @streak)
  `);

  try {
    db.exec("BEGIN");

    for (const user of mockData.users) {
      insertUser.run({
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        password_hash: hashPassword(user.password),
        total_savings: toNumber(user.totalSavings),
        weekly_savings: toNumber(user.weeklySavings),
        fixed_monthly_savings: toNumber(user.savingsSettings.fixedMonthlySavings),
        daily_spending_limit: toNumber(user.savingsSettings.dailySpendingLimit),
        auto_round_off: user.savingsSettings.autoRoundOff ? 1 : 0,
        daily_auto_save_threshold: toNumber(user.savingsSettings.dailyAutoSaveThreshold),
        daily_auto_save_amount: toNumber(user.savingsSettings.dailyAutoSaveAmount),
        leaderboard_show_percentage: user.savingsSettings.leaderboardShowPercentage ? 1 : 0
      });

      for (const entry of user.savingsLedger || []) {
        insertSavingsEntry.run({
          id: entry.id,
          user_id: user.id,
          source: entry.source,
          amount: toNumber(entry.amount),
          note: entry.note || "",
          date: entry.date
        });
      }
    }

    for (const item of mockData.transactions) {
      insertTransaction.run({
        id: item.id,
        user_id: item.userId,
        amount: toNumber(item.amount),
        category: item.category,
        type: item.type,
        description: item.description,
        date: item.date
      });
    }

    for (const goal of mockData.goals) {
      insertGoal.run({
        id: goal.id,
        user_id: goal.userId,
        name: goal.name,
        target_amount: toNumber(goal.targetAmount),
        current_amount: toNumber(goal.currentAmount),
        deadline: goal.deadline,
        linked_auto_save: goal.linkedAutoSave ? 1 : 0
      });
    }

    for (const friend of mockData.friends) {
      insertFriend.run({
        id: friend.id,
        name: friend.name,
        weekly_savings: toNumber(friend.weeklySavings),
        streak: Number(friend.streak || 0)
      });
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

seedIfEmpty();

function getStorageMode() {
  return "sqlite";
}

async function findUserById(userId) {
  return mapUserRow(db.prepare("SELECT * FROM users WHERE id = ?").get(userId));
}

async function findUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return mapUserRow(db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail));
}

async function addUser(payload) {
  const user = {
    id: createId("user"),
    name: payload.name,
    email: String(payload.email).trim().toLowerCase(),
    passwordHash: payload.passwordHash || hashPassword(payload.password),
    savingsSettings: {
      fixedMonthlySavings: 3000,
      dailySpendingLimit: 2000,
      autoRoundOff: true,
      dailyAutoSaveThreshold: 1200,
      dailyAutoSaveAmount: 120,
      leaderboardShowPercentage: true,
      ...(payload.savingsSettings || {})
    },
    totalSavings: toNumber(payload.totalSavings),
    weeklySavings: toNumber(payload.weeklySavings)
  };

  db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, total_savings, weekly_savings,
      fixed_monthly_savings, daily_spending_limit, auto_round_off,
      daily_auto_save_threshold, daily_auto_save_amount, leaderboard_show_percentage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.name,
    user.email,
    user.passwordHash,
    user.totalSavings,
    user.weeklySavings,
    user.savingsSettings.fixedMonthlySavings,
    user.savingsSettings.dailySpendingLimit,
    user.savingsSettings.autoRoundOff ? 1 : 0,
    user.savingsSettings.dailyAutoSaveThreshold,
    user.savingsSettings.dailyAutoSaveAmount,
    user.savingsSettings.leaderboardShowPercentage ? 1 : 0
  );

  return findUserById(user.id);
}

async function updateUserSettings(userId, savingsSettings) {
  db.prepare(`
    UPDATE users
    SET
      fixed_monthly_savings = ?,
      daily_spending_limit = ?,
      auto_round_off = ?,
      daily_auto_save_threshold = ?,
      daily_auto_save_amount = ?,
      leaderboard_show_percentage = ?
    WHERE id = ?
  `).run(
    toNumber(savingsSettings.fixedMonthlySavings),
    toNumber(savingsSettings.dailySpendingLimit),
    savingsSettings.autoRoundOff ? 1 : 0,
    toNumber(savingsSettings.dailyAutoSaveThreshold),
    toNumber(savingsSettings.dailyAutoSaveAmount),
    savingsSettings.leaderboardShowPercentage ? 1 : 0,
    userId
  );

  return findUserById(userId);
}

async function listTransactionsByUser(userId) {
  const rows = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(userId);
  return rows.map(mapTransactionRow);
}

async function addTransaction(payload) {
  const transaction = {
    id: createId("txn"),
    userId: payload.userId,
    amount: toNumber(payload.amount),
    category: payload.category,
    type: payload.type,
    description: payload.description,
    date: payload.date
  };

  db.prepare(`
    INSERT INTO transactions (id, user_id, amount, category, type, description, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    transaction.id,
    transaction.userId,
    transaction.amount,
    transaction.category,
    transaction.type,
    transaction.description,
    transaction.date
  );

  return transaction;
}

async function listGoalsByUser(userId) {
  const rows = db.prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC").all(userId);
  return rows.map(mapGoalRow);
}

async function addGoal(payload) {
  const goal = {
    id: createId("goal"),
    userId: payload.userId,
    name: payload.name,
    targetAmount: toNumber(payload.targetAmount),
    currentAmount: toNumber(payload.currentAmount),
    deadline: payload.deadline,
    linkedAutoSave: Boolean(payload.linkedAutoSave)
  };

  db.prepare(`
    INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, linked_auto_save)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    goal.id,
    goal.userId,
    goal.name,
    goal.targetAmount,
    goal.currentAmount,
    goal.deadline,
    goal.linkedAutoSave ? 1 : 0
  );

  return goal;
}

async function findGoalById(goalId) {
  return mapGoalRow(db.prepare("SELECT * FROM goals WHERE id = ?").get(goalId));
}

async function updateGoalAmount(goalId, currentAmount) {
  db.prepare("UPDATE goals SET current_amount = ? WHERE id = ?").run(toNumber(currentAmount), goalId);
  return findGoalById(goalId);
}

async function listSavingsEntriesByUser(userId) {
  const rows = db.prepare("SELECT * FROM savings_entries WHERE user_id = ? ORDER BY date DESC").all(userId);
  return rows.map(mapSavingsEntryRow);
}

async function addSavingsEntry(userId, entry, options = {}) {
  const nextEntry = {
    id: createId("save"),
    userId,
    source: entry.source,
    amount: toNumber(entry.amount),
    note: entry.note || "",
    date: entry.date || new Date().toISOString()
  };

  const linkedGoalRow = !options.skipLinkedGoal && nextEntry.source !== "manual-goal"
    ? db.prepare(`
        SELECT * FROM goals
        WHERE user_id = ? AND linked_auto_save = 1
        ORDER BY deadline ASC
        LIMIT 1
      `).get(userId)
    : null;

  try {
    db.exec("BEGIN");

    db.prepare(`
      INSERT INTO savings_entries (id, user_id, source, amount, note, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      nextEntry.id,
      nextEntry.userId,
      nextEntry.source,
      nextEntry.amount,
      nextEntry.note,
      nextEntry.date
    );

    db.prepare(`
      UPDATE users
      SET
        total_savings = total_savings + ?,
        weekly_savings = weekly_savings + ?
      WHERE id = ?
    `).run(nextEntry.amount, nextEntry.amount, userId);

    if (linkedGoalRow) {
      const nextGoalAmount = Math.min(
        toNumber(linkedGoalRow.target_amount),
        toNumber(linkedGoalRow.current_amount) + nextEntry.amount
      );
      db.prepare("UPDATE goals SET current_amount = ? WHERE id = ?").run(nextGoalAmount, linkedGoalRow.id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    entry: nextEntry,
    user: await findUserById(userId)
  };
}

async function listFriends() {
  const rows = db.prepare("SELECT * FROM friends ORDER BY weekly_savings DESC").all();
  return rows.map(mapFriendRow);
}

module.exports = {
  addGoal,
  addSavingsEntry,
  addTransaction,
  addUser,
  findGoalById,
  findUserByEmail,
  findUserById,
  getStorageMode,
  listFriends,
  listGoalsByUser,
  listSavingsEntriesByUser,
  listTransactionsByUser,
  updateGoalAmount,
  updateUserSettings
};
