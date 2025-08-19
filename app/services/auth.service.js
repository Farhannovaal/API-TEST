const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role || 'guest' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(input) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, role: 'guest', passwordHash }, // pastikan field `passwordHash` sesuai schema.prisma
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  const token = signToken(user);
  return { user, token };
}

async function login(input) {
  const row = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, role: true, passwordHash: true, createdAt: true, updatedAt: true },
  });
  if (!row || !row.passwordHash) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(input.password, row.passwordHash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const { passwordHash, ...user } = row;
  const token = signToken(user);
  return { user, token };
}

module.exports = { register, login };
