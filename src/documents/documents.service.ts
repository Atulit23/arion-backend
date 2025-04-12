import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Documents } from './schemas/documents.schema';
import { Model } from 'mongoose';
import { PrivateDocuments } from './schemas/privatedocs.schema';
import { Auth } from 'src/auth/auth.schema';
import { DocumentDto, UpdateDto } from './dto/document.dto';
import { Response } from 'express';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import * as fs from "fs";
import * as FormData from "form-data";

@Injectable()
export class DocumentsService {
  private storage: Storage;
  private bucket: string;
  constructor(
    @InjectModel(Documents.name) private docuModel: Model<Documents>,
    @InjectModel(PrivateDocuments.name)
    private privateDocModel: Model<PrivateDocuments>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
  ) {
    this.storage = new Storage({
      keyFilename: path.join(process.cwd(), 'arion-d7a6c-0ffa975ce068.json'),
      projectId: 'arion-d7a6c',
    });

    this.bucket = 'arion-d7a6c.firebasestorage.app';
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    console.log(file);
    try {
      const fileName =
        crypto.randomUUID() + file.originalname.replaceAll(' ', '');
      const bucket = this.storage.bucket(this.bucket);
      const blob = bucket.file(fileName);

      const stream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          reject(err);
        });

        stream.on('finish', () => {
          // Make the file public (optional)
          blob.makePublic().then(() => {
            resolve(
              `https://storage.googleapis.com/${this.bucket}/${blob.name}`,
            );
          });
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // future has come, in case this gets big, comment below what was orginally written in place of this comment

  async getFileData(file: any, name: string) {
    console.log("File Object:", file);
    const fileName = crypto.randomUUID() + file.originalname.replaceAll(' ', '');

    let formData = new FormData();
    formData.append("file", file.buffer, fileName);  
    formData.append("name", name);

    try {
        const res = await axios.post("http://127.0.0.1:8001/generate/get-data", formData, {
            headers: formData.getHeaders(), // Use correct headers for multipart/form-data
        });
        return {
            quizDocumentUrl: res.data.quizDocumentUrl,
            levelDocumentUrl: res.data.levelDocumentUrl,
            numMaxQuizScore: res.data.numMaxQuizScore,
            numMaxLevels: res.data.numMaxLevels
        };
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
    }

    return {
        quizDocumentUrl: "",
        levelDocumentUrl: "",
        numMaxQuizScore: "",
        numMaxLevels: "",
    };
}

  async uploadDocument(
    documentDto: DocumentDto,
    file: any,
    res: Response,
  ): Promise<any> {
    const { userId, type, name } = documentDto;
    const user = await this.authModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    if (user.uploadedDocumentsCount >= user.maxUploadAllowed + 10) {
      return res.status(400).json({
        message:
          'You have reached the maximum number of documents you can upload',
      });
    }

    const { quizDocumentUrl, levelDocumentUrl, numMaxQuizScore, numMaxLevels } =
      await this.getFileData(file, name);

    // store documents in docuModel
    const doc = await this.docuModel.create({
      userId,
      title: name,
      type,
      levelDocumentUrl,
      quizDocumentUrl,
      numMaxLevels,
      numMaxQuizScore: numMaxQuizScore,
    });

    // store this data the privateDocModel
    const privateDoc = await this.privateDocModel.create({
      userId,
      documentId: doc._id,
      numMaxQuizScore: numMaxQuizScore,
      levelDocumentUrl,
      quizDocumentUrl,
      type,
      title: name,
      numMaxLevels
    });

    // update the authSchema for uploadedDocumentsCount, savedDocs
    user.uploadedDocumentsCount += 1;
    user.savedDocs.push(doc._id);

    await user.save();
    return res.status(200).json({ privateDoc });
  }

  async updateProgress(updateDto: UpdateDto, res: Response) {
    const {
      id,
      levelsCompleted,
      quizTaken,
      quizResults,
      numQuizScore,
    } = updateDto;

    const doc = await this.privateDocModel.findOne({
      _id: id,
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.levelsCompleted = levelsCompleted || doc.levelsCompleted;
    doc.quizTaken = quizTaken || doc.quizTaken;
    doc.quizResults = quizResults || doc.quizResults;
    doc.numQuizScore = numQuizScore || doc.numQuizScore;
    await doc.save();

    return res
      .status(200)
      .json({ message: 'Progress updated successfully', document: doc });
  }

  async getDocumentsByUserId(userId: string, res: Response) {
    const documents = await this.docuModel.find({ userId });

    if (!documents.length) {
      return res.status(404).json({ message: 'No documents found' });
    }

    return res.status(200).json({ documents });
  }

  async getDocumentsByDocuemntId(docuemntId: string, res: Response) {
    const documents = await this.docuModel.find({ docuemntId });

    if (!documents.length) {
      return res.status(404).json({ message: 'No documents found' });
    }

    return res.status(200).json({ documents });
  }

  async getDocumentsForProgress(
    userId: string,
    documentId: string,
    res: Response,
  ) {
    const documents = await this.privateDocModel.find({ userId, documentId });

    if (!documents.length) {
      return res.status(404).json({ message: 'No documents found' });
    }

    return res.status(200).json({ documents });
  }

  async getPrivateDocumentsByUserId(
    userId: string,
    res: Response,
  ) {
    const documents = await this.privateDocModel.find({ userId });

    // if (!documents.length) {
    //   return res.status(400).json({ message: 'No documents found' });
    // }

    return res.status(200).json({ documents });
  }
}
