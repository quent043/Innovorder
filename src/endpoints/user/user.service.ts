import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from "../../core/prisma/prisma.service";
import {User} from "@prisma/client";
import {AuthService} from "../auth/auth.service";
import {UpdatedUserDto, EditUserDto} from "./dto";
import {NON_EXISTING_USER_ERROR_MESSAGE} from "../../core/exceptions/error-messages";

@Injectable()
export class UserService {

    constructor(
        private prisma: PrismaService,
        private authService: AuthService
    ) {}


    async findUser(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where : {
                id: id
            }
        });

        if(!user)
            throw new ForbiddenException(NON_EXISTING_USER_ERROR_MESSAGE);

        delete user.password;
        return user;
    }


    async updateUser(id: number, data: EditUserDto): Promise<UpdatedUserDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if(!user)
            throw new ForbiddenException(NON_EXISTING_USER_ERROR_MESSAGE);

        let updatedUser: User = await this.prisma.user.update({
            where:{
                id: id
            },
            data: {
                password: data.password,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            }
        });
        const updatedToken: {access_token: string} = await this.authService.signToken(updatedUser.id, updatedUser.email);

        return new UpdatedUserDto(updatedUser.id, updatedUser.email, updatedUser.firstName, updatedUser.lastName, updatedToken.access_token);
    }
}
