module.exports = {
    apps : [{
      name: 'my-app', // Name of your application
      script: 'dist/server.js', // Entry point
      instances: 'max', // Number of instances (or 'max' to use all cores)
      env: {
        NODE_ENV: 'production' // Environment variables
      }
    }]
  };