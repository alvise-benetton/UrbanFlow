module.exports = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request : [${new Date().toISOString()}] ${req.method} ${req.originalUrl} body: ${JSON.stringify(req.body)}`);
        console.log(`Response: [${new Date().toISOString()}] ${res.statusCode} - ${duration}ms`);
    });

    next();
};