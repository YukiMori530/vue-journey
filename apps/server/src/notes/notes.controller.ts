import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Public()
  @Get('feed/explore')
  async exploreFeed() {
    const data = await this.notesService.getExploreFeed();
    return { data, message: 'ok' };
  }

  @Public()
  @Get('city/:destination')
  async cityGuides(@Param('destination') destination: string) {
    const data = await this.notesService.findByDestination(decodeURIComponent(destination));
    return { data, message: 'ok' };
  }

  @Get('search')
  async search(
    @Query('q') query = '',
    @Query('destination') destination?: string,
  ) {
    const data = await this.notesService.search(query, { destination });
    return { data, message: 'ok' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const note = await this.notesService.findById(id);
    if (!note) {
      throw new NotFoundException('笔记不存在');
    }
    return { data: note, message: 'ok' };
  }
}
