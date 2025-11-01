import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from './dto/create-user.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  // 🔹 Get all active admins in a lodge
  async getAdminsByLodge(lodgeId: number) {
    const admins = await prisma.admin.findMany({
      where: {
        lodge_id: Number(lodgeId),
        user: { is_active: true },
      },
      include: {
        user: {
          select: { user_id: true, lodge_id: true, role: true, is_active: true },
        },
      },
    });

    return admins.map(a => ({
      user_id: a.user_id,
      designation: a.designation,
      name: a.name,
      phone: a.phone,
      email: a.email,
    }));
  }

  // 🔹 Soft delete admin
  async deleteAdmin(lodgeId: number, userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
    });

    if (!user)
      throw new NotFoundException(`User ${userId} not found in lodge ${lodgeId}`);

    await prisma.user.update({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      data: { is_active: false },
    });

    return { message: `User ${userId} deactivated successfully` };
  }

  // 🔹 Get user with lodge + admin data
  async getUserWithAdmin(lodgeId: number, userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      include: { lodge: true, admin: true },
    });

    if (!user)
      throw new NotFoundException(`User ${userId} not found for lodge ${lodgeId}`);

    let logoBase64: string | null = null;
    if (user.lodge?.logo) {
      const buf =
        user.lodge.logo instanceof Buffer
          ? user.lodge.logo
          : Buffer.from(Object.values(user.lodge.logo));
      logoBase64 = buf.toString('base64');
    }

    return {
      user_id: user.user_id,
      lodge_id: user.lodge_id,
      role: user.role,
      is_active: user.is_active,
      lodge: {
        lodge_id: user.lodge.lodge_id,
        name: user.lodge.name,
        is_active: user.lodge.is_active,
        logo: logoBase64,
      },
      admin: user.admin
        ? {
            designation: user.admin.designation,
            name: user.admin.name,
            phone: user.admin.phone,
            email: user.admin.email,
          }
        : null,
    };
  }

  // 🔹 Add admin + user together
  async addAdmin(dto: CreateUserDto) {
    const lodge = await prisma.lodge.findUnique({ where: { lodge_id: dto.lodge_id } });
    if (!lodge)
      throw new NotFoundException(`Lodge with ID ${dto.lodge_id} not found`);

    const existing = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: dto.user_id, lodge_id: dto.lodge_id } },
    });
    if (existing)
      throw new ForbiddenException(`User ${dto.user_id} already exists`);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const [newUser, newAdmin] = await prisma.$transaction([
      prisma.user.create({
        data: {
          user_id: dto.user_id,
          lodge_id: dto.lodge_id,
          password: hashedPassword,
          role: Role.ADMIN,
          is_active: dto.is_active ?? true,
        },
      }),
      prisma.admin.create({
        data: {
          user_id: dto.user_id,
          lodge_id: dto.lodge_id,
          designation: dto.designation,
          name: dto.name ?? '',
          phone: dto.phone ?? '',
          email: dto.email ?? '',
        },
      }),
    ]);

    return { message: 'Admin created successfully', user: newUser, admin: newAdmin };
  }

  // 🔹 Fetch all users in a lodge
  async findAllByLodge(lodgeId: number) {
    const users = await prisma.user.findMany({
      where: { lodge_id: lodgeId },
      select: { user_id: true, lodge_id: true, role: true, is_active: true },
    });

    if (!users.length)
      throw new NotFoundException(`No users found for lodge ${lodgeId}`);
    return users;
  }

  // 🔹 Get user with lodge info
  async findOneByLodge(lodgeId: number, userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      include: { lodge: { include: { blocks: true } } },
    });

    if (!user)
      throw new NotFoundException(`User ${userId} not found in lodge ${lodgeId}`);

    let blockReason = '';
    if (!user.lodge.is_active)
      blockReason =
        user.lodge.blocks.length > 0
          ? user.lodge.blocks[0].reason
          : 'Lodge is inactive';

    return {
      user_id: user.user_id,
      lodge_id: user.lodge_id,
      role: user.role,
      is_active: user.is_active,
      lodge: {
        lodge_id: user.lodge.lodge_id,
        name: user.lodge.name,
        is_active: user.lodge.is_active,
        blockReason,
      },
    };
  }

  // 🔹 Login
  async login(lodgeId: number, userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      include: { lodge: { include: { blocks: true } } },
    });

    if (!user) return { success: false, message: 'User not found' };

    if (!user.lodge.is_active)
      return {
        success: false,
        message:
          user.lodge.blocks[0]?.reason || 'Lodge access denied - inactive lodge',
      };

    if (!user.is_active)
      return { success: false, message: 'User account inactive' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { success: false, message: 'Invalid password' };

    if (![Role.ADMIN, Role.ADMINISTRATOR].includes(user.role))
      return { success: false, message: 'Access denied' };

    return {
      success: true,
      message: 'Login successful',
      user: { lodgeId: user.lodge_id, userId: user.user_id, role: user.role },
    };
  }

  // 🔹 Change password
  async changePassword(lodgeId: number, userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      select: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(oldPass, user.password);
    if (!match) throw new ForbiddenException('Old password incorrect');

    const hashed = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  // 🔹 Send OTP via email
  async sendOtp(lodgeId: number, userId: string, otp: string) {
    const admin = await prisma.admin.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
    });

    if (!admin?.email)
      throw new NotFoundException({ message: 'Email not found' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Noreply.ramchintech@gmail.com',
        pass: 'zkvb rmyu yqtm ipgv', // 🔒 app password
      },
    });

    await transporter.sendMail({
      from: 'Noreply.ramchintech@gmail.com',
      to: admin.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });

    return { status: 'success', message: 'OTP sent successfully' };
  }

  // 🔹 Update password after OTP
  async updatePassword(lodgeId: number, userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
    });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { user_id_lodge_id: { user_id: userId, lodge_id: lodgeId } },
      data: { password: hashed },
    });

    return { status: 'success', message: 'Password updated successfully' };
  }
}
