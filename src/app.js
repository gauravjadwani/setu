// const express = require('express');
// // const helmet = require('helmet');
// const xss = require('xss-clean');
// const mongoSanitize = require('express-mongo-sanitize');
// const compression = require('compression');
// const cors = require('cors');
// const passport = require('passport');
// const httpStatus = require('http-status');
// const config = require('./config/config');
// const morgan = require('./config/morgan');
// const { jwtStrategy } = require('./config/passport');
// const { authLimiter } = require('./middlewares/rateLimiter');
// const routes = require('./routes/v1');
// const { errorConverter, errorHandler } = require('./middlewares/error');
// const ApiError = require('./utils/ApiError');

// const app = express();

// if (config.env !== 'test') {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// // set security HTTP headers
// app.use(helmet());

// // parse json request body
// app.use(express.json());

// // parse urlencoded request body
// app.use(express.urlencoded({ extended: true }));

// // sanitize request data
// app.use(xss());
// app.use(mongoSanitize());

// // gzip compression
// app.use(compression());

// // enable cors
// app.use(cors());
// app.options('*', cors());

// // jwt authentication
// app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);

// // limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);
// }

// // v1 api routes
// app.use('/v1', routes);

// // send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// // convert error to ApiError, if needed
// app.use(errorConverter);

// // handle error
// app.use(errorHandler);

// module.exports = app;


const express = require('express');
const bodyParser = require('body-parser');
const swaggerUii = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// const redis = require('redis');





// Create Redis client
// const redisClient = redis.createClient({
//     host: 'redis',
//     port: 6379
// });

// redisClient.on('error', (err) => {
//     console.error('Error connecting to Redis:', err);
// });

const app = express();
app.use(bodyParser.json());

// Swagger UI setup
app.use('/api-docs', swaggerUii.serve, swaggerUii.setup(swaggerSpec));


// Import routes
const expensesRoutes = require('./routes/expenses');
const groupsRoutes = require('./routes/groups');
const userRoutes = require('./routes/users')
// New route for groups
app.use('/expenses', expensesRoutes);
app.use('/groups', groupsRoutes); // Use group routes
app.use('/users', userRoutes); 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
