import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { ConflictError, UnauthorizedError } from '../../common/AppError';
import { signToken } from './jwt';
import { LoginInput, RegisterInput } from './auth.schemas';

const SALT_ROUNDS = 10; // cost factor used when hashing the password

export interface AuthResult {
  token: string;
  user: { id: string; email: string };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash the password before storing it; bcrypt generates and embeds the salt.
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash },
  });

  // Generate a JWT containing the authenticated user's identity.
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email } };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Compare the supplied password against the stored bcrypt hash.
  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate a JWT after successfully authenticating the user.
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email } };
}
