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

  // --- ENABLE DYNAMIC CORS ---
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
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