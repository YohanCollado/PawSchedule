import "dotenv/config";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import type { Campus, Category, Club, Comment, Event, ExperiencePost, Major } from "../types.js";

export const PERKS = [
  "Free food",
  "Free merch",
  "Networking",
  "Resume help",
  "Prizes",
  "Service hours",
] as const;

export const categories: Category[] = [
  { id: "academic", name: "Academic" },
  { id: "cultural", name: "Cultural" },
  { id: "greek-life", name: "Greek Life" },
  { id: "honor-society", name: "Honor Society" },
  { id: "professional", name: "Professional" },
  { id: "technology", name: "Technology" },
  { id: "service", name: "Service & Volunteering" },
  { id: "religious", name: "Religious & Spiritual" },
  { id: "sports", name: "Sports & Recreation" },
  { id: "arts", name: "Arts & Performance" },
  { id: "advocacy", name: "Advocacy & Political" },
  { id: "wellness", name: "Health & Wellness" },
];

export const majors: Major[] = [
  { id: "computer-science", name: "Computer Science" },
  { id: "information-technology", name: "Information Technology" },
  { id: "computer-engineering", name: "Computer Engineering" },
  { id: "electrical-engineering", name: "Electrical Engineering" },
  { id: "mechanical-engineering", name: "Mechanical Engineering" },
  { id: "biomedical-engineering", name: "Biomedical Engineering" },
  { id: "nursing", name: "Nursing" },
  { id: "biology", name: "Biology" },
  { id: "chemistry", name: "Chemistry" },
  { id: "business", name: "Business Administration" },
  { id: "finance", name: "Finance" },
  { id: "accounting", name: "Accounting" },
  { id: "psychology", name: "Psychology" },
  { id: "communication", name: "Communication" },
  { id: "political-science", name: "Political Science" },
  { id: "hospitality", name: "Hospitality Management" },
];

const ENGINEERING = [
  "computer-engineering",
  "electrical-engineering",
  "mechanical-engineering",
  "biomedical-engineering",
];
const COMPUTING = ["computer-science", "information-technology", "computer-engineering"];
const BUSINESS = ["business", "finance", "accounting"];

export const clubs: Club[] = [
  { id: "acm", name: "ACM at FIU", categoryId: "technology", majorIds: COMPUTING },
  { id: "init", name: "INIT", categoryId: "technology", majorIds: ["computer-science", "information-technology"] },
  { id: "wics", name: "Women in Computer Science", categoryId: "technology", majorIds: COMPUTING },
  { id: "shpe", name: "SHPE FIU", categoryId: "professional", majorIds: [...ENGINEERING, "computer-science"] },
  { id: "swe", name: "Society of Women Engineers", categoryId: "professional", majorIds: ENGINEERING },
  { id: "nsbe", name: "National Society of Black Engineers", categoryId: "professional", majorIds: [...ENGINEERING, "computer-science"] },
  { id: "upe", name: "Upsilon Pi Epsilon", categoryId: "honor-society", majorIds: ["computer-science", "information-technology"] },
  { id: "tbp", name: "Tau Beta Pi", categoryId: "honor-society", majorIds: ENGINEERING },
  { id: "psi-chi", name: "Psi Chi", categoryId: "honor-society", majorIds: ["psychology"] },
  { id: "pre-med", name: "Pre-Medical Society", categoryId: "academic", majorIds: ["biology", "chemistry", "biomedical-engineering"] },
  { id: "sna", name: "Student Nurses Association", categoryId: "professional", majorIds: ["nursing"] },
  { id: "fic", name: "Finance & Investment Club", categoryId: "professional", majorIds: BUSINESS },
  { id: "bap", name: "Beta Alpha Psi", categoryId: "honor-society", majorIds: ["accounting", "finance"] },
  { id: "csa", name: "Caribbean Students Association", categoryId: "cultural", majorIds: [] },
  { id: "vso", name: "Venezuelan Student Organization", categoryId: "cultural", majorIds: [] },
  { id: "asu", name: "Asian Student Union", categoryId: "cultural", majorIds: [] },
  { id: "dphie", name: "Delta Phi Epsilon", categoryId: "greek-life", majorIds: [] },
  { id: "sig-ep", name: "Sigma Phi Epsilon", categoryId: "greek-life", majorIds: [] },
  { id: "model-un", name: "Model United Nations", categoryId: "advocacy", majorIds: ["political-science", "communication"] },
  { id: "panther-dance", name: "Panther Dance Collective", categoryId: "arts", majorIds: [] },
  { id: "mindful", name: "Mindful Panthers", categoryId: "wellness", majorIds: ["psychology", "nursing"] },
  { id: "panthers-serve", name: "Panthers Serve", categoryId: "service", majorIds: [] },
  { id: "club-soccer", name: "FIU Club Soccer", categoryId: "sports", majorIds: [] },
  { id: "interfaith", name: "Interfaith Student Council", categoryId: "religious", majorIds: [] },
];

