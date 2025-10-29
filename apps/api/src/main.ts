import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(cors, {
    origin: ['https://chord-line-web.vercel.app', 'http://localhost:3000'],
    allowedHeaders: ['Authorization','Content-Type'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('ChordLine API')
    .setDescription('REST API for ChordLine')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  require('dotenv').config();

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
