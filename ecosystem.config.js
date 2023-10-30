module.exports = [
  {
    script: "server/app.js",
    name: "cookme",
    merge_logs: true,
    max_restarts: 20,
    log_type: "json",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    env: {
      NODE_ENV: "production",
    },
    env_development: {
      NODE_ENV: "development",
    },
  },
];
