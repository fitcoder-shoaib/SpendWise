const express = require("express");
const { createChatController } = require("../controllers/chatController");

function createChatRouter(deps) {
  const router = express.Router();
  const controller = createChatController(deps);

  router.post("/", deps.requireAuth, controller);

  return router;
}

module.exports = {
  createChatRouter
};
