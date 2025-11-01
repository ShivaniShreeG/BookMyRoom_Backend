import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateLodgeOwnerDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

@Injectable()
export class RegisterService {
  async createLodgeWithOwner(dto: CreateLodgeOwnerDto) {
    const {
      lodge_id,
      lodge_name,
      lodge_phone,
      lodge_email,
      lodge_address,
      user_id,
      password,
      owner_name,
      owner_phone,
      owner_email,
      lodge_logo,
    } = dto;

    const logoBuffer = lodge_logo ? Buffer.from(lodge_logo, 'base64') : undefined;

    // ✅ Check if lodge_id or (name+address) already exists
    const existingLodge = await prisma.lodge.findFirst({
      where: {
        OR: [
          { lodge_id },
          { name: lodge_name, address: lodge_address },
        ],
      },
    });

    if (existingLodge) {
      throw new BadRequestException('Lodge already exists with same ID or name & address');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + 3);

      // ✅ Create Lodge
      const lodge = await tx.lodge.create({
        data: {
          lodge_id, // since you are providing it manually
          name: lodge_name,
          phone: lodge_phone,
          email: lodge_email,
          address: lodge_address,
          logo: logoBuffer,
          duedate: dueDate,
        },
      });

      // ✅ Create User
      const user = await tx.user.create({
        data: {
          user_id,
          lodge_id: lodge.lodge_id,
          password: hashedPassword,
          is_active: true,
          role: 'ADMIN',
        },
      });

      // ✅ Create Admin (Owner)
      const admin = await tx.admin.create({
        data: {
          lodge_id: lodge.lodge_id,
          user_id: user.user_id,
          name: owner_name,
          phone: owner_phone,
          email: owner_email,
          designation: 'Owner',
        },
      });

      return {
        message: 'Lodge and Owner created successfully',
        lodge,
        user,
        admin,
      };
    });
  }

  async findLodgeById(lodge_id: number) {
    return prisma.lodge.findUnique({ where: { lodge_id } });
  }
}
