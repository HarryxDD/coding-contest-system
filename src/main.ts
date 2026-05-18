import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('Coding Contest System API')
    .setDescription(
      `A comprehensive REST API for managing coding contests and hackathons.

This system handles user authentication, contest management, team formation, project submissions, judge assignments, scoring criteria, and score recording. The API supports both JWT Bearer tokens and Personal Access Tokens (PAT) for authentication, allowing flexible integration with external tools and applications.

Key features:
- User authentication and authorization with JWT and Personal Access Tokens
- Contest and hackathon management
- Team formation and member management
- Project submission handling and tracking
- Judge assignment and management
- Scoring criteria definition and scoring
- Role-based access control

This API is part of the Programmable Web Project (PWP) course at the University of Oulu.`,
    )
    .setVersion('1.0.0')
    .setContact('PWP Course Team (Spring 2026)', 'pwp-course@lists.oulu.fi', 'https://www.oulu.fi/en')
    .addServer('http://86.50.21.210', 'production server')
    .addServer('http://localhost:3000', 'local development')
    .setLicense('GNU General Public License v3.0', 'https://github.com/ivanmilara/PWP/blob/master/LICENSE')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token (Bearer) or Personal Access Token',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();