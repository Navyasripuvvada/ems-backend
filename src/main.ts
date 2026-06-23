import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ensureCloudinaryConfigured } from './commom/config/cloudinary';

async function bootstrap() {
  const port = process.env.PORT || 3000;
   const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );
  
  // Initialize Cloudinary after environment variables are loaded
  ensureCloudinaryConfigured();
  
  app.enableCors({
    origin:["http://localhost:3000",  "https://ems-frontend-azure.vercel.app"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted: true,

      transform: true,
    })
  )
   app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  await app.listen(port);
  console.log(`Server is running on port http://localhost:${port}`);
}
bootstrap();
