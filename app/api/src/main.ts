import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { loadProjectEnv } from './common/config/load-env';
import { AppModule } from './app.module';

async function bootstrap() {
  loadProjectEnv();
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
