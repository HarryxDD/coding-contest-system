import { RolesGuard } from "@/roles/roles.guard";
import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { RoleEnum } from "@/roles/roles.enum";
import { Roles } from "@/roles/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { InfinityPaginationResponseDto } from "@/utils/dto/infinity-pagination-response.dto";
import { User } from "./domain/user";
import { infinityPagination } from "@/utils/infinity-pagination";

@ApiBearerAuth() // Require token
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Useres')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(RoleEnum.ADMIN)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto)
    }

    // @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
    // @Get()
    // findAll() {
    //     return this.usersService.findAll()
    // }

    @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
    @Get()
    async findAll(@Query() queryDto: QueryUserDto): Promise<InfinityPaginationResponseDto<User>> {
        const page = queryDto?.page ?? 1;
        let limit = queryDto?.limit ?? 10;
        if (limit > 50) {
            limit = 50;
        }

        const data = await this.usersService.findManyWithPagination({
            ...queryDto,
        })

        return infinityPagination(data, { page, limit })
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateUserDto, @Request() req) {
        if (req.user.role !== RoleEnum.ADMIN && req.user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return this.usersService.update(id, updateDto);
    }

    @Roles(RoleEnum.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}