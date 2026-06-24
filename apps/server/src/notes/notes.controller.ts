import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('search')
  async search(@Query('q') query = '') {
    const data = await this.notesService.search(query);
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
