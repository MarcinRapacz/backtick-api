import swaggerJsDoc from 'swagger-jsdoc';
const port = process.env.PORT || 8000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backtick API',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./dist/**/*.js'],
};

const specs = swaggerJsDoc(options);

export { specs };
