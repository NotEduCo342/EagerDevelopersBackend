// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; // <-- Import Helmet

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

  // --- ENABLE DYNAMIC CORS FOR MULTIPLE PORTS ---
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173'
    ].filter(Boolean), // Remove any null/undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger config remains the same...
  const config = new DocumentBuilder()
    .setTitle('EagerDevelopers API')
    .setDescription('The official API for the EagerDevelopers portfolio and blog.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();