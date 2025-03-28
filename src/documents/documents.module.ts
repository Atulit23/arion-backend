import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Documents, DocumentsSchema } from './schemas/documents.schema';
import { DocumentsController } from './documents.controller';
import { PrivateDocuments, PrivateDocumentsSchema } from './schemas/privatedocs.schema';
import { DocumentsService } from './documents.service';
import { Auth, AuthSchema } from 'src/auth/auth.schema';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Documents.name, schema: DocumentsSchema },
      { name: PrivateDocuments.name, schema: PrivateDocumentsSchema }, 
      { name: Auth.name, schema: AuthSchema }, 
    ]),
    PassportModule,
    AuthModule, 
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
