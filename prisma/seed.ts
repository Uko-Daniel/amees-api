import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { scryptSync, randomBytes } from 'crypto';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data (children before parents)
  await prisma.loginOtp.deleteMany();
  await prisma.trustedDevice.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.featuredEvent.deleteMany();
  await prisma.weeklyRhythm.deleteMany();
  await prisma.calendarEntry.deleteMany();
  await prisma.executive.deleteMany();
  await prisma.project.deleteMany();
  await prisma.sponsorTier.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.sponsorEnquiry.deleteMany();

  // 2. Admin (email + scrypt-hashed password)
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@amees.com.ng').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'amees2026';

  await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: 'editor',
    },
  });

  console.log(`  Admin: ${adminEmail} (password: ${adminPassword})`);

  // 3. Featured Event
  await prisma.featuredEvent.create({
    data: {
      title: 'Wired',
      version: '1.0',
      pre: 'The Association of Mechatronics and Electrical and Electronics Engineering Students presents',
      theme: 'Connecting minds through innovation',
      subtitle: 'A hardware tech bootcamp',
      venue: 'Faculty of Engineering Building, Lead City University, Ibadan',
      start: new Date('2026-11-09T15:00:00+01:00'),
      end: new Date('2026-12-03T17:00:00+01:00'),
      sessionHours: '3 to 5 pm WAT',
      demoNote: 'Present what you built',
      registrationOpen: true,
      tracks: [
        { id: 'embedded', title: 'Embedded Systems and Sensing', text: 'Microcontrollers, sensors, and reading the physical world into code.' },
        { id: 'control', title: 'Control and Intelligent Systems', text: 'Feedback loops, PID tuning, and adding learning to control.' },
        { id: 'power', title: 'Electromechanics and Power Systems', text: 'Motors, drives, power electronics, and how energy moves.' },
        { id: 'design', title: 'Design and Modelling', text: 'CAD, simulation, and designing a part before you cut it.' },
      ],
      steps: [
        { lead: 'Register', text: 'online before the first session.' },
        { lead: 'Show up', text: 'at the Faculty of Engineering Building, 3 to 5pm.' },
        { lead: 'Pick a project', text: 'that matches a track.' },
        { lead: 'Join a team', text: 'and share the build.' },
        { lead: 'Learn. Build. Demo.', text: 'Present what you made.' },
      ],
    },
  });

  // 4. Weekly Rhythm
  await prisma.weeklyRhythm.createMany({
    data: [
      { title: 'Trivia Tuesdays', text: 'Quick-fire engineering questions', weekday: 2 },
      { title: 'Member Spotlight', text: 'One member and what they built', label: 'Wk' },
      { title: 'Problem of the Week', text: 'Bonus marks where the HOD or lecturer approves', label: 'Wk' },
      { title: 'Dialogue Evenings', text: 'Open conversation on engineering and careers', weekday: 0 },
    ],
  });

  // 5. Calendar Entries
  await prisma.calendarEntry.createMany({
    data: [
      { date: new Date('2026-11-09T12:00:00+01:00'), title: 'Wired 1.0 opens', type: 'special' },
      { date: new Date('2026-12-03T12:00:00+01:00'), title: 'Wired 1.0 demo day', type: 'special' },
    ],
  });

  // 6. Executives
  await prisma.executive.createMany({
    data: [
      { role: 'President', name: 'John Doe', linkedin: 'https://linkedin.com/in/johndoe', order: 0 },
      { role: 'Vice President', name: 'Jane Smith', order: 1 },
    ],
  });

  // 7. Projects
  await prisma.project.create({
    data: {
      title: 'Digital Notice Board',
      builder: 'Ore',
      description: 'A networked display that replaces paper notices around the department.',
      tags: ['Display', 'Networking'],
      stage: 'Beta',
      showcased: true,
      workbenchData: {
        goal: 'Replace the paper notice board outside the HOD office.',
        pitch: { problem: 'Paper notices get torn.', solution: 'A Raspberry Pi connected to a display.', ask: 'A weatherproof enclosure.' },
        milestones: [{ date: 'Oct 12', title: 'Raspberry Pi configured' }],
        tests: [{ name: 'Wi-Fi recovery', result: 'Pass', pass: true }],
        parts: [{ name: 'Raspberry Pi 4', status: 'Owned' }],
      },
    },
  });

  // 8. Partners (logo wall) — no logos yet, no tiers assigned
  await prisma.partner.createMany({
    data: [
      { name: 'Atlis', type: 'Partner', order: 0 },
      { name: 'LCU Engineering', type: 'Partner', order: 1 },
      { name: 'TechHub Ibadan', type: 'Partner', order: 2 },
    ],
  });

  // 9. Sponsor Tiers
  await prisma.sponsorTier.createMany({
    data: [
      { name: 'Bronze', price: 'Fixed amount', features: ['Logo on the site', 'Named in the report'] },
      { name: 'Silver', price: 'Fixed amount', features: ['Booth space', 'A sponsored award'], hot: true },
      { name: 'Gold', price: 'Fixed amount', features: ['Naming rights on one project', 'Guest slot at Tech Week'] },
    ],
  });

  // 10. Site Settings
  await prisma.siteSettings.create({
    data: {
      id: 'global',
      activeMarquee: 'caution',
      pages: {
        events: { kicker: 'Events', title: 'What is on at AMEES', lede: 'A weekly schedule all year, plus the featured event below.' },
        calendar: { kicker: 'Calendar', title: 'Session calendar', lede: 'Bootcamp days, weekly sessions, and executive meetings in one view.' },
        archive: { kicker: 'Study archive', title: 'Past questions and notes', lede: 'Every course your seniors kept.' },
        workbench: { kicker: 'Workbench', title: 'Your project tracker', lede: 'Track your hardware build from first idea to demo day.' },
        toolbox: { kicker: 'Toolbox', title: 'Engineering toolbox', lede: 'Calculators and cheat sheets for the bench.' },
        opportunities: { kicker: 'Opportunities', title: 'Placements and prizes', lede: 'SIWES, internships, scholarships, and competitions.' },
        about: { kicker: 'About AMEES', title: 'Who we are', lede: 'The Association of Mechatronics and Electrical and Electronics Engineering Students.' },
        sponsors: { kicker: 'Sponsors & Partners', title: 'Back our future engineers', lede: 'AMEES gives sponsors a defined audience, early access to talent, and a name on hardware people can touch.' },
        projects: { kicker: 'Projects', title: 'Built by students', lede: 'A showcase of real hardware projects built by AMEES members, from concept to physical prototype.' },
      },
      about: {
        founded: '2025',
        motto: 'Connecting minds through innovation',
        description: 'The Association of Mechatronics and Electrical and Electronics Engineering Students (AMEES) is a student body dedicated to bridging the gap between theoretical engineering and practical, hands-on hardware development.',
        pillars: [
          { title: 'Learn', text: 'Workshops on CAD, programming, and hardware design.' },
          { title: 'Build', text: 'Real projects that solve problems, from concept to physical prototype.' },
          { title: 'Showcase', text: 'An annual exhibition where members present their builds to the public and industry.' },
        ],
      },
      footer: {
        tagline: 'Association of Mechatronics and Electrical and Electronics Engineering Students, Lead City University, Ibadan.',
        groups: [
          { title: 'Explore', links: [{ label: 'Events', page: 'events' }, { label: 'Calendar', page: 'calendar' }, { label: 'Archive', page: 'archive' }] },
          { title: 'About AMEES', links: [{ label: 'About', page: 'about' }, { label: 'Opportunities', page: 'opportunities' }] },
        ],
        external: [],
      },
      quickLinks: [
        { id: 'archive', title: 'Study archive', meta: 'year-round', text: 'Past questions and notes.', cta: 'Study archive' },
        { id: 'toolbox', title: 'Toolbox', meta: 'year-round', text: 'Calculators for common circuits.', cta: 'Toolbox' },
        { id: 'workbench', title: 'Workbench', meta: 'year-round', text: 'Track a project to demo day.', cta: 'Workbench' },
      ],
      upcoming: [
        { id: 'tech-week', title: 'AMEES Tech Week', tag: 'Second semester', text: 'Held with Student Week.' },
      ],
      archive: [
        { id: 'f1', title: 'Control Systems I lecture slides', course: 'MCE 301', level: 300, kind: 'Slides', year: 2026, ext: 'PPT', sample: true },
        { id: 'f2', title: 'Microprocessors and Interfacing notes', course: 'MCE 303', level: 300, kind: 'Notes', year: 2026, ext: 'PDF', sample: true },
      ],
      opportunities: [
        { id: 'o1', type: 'SIWES', title: 'Electrical maintenance placement', org: 'Regional power distribution company', levels: [300, 400], deadline: '2026-11-20', location: 'Ibadan', description: 'Six months shadowing technicians.' },
      ],
      exhibition: {
        title: 'Wired 1.0 Showcase',
        subtitle: 'Built by students',
        submitText: 'Applications for the next showcase open soon.',
      },
      sponsorPitch: {
        title: 'Partner with AMEES',
        text: 'Support AMEES and reach Mechatronics and Electrical and Electronics Engineering students at Lead City University.',
        cta: 'See sponsor tiers',
      },
      membershipFormUrl: 'https://forms.gle/your-google-form',
      projectSubmissionUrl: 'mailto:hello@amees.com',
    },
  });

  console.log('Database seeded successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });