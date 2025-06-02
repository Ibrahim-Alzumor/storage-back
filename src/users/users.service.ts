import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({ ...dto, password: hashed });
    const user = await created.save();
    const { password, ...rest } = user.toObject();
    return rest;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async search(term: string): Promise<UserDocument[]> {
    const regex = new RegExp(term, 'i');
    return this.userModel
      .find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { jobTitle: regex },
        ],
      })
      .exec();
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return user.save();
  }

  async disable(email: string): Promise<UserDocument> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    user.active = false;
    return user.save();
  }
}
