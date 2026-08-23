const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setAdmin() {
  const email = 'dynastore2-904758-39q457@gmai.com';
  const rawPass = 'dynastore39w8537q458974';
  const hashedPassword = await bcrypt.hash(rawPass, 10);

  // Check if admin user exists
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'DYNA STORE Super Admin',
        emailVerified: true
      }
    });
    console.log(`✅ Updated existing admin password for ${email}`);
  } else {
    const admin = await prisma.user.create({
      data: {
        name: 'DYNA STORE Super Admin',
        email: email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: true,
        avatar: '/logo.png',
        wallet: {
          create: { balance: 9999.00, currency: 'USD' }
        }
      }
    });
    console.log(`✅ Created new Super Admin user: ${admin.email}`);
  }

  // Also update old admin if exists to also have role SUPER_ADMIN or synchronize
  const oldAdmin = await prisma.user.findUnique({ where: { email: 'admin@kvcinema.com' } });
  if (oldAdmin) {
    await prisma.user.update({
      where: { email: 'admin@kvcinema.com' },
      data: { password: hashedPassword }
    });
  }

  console.log('🎉 Super Admin Credentials Set Successfully!');
}

setAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
