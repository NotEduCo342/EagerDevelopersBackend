// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; // <-- Import Helmet
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // <-- Get instance of ConfigService

  // 🛡️ ADD HELMET SECURITY HEADERS
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"], // For API calls
        fontSrc: ["'self'", "https:", "data:"], // Web fonts
      },
    },
    crossOriginEmbedderPolicy: false, // For API usage
  }));

  app.useGlobalPipes(new ValidationPipe());
  
  // Set global API prefix
  app.setGlobalPrefix('api');

  // --- PRODUCTION-AWARE CORS CONFIGURATION ---
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  app.enableCors({
    origin: isProduction 
      ? [
          'https://eagerdevelopers.ir',           // Your frontend domain
          'https://www.eagerdevelopers.ir',       // Frontend with www
          'https://api.eagerdevelopers.ir',       // API domain (for testing)
          configService.get<string>('CORS_ORIGIN')
        ].filter(Boolean)
      : [
          'http://localhost:5173',                // Vite dev server
          'http://localhost:5174',                // Alternative Vite port
          'http://localhost:3000',                // React dev server
          'http://127.0.0.1:5173',               // Alternative localhost
          configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173'
        ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // --- CONDITIONAL SWAGGER (Only in development) ---
  if (!isProduction) {
    setupSwagger(app);
    console.log('📚 Swagger UI available at: http://localhost:3000/api/docs');
  } else {
    console.log('🔒 Swagger disabled in production for security');
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server running on port ${port} in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
}
bootstrap();