interface SeedEventSpec {
  title: string;
  clubId: string;
  /** Days from today (0 = today). */
  day: number;
  /** Local start time as "HH:MM". */
  time: string;
  minutes: number;
  location: string;
  campus: Campus;
  perks: string[];
  description: string;
}

const seedEventSpecs: SeedEventSpec[] = [
  { title: "Intro to Git & GitHub Workshop", clubId: "acm", day: 0, time: "18:00", minutes: 90, location: "PG6 Tech Station 120", campus: "MMC", perks: ["Free food"], description: "Hands-on workshop covering branching, pull requests and resolving merge conflicts. Bring a laptop." },
  { title: "Women in Tech Coffee Chat", clubId: "wics", day: 1, time: "11:00", minutes: 60, location: "GC 2nd Floor Lounge", campus: "MMC", perks: ["Free food", "Networking"], description: "Casual chat with women engineers from local tech companies." },
  { title: "Hack Night: Build Your First API", clubId: "init", day: 1, time: "19:00", minutes: 180, location: "CASE 241", campus: "Engineering Center", perks: ["Free food", "Prizes"], description: "Pair up and ship a small REST API by the end of the night. Mentors on site." },
  { title: "Caribbean Heritage Mixer", clubId: "csa", day: 2, time: "17:30", minutes: 120, location: "Graham Center Pit", campus: "MMC", perks: ["Free food"], description: "Music, food and games celebrating Caribbean culture. Everyone welcome." },
  { title: "Resume Review Night", clubId: "shpe", day: 2, time: "18:30", minutes: 90, location: "EC 1115", campus: "Engineering Center", perks: ["Resume help", "Networking"], description: "Get your resume reviewed by industry professionals before career fair season." },
  { title: "Mindfulness & Study Break", clubId: "mindful", day: 3, time: "12:00", minutes: 45, location: "Wellness & Recreation Center, Room 140", campus: "MMC", perks: ["Free food"], description: "Guided meditation and tea to recharge mid-week." },
  { title: "Stock Pitch Competition Kickoff", clubId: "fic", day: 3, time: "17:00", minutes: 90, location: "RB 130", campus: "MMC", perks: ["Prizes", "Networking"], description: "Form teams and learn how to build a winning stock pitch." },
  { title: "Beach Cleanup at BBC", clubId: "panthers-serve", day: 4, time: "09:00", minutes: 180, location: "BBC Waterfront", campus: "BBC", perks: ["Service hours", "Free merch"], description: "Help keep Biscayne Bay clean. Gloves and bags provided." },
  { title: "Pre-Med Panel: Life in Med School", clubId: "pre-med", day: 5, time: "18:00", minutes: 90, location: "AHC2 110", campus: "MMC", perks: ["Free food", "Networking"], description: "Current medical students share how they prepared for the MCAT and applications." },
  { title: "Delta Phi Epsilon Open House", clubId: "dphie", day: 5, time: "19:00", minutes: 120, location: "Panther Pit", campus: "MMC", perks: ["Free food"], description: "Meet the sisters and learn about recruitment." },
  { title: "Intro to Machine Learning", clubId: "upe", day: 6, time: "17:00", minutes: 90, location: "Online (Zoom link on RSVP)", campus: "Online", perks: [], description: "Beginner-friendly overview of supervised learning with Python." },
  { title: "Model UN Practice Session", clubId: "model-un", day: 7, time: "16:00", minutes: 120, location: "DM 150", campus: "MMC", perks: [], description: "Practice debate and resolution writing ahead of the regional conference." },
  { title: "NCLEX Study Group", clubId: "sna", day: 8, time: "15:00", minutes: 120, location: "AHC3 205", campus: "MMC", perks: ["Free food"], description: "Group review of practice questions for nursing students." },
  { title: "Arepa Night", clubId: "vso", day: 9, time: "18:00", minutes: 120, location: "WUC Ballroom", campus: "BBC", perks: ["Free food"], description: "Homemade arepas, music and community." },
  { title: "Engineering Tech Talk: Robotics", clubId: "swe", day: 10, time: "18:00", minutes: 75, location: "EC 2300", campus: "Engineering Center", perks: ["Free food", "Networking"], description: "A robotics engineer walks through designing autonomous systems." },
  { title: "Club Soccer Tryouts", clubId: "club-soccer", day: 11, time: "17:00", minutes: 120, location: "University Park Fields", campus: "MMC", perks: [], description: "Open tryouts for the spring season. Bring cleats and water." },
  { title: "Accounting Firm Meet & Greet", clubId: "bap", day: 12, time: "18:00", minutes: 120, location: "RB 210", campus: "MMC", perks: ["Networking", "Free food"], description: "Meet recruiters from Big Four and regional accounting firms." },
  { title: "Lunar Culture Showcase Rehearsal", clubId: "asu", day: 13, time: "19:00", minutes: 120, location: "GC 243", campus: "MMC", perks: [], description: "Open rehearsal for performers and volunteers." },
  { title: "LeetCode Grind Session", clubId: "acm", day: 14, time: "18:00", minutes: 120, location: "PG6 Tech Station 120", campus: "MMC", perks: ["Free food"], description: "Solve interview problems together. All levels welcome." },
  { title: "NSBE Professional Development Night", clubId: "nsbe", day: 15, time: "18:30", minutes: 90, location: "EC 1115", campus: "Engineering Center", perks: ["Resume help", "Networking"], description: "Workshop on interviewing and LinkedIn profiles." },
  { title: "Interfaith Dialogue Dinner", clubId: "interfaith", day: 17, time: "18:00", minutes: 120, location: "GC 140", campus: "MMC", perks: ["Free food"], description: "Share a meal and conversation across faith traditions." },
  { title: "Psi Chi Research Fair", clubId: "psi-chi", day: 19, time: "13:00", minutes: 180, location: "DM 100", campus: "MMC", perks: ["Networking"], description: "Learn about undergraduate research labs looking for assistants." },
  { title: "Dance Showcase Auditions", clubId: "panther-dance", day: 21, time: "17:00", minutes: 150, location: "WPAC Dance Studio", campus: "MMC", perks: [], description: "Audition for the end-of-semester dance showcase." },
  { title: "Tau Beta Pi Tutoring Marathon", clubId: "tbp", day: 24, time: "10:00", minutes: 360, location: "EC 3rd Floor Study Area", campus: "Engineering Center", perks: ["Free food", "Service hours"], description: "Free tutoring for calculus, physics and circuits before finals." },
  { title: "Sig Ep Charity Cookout", clubId: "sig-ep", day: 27, time: "12:00", minutes: 180, location: "Lakeview Lawn", campus: "BBC", perks: ["Free food", "Service hours"], description: "Burgers for a cause. All proceeds go to local youth programs." },
];

