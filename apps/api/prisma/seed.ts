import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[GymOS Seed] Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gymos.io' },
    update: {},
    create: {
      email: 'admin@gymos.io',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'GymOS',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('[GymOS Seed] Admin user created:', admin.email);

  // Create demo trainer
  const trainerPasswordHash = await bcrypt.hash('Trainer123!', 12);
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@gymos.io' },
    update: {},
    create: {
      email: 'trainer@gymos.io',
      passwordHash: trainerPasswordHash,
      firstName: 'Demo',
      lastName: 'Trainer',
      role: 'TRAINER',
      isActive: true,
    },
  });

  await prisma.trainerProfile.upsert({
    where: { userId: trainer.id },
    update: {},
    create: {
      userId: trainer.id,
      bio: 'Certified personal trainer with 10 years of experience in strength and conditioning.',
      specialties: ['strength', 'hypertrophy', 'weight_loss'],
      certifications: ['NASM-CPT', 'CSCS'],
      coachingStyle: 'evidence-based',
      onboardingComplete: true,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: trainer.id },
    update: {},
    create: {
      userId: trainer.id,
      planType: 'TRAINER',
      status: 'ACTIVE',
      provider: 'internal',
    },
  });
  console.log('[GymOS Seed] Trainer user created:', trainer.email);

  // Create demo client
  const clientPasswordHash = await bcrypt.hash('Client123!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@gymos.io' },
    update: {},
    create: {
      email: 'client@gymos.io',
      passwordHash: clientPasswordHash,
      firstName: 'Demo',
      lastName: 'Client',
      role: 'CLIENT',
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      gender: 'male',
      heightCm: 178,
      currentWeightKg: 85,
      goalType: 'GAIN_MUSCLE',
      activityLevel: 'MODERATELY_ACTIVE',
      experienceLevel: 'INTERMEDIATE',
      equipmentAccess: 'COMMERCIAL_GYM',
      workoutDaysPerWeek: 4,
      preferredWorkoutDurationMinutes: 60,
      dietaryPreferences: [],
      excludedFoods: [],
      unitsPreference: 'IMPERIAL',
      onboardingComplete: true,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      planType: 'PRO',
      status: 'ACTIVE',
      provider: 'internal',
    },
  });
  console.log('[GymOS Seed] Client user created:', client.email);

  // Seed sample exercises
  const exercises = [
    {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description: 'The king of lower body exercises. Targets the quads, glutes, and core.',
      primaryMuscleGroup: 'Quadriceps',
      secondaryMuscleGroups: ['Glutes', 'Hamstrings', 'Core', 'Lower Back'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      movementPattern: 'Squat',
      tutorialSteps: ['Set up the bar on your upper traps', 'Position feet shoulder-width apart', 'Brace core and descend', 'Drive through heels to stand'],
      coachingCues: ['Chest up', 'Knees out', 'Big breath before descent', 'Drive the floor away'],
      commonMistakes: ['Caving knees', 'Forward lean', 'Heel rise', 'Shallow depth'],
      safetyNotes: ['Warm up thoroughly', 'Use a spotter for heavy loads', 'Keep back neutral'],
    },
    {
      name: 'Bench Press',
      slug: 'bench-press',
      description: 'Classic chest exercise targeting pecs, anterior deltoids, and triceps.',
      primaryMuscleGroup: 'Chest',
      secondaryMuscleGroups: ['Triceps', 'Front Deltoids'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      movementPattern: 'Push',
      tutorialSteps: ['Lie flat on bench', 'Grip bar slightly wider than shoulder-width', 'Lower bar to chest', 'Press to full extension'],
      coachingCues: ['Retract shoulder blades', 'Plant feet firmly', 'Control the descent', 'Full lockout at top'],
      commonMistakes: ['Bouncing bar off chest', 'Flared elbows', 'Uneven grip', 'Loose back'],
      safetyNotes: ['Always use a spotter for max attempts', 'Keep wrists straight'],
    },
    {
      name: 'Deadlift',
      slug: 'deadlift',
      description: 'Full-body compound movement targeting the posterior chain.',
      primaryMuscleGroup: 'Hamstrings',
      secondaryMuscleGroups: ['Glutes', 'Lower Back', 'Traps', 'Core'],
      equipment: 'Barbell',
      difficulty: 'Advanced',
      movementPattern: 'Hip Hinge',
      tutorialSteps: ['Stand with bar over mid-foot', 'Hip-hinge to grip bar', 'Take slack out of bar', 'Drive hips forward to stand'],
      coachingCues: ['Bar stays over mid-foot', 'Lat engagement', 'Hip hinge not squat', 'Lock out at top'],
      commonMistakes: ['Rounding lower back', 'Bar drifting from legs', 'Hyperextending at top', 'Jerking the bar'],
      safetyNotes: ['Learn proper form before adding weight', 'Avoid if lower back pain present'],
    },
    {
      name: 'Pull-Up',
      slug: 'pull-up',
      description: 'Upper body pulling exercise targeting the lats and biceps.',
      primaryMuscleGroup: 'Latissimus Dorsi',
      secondaryMuscleGroups: ['Biceps', 'Rear Deltoids', 'Core'],
      equipment: 'Pull-up Bar',
      difficulty: 'Intermediate',
      movementPattern: 'Pull',
      tutorialSteps: ['Hang from bar with pronated grip', 'Retract scapula', 'Pull chest to bar', 'Lower with control'],
      coachingCues: ['Lead with elbows', 'Full range of motion', 'Avoid kipping', 'Squeeze at top'],
      commonMistakes: ['Partial range of motion', 'Shrugging shoulders', 'Swinging', 'Not engaging lats'],
      safetyNotes: ['Build up with assisted variations', 'Avoid if shoulder injury present'],
    },
    {
      name: 'Overhead Press',
      slug: 'overhead-press',
      description: 'Vertical pressing movement for shoulder and tricep development.',
      primaryMuscleGroup: 'Deltoids',
      secondaryMuscleGroups: ['Triceps', 'Upper Chest', 'Core'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      movementPattern: 'Push',
      tutorialSteps: ['Grip bar at shoulder-width', 'Unrack and hold at shoulders', 'Press overhead to full extension', 'Lower with control'],
      coachingCues: ['Tuck chin on press', 'Full lockout', 'Brace core throughout', 'Bar travels in straight line'],
      commonMistakes: ['Excessive lower back arch', 'Incomplete lockout', 'Bar path too far forward', 'Pressing behind neck'],
      safetyNotes: ['Avoid if shoulder impingement present', 'Warm up rotator cuff'],
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {},
      create: exercise,
    });
  }
  console.log(`[GymOS Seed] ${exercises.length} exercises seeded.`);

  console.log('[GymOS Seed] Seed completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  Admin:   admin@gymos.io   / Admin123!');
  console.log('  Trainer: trainer@gymos.io / Trainer123!');
  console.log('  Client:  client@gymos.io  / Client123!');
}

main()
  .catch((e) => {
    console.error('[GymOS Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
