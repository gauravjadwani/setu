const swaggerJsDocx = require('swagger-jsdoc');


// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Splitwise API",
            version: "1.0.0",
            description: "API documentation for Splitwise-like app"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ["src/routes/*.js"], 
  };
  
const swaggerSpec = swaggerJsDocx(swaggerOptions);
module.exports = swaggerSpec;
