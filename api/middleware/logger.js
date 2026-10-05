module.exports = (req, res, next) => {
  // Mute request logging in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    let safeBody = undefined;
    if (req.body && typeof req.body === 'object') {
      safeBody = { ...req.body };
      if (safeBody.password) {
        safeBody.password = '***';
      }
    }
    const bodyStr = safeBody ? ` body: ${JSON.stringify(safeBody)}` : '';
    console.log(`Request : [${new Date().toISOString()}] ${req.method} ${req.originalUrl}${bodyStr}`);
    console.log(`Response: [${new Date().toISOString()}] ${res.statusCode} - ${duration}ms`);
  });

  next();
};