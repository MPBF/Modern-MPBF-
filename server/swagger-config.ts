/**
 * 📚 Swagger/OpenAPI Documentation Setup
 * Generates comprehensive API documentation from JSDoc comments
 */

import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MPBF Next - ERP API",
      version: "2.0.0",
      description:
        "Modern Plastic Bag Factory (MPBF) - Arabic-first ERP system for plastic bag manufacturing",
      contact: {
        name: "MPBF Development Team",
        url: "https://mpbf.example.com",
        email: "dev@mpbf.example.com",
      },
      license: {
        name: "Proprietary",
        url: "https://mpbf.example.com/license",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: "https://api.mpbf.example.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session cookie for traditional authentication",
        },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["message", "code"],
          properties: {
            message: {
              type: "string",
              description: "Error message in Arabic",
            },
            code: {
              type: "string",
              description: "Error code for programmatic handling",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              description: "Array of items",
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", description: "Current page" },
                limit: {
                  type: "integer",
                  description: "Items per page",
                },
                total: {
                  type: "integer",
                  description: "Total number of items",
                },
                pages: {
                  type: "integer",
                  description: "Total number of pages",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        sessionAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Authentication and session management",
      },
      { name: "Production", description: "Manufacturing and production orders" },
      {
        name: "Inventory",
        description: "Stock management and warehouse operations",
      },
      { name: "Orders", description: "Sales orders and customer management" },
      { name: "HR", description: "Human resources and employee management" },
      { name: "Maintenance", description: "Equipment maintenance" },
      { name: "Quality", description: "Quality control and inspections" },
      { name: "System", description: "System settings and administration" },
    ],
  },
  apis: [
    "./server/routes.ts",
    "./server/routes/**/*.ts",
    "./server/*-routes.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
