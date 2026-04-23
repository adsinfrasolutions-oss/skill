module.exports = {
  apps: [
    {
      name: "skill-quantproc-manpower",
      script: "./server.js",
      cwd: "/var/www/skill.quantproc.com/app",
      env: {
        PORT: 3011,
        APP_HOST: "skill.quantproc.com"
      }
    }
  ]
};
