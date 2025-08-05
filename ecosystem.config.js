module.exports = {
    apps: [
      {
        name: 'tmail-app',
        script: 'npm',
        args: 'run start',
        cwd: __dirname,
        env: {
          NODE_ENV: 'production',
          PORT: 3009,
          HOSTNAME: '0.0.0.0',
        },
      },
    ],
  };
  