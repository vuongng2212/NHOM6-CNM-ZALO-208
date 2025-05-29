module.exports = {
    apps: [{
      name: "backend",
      script: "./server/index.js",
      env: {
        NODE_ENV: "production",
      }
    }]
  }