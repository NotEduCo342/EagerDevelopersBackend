import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Enhanced Swagger configuration for professional API documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    // Basic API Information
    .setTitle('EagerDevelopers API')
    .setDescription(`Enterprise-grade RESTful API with JWT authentication, user management, and comprehensive security features.`)
    .setVersion('1.0.0')
    .setContact(
      'EagerDevelopers Team',
      'https://eagerdevelopers.com',
      'support@eagerdevelopers.com'
    )
    .setLicense(
      'MIT License',
      'https://opensource.org/licenses/MIT'
    )
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api-staging.eagerdevelopers.com', 'Staging Server')
    .addServer('https://api.eagerdevelopers.com', 'Production Server')
    
    // Authentication Schemes
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Authentication',
        description: 'Enter your JWT token to access protected endpoints',
        in: 'header',
      },
      'JWT-auth' // This name will be used in @ApiBearerAuth() decorators
    )
    
    // API Tags for Organization
    .addTag('Authentication', '🔐 User registration, login, logout, and token management')
    .addTag('Users', '👤 User profile management and administration')  
    .addTag('Health', '🏥 System health and status endpoints')
    .addTag('Admin', '👑 Administrative operations (admin access required)')
    .addTag('Analytics', '📊 Usage statistics and reporting')
    .addTag('Security', '🛡️ Security and rate limiting information')
    
    // External Documentation
    .setExternalDoc('GitHub Repository', 'https://github.com/eagerdevelopers/backend')
    
    .build();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Professional, modern CSS styling
  const customCss = `
    /* Hide default Swagger branding */
    .swagger-ui .topbar { display: none !important; }
    
    /* Custom header styling */
    .swagger-ui .info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      margin: -20px -20px 30px -20px;
      padding: 40px 30px;
      border-radius: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .swagger-ui .info .title {
      color: #ffffff !important;
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      margin-bottom: 15px !important;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    }
    
    .swagger-ui .info .description {
      color: #f8fafc !important;
      font-size: 1.1rem !important;
      line-height: 1.6 !important;
      margin-top: 10px !important;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
      font-weight: 400 !important;
    }
    
    /* Add professional badges */
    .swagger-ui .info::after {
      content: "";
      display: block;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.2);
      background-image: 
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-size: 20px;
      padding-left: 30px;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    /* Enhanced authentication section */
    .swagger-ui .scheme-container {
      background: linear-gradient(145deg, #f8fafc, #e2e8f0) !important;
      border: 2px solid #3b82f6 !important;
      border-radius: 12px !important;
      padding: 25px !important;
      margin: 20px 0 !important;
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15) !important;
    }
    
    .swagger-ui .auth-wrapper .auth-container {
      border: 2px solid #10b981 !important;
      border-radius: 8px !important;
      background: rgba(16, 185, 129, 0.05) !important;
    }
    
    /* Enhanced operation styling */
    .swagger-ui .opblock {
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
      margin-bottom: 20px !important;
      border: 1px solid #e2e8f0 !important;
    }
    
    /* Improve text readability in operation headers */
    .swagger-ui .opblock .opblock-summary {
      padding: 15px 20px !important;
    }
    
    .swagger-ui .opblock .opblock-summary-method {
      font-weight: 700 !important;
      text-shadow: none !important;
    }
    
    .swagger-ui .opblock .opblock-summary-path {
      font-weight: 600 !important;
      color: #1f2937 !important;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-left: 4px solid #10b981 !important;
    }
    
    .swagger-ui .opblock.opblock-get {
      border-left: 4px solid #3b82f6 !important;
    }
    
    .swagger-ui .opblock.opblock-patch {
      border-left: 4px solid #f59e0b !important;
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-left: 4px solid #ef4444 !important;
    }
    
    /* Enhanced tag sections with better text visibility */
    .swagger-ui .opblock-tag {
      background: linear-gradient(145deg, #1f2937, #374151) !important;
      color: #ffffff !important;
      border-radius: 8px !important;
      padding: 15px 20px !important;
      margin-bottom: 15px !important;
      font-weight: 600 !important;
      font-size: 1.1rem !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    }
    
    .swagger-ui .opblock-tag a {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    
    .swagger-ui .opblock-tag small {
      color: #d1d5db !important;
      opacity: 0.9 !important;
    }
    
    /* Professional button styling */
    .swagger-ui .btn {
      border-radius: 6px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
    }
    
    .swagger-ui .btn.authorize {
      background: linear-gradient(145deg, #10b981, #059669) !important;
      border: none !important;
      color: white !important;
    }
    
    .swagger-ui .btn.try-out__btn {
      background: linear-gradient(145deg, #3b82f6, #2563eb) !important;
      border: none !important;
      color: white !important;
    }
    
    .swagger-ui .btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
    }
    
    /* Custom scrollbar */
    .swagger-ui ::-webkit-scrollbar {
      width: 8px;
    }
    
    .swagger-ui ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    .swagger-ui ::-webkit-scrollbar-thumb {
      background: linear-gradient(145deg, #64748b, #475569);
      border-radius: 4px;
    }
    
    /* Response examples styling */
    .swagger-ui .responses-inner .response .response-col_description {
      background: linear-gradient(145deg, #f8fafc, #f1f5f9) !important;
      border-radius: 6px !important;
      padding: 15px !important;
    }
    
    /* Add enterprise badge with better text visibility */
    body::before {
      content: "🚀 ENTERPRISE API v1.0";
      position: fixed;
      top: 0;
      right: 0;
      background: linear-gradient(145deg, #1f2937, #374151);
      color: #ffffff !important;
      padding: 8px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 9999;
      border-bottom-left-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
      letter-spacing: 0.5px !important;
    }
    
    /* Additional text contrast improvements */
    .swagger-ui .opblock-summary-description {
      color: #374151 !important;
      font-weight: 500 !important;
    }
    
    .swagger-ui .parameter__name {
      color: #1f2937 !important;
      font-weight: 600 !important;
    }
    
    .swagger-ui .parameter__type {
      color: #6b7280 !important;
    }
    
    /* Dark theme text fixes */
    .swagger-ui .model-box {
      background: #f9fafb !important;
      border: 1px solid #e5e7eb !important;
    }
    
    .swagger-ui .model .model-title {
      color: #1f2937 !important;
      font-weight: 600 !important;
    }
  `;

  // Enhanced Swagger setup options
  SwaggerModule.setup('api-docs', app, document, {
    customCss,
    customSiteTitle: 'EagerDevelopers API Documentation',
    customfavIcon: 'https://eagerdevelopers.com/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: false,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list', // 'list', 'full', 'none'
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
    },
  });
}

/**
 * Common Swagger response decorators for reuse across controllers
 */
export const SwaggerResponses = {
  // Success responses
  Created: { status: 201, description: 'Resource created successfully' },
  Ok: { status: 200, description: 'Operation successful' },
  NoContent: { status: 204, description: 'Operation successful, no content returned' },
  
  // Error responses
  BadRequest: { 
    status: 400, 
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be a valid email', 'password must be longer than 8 characters'],
        error: 'Bad Request',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/auth/register'
      }
    }
  },
  Unauthorized: {
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/auth/login'
      }
    }
  },
  Forbidden: {
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'Admin access required',
        error: 'Forbidden',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/users/admin-only'
      }
    }
  },
  NotFound: {
    status: 404,
    description: 'Resource not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/users/999'
      }
    }
  },
  Conflict: {
    status: 409,
    description: 'Conflict - Resource already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'A user with this email already exists',
        error: 'Conflict',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/auth/register'
      }
    }
  },
  TooManyRequests: {
    status: 429,
    description: 'Rate limit exceeded',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'ThrottlerException',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/auth/login'
      }
    }
  },
  InternalServerError: {
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/api/auth/login'
      }
    }
  }
} as const;