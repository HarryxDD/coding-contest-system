import { RolesGuard } from "@/roles/roles.guard";
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
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
@ApiTags('Users')
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
    @ApiOperation({ summary: 'create a user' })
    @ApiBody({
        schema: {
            example: {
                username: 'organizer_one',
                email: 'organizer@example.com',
                password: 'secret123',
                role: 'organizer',
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'user created successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'organizer_one',
                email: 'organizer@example.com',
                role: 'organizer',
                profilePic: null,
                createdAt: '2026-01-10T10:00:00.000Z',
                updatedAt: '2026-01-10T10:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid user payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, admin role required' })
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
    @ApiOperation({ summary: 'list users' })
    @ApiResponse({
        status: 200,
        description: 'returns paginated users',
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        username: 'organizer_one',
                        email: 'organizer@example.com',
                        role: 'organizer',
                        profilePic: null,
                        createdAt: '2026-01-10T10:00:00.000Z',
                        updatedAt: '2026-01-10T10:00:00.000Z',
                    },
                ],
                page: 1,
                totalItems: 1,
            },
        },
    })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, admin or organizer role required' })
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
    @ApiOperation({ summary: 'get a user by id' })
    @ApiParam({ name: 'id', type: String, description: 'user uuid' })
    @ApiResponse({
        status: 200,
        description: 'returns the user',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'organizer_one',
                email: 'organizer@example.com',
                role: 'organizer',
                profilePic: null,
                createdAt: '2026-01-10T10:00:00.000Z',
                updatedAt: '2026-01-10T10:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 404, description: 'user not found' })
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
    @ApiOperation({ summary: 'update a user by id' })
    @ApiParam({ name: 'id', type: String, description: 'user uuid' })
    @ApiBody({
        schema: {
            example: {
                username: 'organizer_renamed',
                email: 'organizer.updated@example.com',
                password: 'secret456',
                role: 'organizer',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'user updated successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'organizer_renamed',
                email: 'organizer.updated@example.com',
                role: 'organizer',
                profilePic: null,
                createdAt: '2026-01-10T10:00:00.000Z',
                updatedAt: '2026-01-11T10:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid or update payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, you can only update your own profile' })
    @ApiResponse({ status: 404, description: 'user not found' })
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
    @ApiOperation({ summary: 'delete a user by id' })
    @ApiParam({ name: 'id', type: String, description: 'user uuid' })
    @ApiResponse({ status: 204, description: 'user deleted successfully' })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }
}


