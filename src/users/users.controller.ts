import { RolesGuard } from "@/roles/roles.guard";
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { RoleEnum } from "@/roles/roles.enum";
import { Roles } from "@/roles/roles.decorator";
import { JwtOrPatAuthGuard } from "@/auth/jwt-or-pat-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { InfinityPaginationResponseDto } from "@/utils/dto/infinity-pagination-response.dto";
import { User } from "./domain/user";
import { infinityPagination } from "@/utils/infinity-pagination";

@ApiBearerAuth() // Require token
@UseGuards(JwtOrPatAuthGuard, RolesGuard)
@ApiTags('Useres')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * creates a new user
     * @param createUserDto - the user details to create
     * @returns the created user
     */
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

    /**
     * returns paginated users
     * @param queryDto - the pagination and filter options
     * @returns the paginated user list
     */
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

    /**
     * returns a user by id
     * @param id - the user id
     * @returns the matching user
     */
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    /**
     * updates a user profile
     * @param id - the user id
     * @param updateDto - the fields to update
     * @param req - the authenticated request
     * @returns the updated user
     * @throws ForbiddenException - when a non-admin tries to update another user's profile
     */
    @Patch(':id')
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateUserDto, @Request() req) {
        if (req.user.role !== RoleEnum.ADMIN && req.user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return this.usersService.update(id, updateDto);
    }

    /**
     * removes a user by id
     * @param id - the user id
     * @returns nothing
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }
}


