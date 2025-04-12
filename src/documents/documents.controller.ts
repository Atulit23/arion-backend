import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  UseGuards,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { DocumentDto, UpdateDto } from './dto/document.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // console.log(file);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const fileUrl = await this.documentsService.uploadFile(file);
    return { fileUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() documentDto: DocumentDto,
    @Res() res: Response,
  ) {
    try {
      console.log(file)
      return await this.documentsService.uploadDocument(documentDto, file, res);
    } catch (error) {
      console.error('Upload Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateProgress(@Body() updateDto: UpdateDto, @Res() res: Response) {
    return await this.documentsService.updateProgress(updateDto, res);
  }

  @Get('getDocumentsByUserId')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByUserId(
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    return await this.documentsService.getDocumentsByUserId(userId, res);
  }

  @Get('getDocumentsByDocuemntId')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByDocuemntId(
    @Query('docuemntId') dcuemntId: string,
    @Res() res: Response,
  ) {
    return await this.documentsService.getDocumentsByDocuemntId(dcuemntId, res);
  }

  @Get('getDocumentsForProgress')
  @UseGuards(JwtAuthGuard)
  async getDocumentsForProgress(
    @Query('userId') userId: string,
    @Query('documentId') documentId: string,
    @Res() res: Response,
  ) {
    return await this.documentsService.getDocumentsForProgress(
      userId,
      documentId,
      res,
    );
  }

  @Get('getPrivateDocumentsByUserId')
  @UseGuards(JwtAuthGuard)
  async getPrivateDocumentsById(
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    return await this.documentsService.getPrivateDocumentsByUserId(
      userId,
      res
    );
  }
}
