import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentsDocument = Documents & Document;

@Schema()
export class Documents extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true }) // filename
  title: string;

  @Prop({ required: true })
  type: string // blog, text, research paper, book

  @Prop({ required: true })
  numMaxQuizScore: number

  @Prop({ required: true })
  levelDocumentUrl: string; // the json file where documents get dumped 

  @Prop({ required: true })
  quizDocumentUrl: string; // the json file where documents get dumped 

  @Prop({ required: true })
  numMaxLevels: number
}

export const DocumentsSchema = SchemaFactory.createForClass(Documents);