/** Prefix used for seed event IDs so they can be told apart from user-created events. */
export const SEED_ID_PREFIX = "seed-";

/**
 * Builds the seed events relative to `now` so the upcoming list is never empty.
 * Events scheduled for "today" that would already have started are pushed a few
 * hours ahead of `now`.
 */
export function buildSeedEvents(now: Date = new Date()): Event[] {
  return seedEventSpecs.map((spec, index) => {
    const [hours, minutes] = spec.time.split(":").map(Number);
    const start = new Date(now);
    start.setDate(start.getDate() + spec.day);
    start.setHours(hours, minutes, 0, 0);
    if (start <= now) {
      start.setTime(now.getTime() + 2 * 60 * 60 * 1000);
      start.setMinutes(0, 0, 0);
    }
    const end = new Date(start.getTime() + spec.minutes * 60 * 1000);

    return {
      id: `${SEED_ID_PREFIX}${index + 1}`,
      title: spec.title,
      description: spec.description,
      clubId: spec.clubId,
      start: start.toISOString(),
      end: end.toISOString(),
      location: spec.location,
      campus: spec.campus,
      perks: spec.perks,
      source: "manual",
      createdAt: now.toISOString(),
    };
  });
}

/** Sample experience posts and comments (filled in by the seed step). */
export function buildSeedPosts(_now: Date = new Date()): { posts: ExperiencePost[]; comments: Comment[] } {
  return { posts: [], comments: [] };
}

export async function seedDatabase(connectionString = process.env.DATABASE_URL!) {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Seed Categories first
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: { name: category.name },
        create: { id: category.id, name: category.name },
      });
    }

    // 2. Seed Majors next
    for (const major of majors) {
      await prisma.major.upsert({
        where: { id: major.id },
        update: { name: major.name },
        create: { id: major.id, name: major.name },
      });
    }

    // 3. Seed Clubs (depends on Category & Majors)
    for (const club of clubs) {
      await prisma.club.upsert({
        where: { id: club.id },
        update: {
          name: club.name,
          categoryId: club.categoryId,
          majors: { set: club.majorIds.map((id) => ({ id })) },
        },
        create: {
          id: club.id,
          name: club.name,
          categoryId: club.categoryId,
          majors: { connect: club.majorIds.map((id) => ({ id })) },
        },
      });
    }

    // 4. Seed Events last (depends on Club)
    const seedEvents = buildSeedEvents();
    for (const event of seedEvents) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {
          title: event.title,
          description: event.description,
          clubId: event.clubId,
          start: new Date(event.start),
          end: new Date(event.end),
          location: event.location,
          campus: event.campus,
          perks: event.perks,
        },
        create: {
          id: event.id,
          title: event.title,
          description: event.description,
          clubId: event.clubId,
          start: new Date(event.start),
          end: new Date(event.end),
          location: event.location,
          campus: event.campus,
          perks: event.perks,
          source: event.source,
        },
      });
    }

    console.log("Seeded categories, majors, clubs, and events successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDatabase().catch((err) => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  });
}