import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ember =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a00"/><stop offset="1" stop-color="#120800"/></linearGradient></defs><rect width="1200" height="720" fill="#050505"/><rect width="1200" height="720" fill="url(#g)" opacity="0.75"/><circle cx="220" cy="180" r="90" fill="#ffaa00" opacity="0.35"/></svg>`,
  )

const amber =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#120800"/><path d="M0 520 C 220 420 420 620 640 500 C 860 380 1020 540 1200 430 L1200 720 L0 720 Z" fill="#ff7a00" opacity="0.55"/><path d="M0 580 C 300 500 500 640 780 540 C 980 470 1100 560 1200 500 L1200 720 L0 720 Z" fill="#ffaa00" opacity="0.28"/></svg>`,
  )

async function main() {
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const david = await prisma.user.create({
    data: {
      handle: 'david',
      email: 'david@fio.dev',
      name: 'David Arsénio Martins',
      bio: 'Fotojornalismo e código. O fio entre as duas coisas.',
      bioEn: 'Photojournalism and code. The thread between both.',
      hue: 'ember',
    },
  })
  const ines = await prisma.user.create({
    data: {
      handle: 'ines',
      email: 'ines@fio.dev',
      name: 'Inês Costa',
      bio: 'Escrevo pouco. Publico quando o enquadramento está certo.',
      bioEn: 'I write little. I post when the frame is right.',
      hue: 'amber',
    },
  })
  const nuno = await prisma.user.create({
    data: {
      handle: 'nuno',
      email: 'nuno@fio.dev',
      name: 'Nuno Ribeiro',
      bio: 'Cascais, noite, laranja no ecrã.',
      bioEn: 'Cascais, night, orange on the screen.',
      hue: 'paper',
    },
  })

  await prisma.follow.createMany({
    data: [
      { followerId: david.id, followingId: ines.id },
      { followerId: ines.id, followingId: david.id },
      { followerId: ines.id, followingId: nuno.id },
      { followerId: nuno.id, followingId: david.id },
    ],
  })

  const first = await prisma.post.create({
    data: {
      authorId: david.id,
      body: 'FIO é uma linha fina: um texto, uma imagem, e quem decide seguir.',
      imageUrl: ember,
    },
  })
  const second = await prisma.post.create({
    data: {
      authorId: ines.id,
      body: 'O feed dos seguidos não é o mundo inteiro. É a sala que escolheste.',
      imageUrl: amber,
    },
  })
  const third = await prisma.post.create({
    data: {
      authorId: nuno.id,
      body: 'Repost quando a frase já está feita. Comentário quando ainda falta uma nota.',
    },
  })

  await prisma.post.create({
    data: { authorId: david.id, body: '', repostOfId: second.id },
  })

  await prisma.like.createMany({
    data: [
      { userId: ines.id, postId: first.id },
      { userId: nuno.id, postId: first.id },
      { userId: david.id, postId: second.id },
    ],
  })

  await prisma.comment.createMany({
    data: [
      { userId: ines.id, postId: first.id, body: 'A linha está certa.' },
      { userId: david.id, postId: second.id, body: 'É exactamente isto.' },
      { userId: nuno.id, postId: third.id, body: 'Fica no fio.' },
    ],
  })

  await prisma.notification.createMany({
    data: [
      { userId: david.id, actorId: ines.id, kind: 'like', postId: first.id },
      { userId: david.id, actorId: ines.id, kind: 'comment', postId: first.id },
      { userId: ines.id, actorId: david.id, kind: 'repost', postId: second.id },
    ],
  })

  await prisma.message.createMany({
    data: [
      { senderId: david.id, receiverId: ines.id, body: 'O feed já está a puxar só quem seguimos.' },
      { senderId: ines.id, receiverId: david.id, body: 'E as notificações chegam no instante.' },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
