import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from "../../core/prisma/prisma.service";
import {AuthDto, LogInDto} from "./dto";
import * as argon from "argon2";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {BAD_CREDENTIALS_ERROR_MESSAGE} from "../../core/exceptions/error-messages";
import {User} from "@prisma/client";


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async signUp(dto: AuthDto): Promise<{ access_token: string }> {
        const hash = await argon.hash(dto.password);

            const user: {id: number, email: string} = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName
                },
                select: {
                    id: true,
                    email: true
                }
            })

            return this.signToken(user.id, user.email);
    }

    async logIn(dto: LogInDto): Promise<{ access_token: string }> {
        const user: User = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user)
            throw new ForbiddenException(BAD_CREDENTIALS_ERROR_MESSAGE);

        const pwdMatches: boolean = await argon.verify(user.password, dto.password);

        if (!pwdMatches)
            throw new ForbiddenException(BAD_CREDENTIALS_ERROR_MESSAGE);

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload: {sub: number, email: string} = {
            sub: userId,
            email
        }
        const token: string = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_KEY')
        });

        return {access_token: token};
    }
}
