import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfig } from '@/db/typeorm.config';
import { RedisModule } from '@/common/redis/redis.module';
import { EmailModule } from '@/common/email/email.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/clients/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...getTypeOrmConfig(),
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
    EmailModule,
    UserModule,
    AuthModule,
    ClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
