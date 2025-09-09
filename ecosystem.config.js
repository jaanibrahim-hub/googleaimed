module.exports = {
  apps: [
    {
      name: 'mediteach-ai',
      script: 'server.js',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/user/webapp/logs/err.log',
      out_file: '/home/user/webapp/logs/out.log',
      log_file: '/home/user/webapp/logs/combined.log',
      time: true
    }
  ]
};