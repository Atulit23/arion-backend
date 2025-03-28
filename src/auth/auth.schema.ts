import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema()
export class Auth extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'free' })
  plan: string; // free, paid or whatev

  @Prop({ required: true, default: 0 })
  uploadedDocumentsCount: number;

  @Prop({ required: true, default: 5 }) // for free tier
  maxUploadAllowed: number;

  @Prop({default: []})
  savedDocs: Array<any>; // doc ids of which user will save or upload

  // @Prop({default: []})
  // progress: Array<object>; // will define it

  @Prop({ required: false })
  otp: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
