module.exports = {
  apps: [
    {
      name: 'chat-backend',
      script: 'server.js', // hoặc app.js, index.js tùy file chính của bạn
      cwd: '/home/ubuntu/chat-app/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};