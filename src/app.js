

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUii = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const expensesRoutes = require('./routes/expenses');
const groupsRoutes = require('./routes/groups');
const userRoutes = require('./routes/users')


const app = express();
app.use(bodyParser.json());

// Swagger UI setup
app.use('/api-docs', swaggerUii.serve, swaggerUii.setup(swaggerSpec));

app.use('/expenses', expensesRoutes);
app.use('/groups', groupsRoutes); // Use group routes
app.use('/users', userRoutes); 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
