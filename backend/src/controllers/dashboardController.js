const { getDashboard } = require("../services/dashboardService");

function getDashboardSummary(req, res) {
  res.json({
    success: true,
    dashboard: getDashboard(req.user)
  });
}

module.exports = {
  getDashboardSummary
};
