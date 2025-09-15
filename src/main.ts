// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // <-- Get instance of ConfigService



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