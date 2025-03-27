import { ConflictException, Injectable } from '@nestjs/common';
import { Auth } from './auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { signupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string) {
    password = await bcrypt.hash(password, 10);
    return password;
  }

  async comparePassword(
    plainPassword: string,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, password);
  }

  private async generateToken(user: Auth) {
    return this.jwtService.signAsync(
      { id: user._id, email: user.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
  }

  async signup(signupDto: signupDto, res: Response): Promise<any> {
    const { email, username, password } = signupDto;
    const newPassword: string = await this.hashPassword(password);
    console.log(newPassword);
    const existing = await this.authModel.findOne({ email: email });
    const existingUserName = await this.authModel.findOne({
      username: username,
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    if (existingUserName) {
      throw new ConflictException('Username already in use');
    }

    const newUser = new this.authModel({
      email: email,
      password: newPassword.toString(),
      username: username,
    });

    await newUser.save();
    const token = await this.generateToken(newUser);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.json({ message: 'Signup successful', token, newUser });
  }

  async login(loginDto: signupDto, res: Response): Promise<any> {
    const { email, username, password } = loginDto;

    const user = await this.authModel.findOne({ email: email });
    const existingUserName = await this.authModel.findOne({
      username: username,
    });
    if (!user && !existingUserName) {
          return res.status(400).json({ message: 'Invalid Credentials', });
    }
      if (user) {
        if ((await this.comparePassword(password, user.password)) === true) {
          const token = await this.generateToken(user);
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          return res.json({ message: 'Signup successful', token, user });
        } else {
          return res.status(400).json({ message: 'Invalid Credentials' });
        }
      } else if (existingUserName) {
        if (
          (await this.comparePassword(password, existingUserName.password)) ===
          true
        ) {
          const token = await this.generateToken(existingUserName);
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          return res.json({
            message: 'Signup successful',
            token,
            existingUserName,
          });
        } else {
          return res.status(400).json({ message: 'Invalid Credentials' });
        }
      }
    return null;
  }
}
