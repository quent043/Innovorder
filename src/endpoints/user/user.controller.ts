import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards
} from '@nestjs/common';
import {JwtGuard} from "../auth/guard";
import {GetUser} from "./decorator";
import {User} from "@prisma/client";
import {UserService} from "./user.service";
import {UpdatedUserDto, EditUserDto} from "./dto";

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService
    ) {}

    @Get('/me')
    getMe(@GetUser() user: User): { user: User } {
        return {
            user: user
        }
    }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.findUser(id);
    }

    @Patch(':id')
    editUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() user: EditUserDto
    ): Promise<UpdatedUserDto> {
        return this.userService.updateUser(id, user);
    }
}
