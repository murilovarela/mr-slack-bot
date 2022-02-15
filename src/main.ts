import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  };

  app.use(urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(json({ verify: rawBodyBuffer }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
