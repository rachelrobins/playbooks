import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../common/AppError';
import { Action, Trigger } from '../../common/domain';
import { CreatePlaybookInput } from './playbooks.schemas';
import { PlaybookDto } from './playbooks.types';

// Converts the database representation into the API response format.
function toDto(playbook: {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  createdAt: Date;
}): PlaybookDto {
  return {
    id: playbook.id,
    name: playbook.name,
    trigger: playbook.trigger as Trigger,
    actions: JSON.parse(playbook.actions) as Action[],
    createdAt: playbook.createdAt.toISOString(),
  };
}

export async function listPlaybooks(userId: string): Promise<PlaybookDto[]> {
  const playbooks = await prisma.playbook.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return playbooks.map(toDto);
}

export async function createPlaybook(
  userId: string,
  input: CreatePlaybookInput,
): Promise<PlaybookDto> {
  const playbook = await prisma.playbook.create({
    data: {
      name: input.name,
      trigger: input.trigger,
      actions: JSON.stringify(input.actions),
      userId,
    },
  });
  return toDto(playbook);
}

export async function deletePlaybook(userId: string, playbookId: string): Promise<void> {
  const playbook = await prisma.playbook.findUnique({ where: { id: playbookId } });
  if (!playbook || playbook.userId !== userId) {
    throw new NotFoundError('Playbook not found');
  }

  await prisma.playbook.delete({ where: { id: playbookId } });
}
