// this is for just one particular document
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PrivateDocument = PrivateDocuments & Document;

// gs://arion-d7a6c.firebasestorage.app

@Schema()
export class PrivateDocuments extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  creatorUserId: string;

  @Prop({ required: true })
  documentId: string;

  @Prop({ required: false, default: [] })
  levelsCompleted: Array<number>; // number of levels in the document

  @Prop({ required: false, default: false})
  quizTaken: boolean; // whether the quiz has been taken or not

  @Prop({ required: false, default: [] })
  quizResults: Array<object>; // array of objects containing the quiz results

  @Prop({ required: true })
  numMaxQuizScore: number

  @Prop({ required: true })
  numMaxLevels: number

  @Prop({ required: false, default: 0 })
  numQuizScore: number

  @Prop({ required: true })
  title: string;  

  @Prop({ required: true })
  levelDocumentUrl: string; // the json file where documents get dumped 

  @Prop({ required: true })
  quizDocumentUrl: string; // the json file where documents get dumped 

  @Prop({ required: true })
  type: string // blog, text, research paper, book
}

export const PrivateDocumentsSchema = SchemaFactory.createForClass(PrivateDocuments);
