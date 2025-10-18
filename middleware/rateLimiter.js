import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for creation endpoints - 10 requests per hour
export const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 create requests per hour
    message: {
        success: false,
        error: 'Too many records created, please try again after an hour'
    }
});

// Different limits for different HTTP methods
export const methodBasedLimiter = (maxRequests) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: maxRequests,
        message: {
            success: false,
            error: `Rate limit exceeded for this endpoint`
        }
    });
};

// Pre-configured method-based limiters
export const getLimiter = methodBasedLimiter(200);    // 200 GET requests per 15 min
export const postLimiter = methodBasedLimiter(50);    // 50 POST requests per 15 min  
export const putLimiter = methodBasedLimiter(100);    // 100 PUT requests per 15 min
export const deleteLimiter = methodBasedLimiter(25);  // 25 DELETE requests per 15 min
