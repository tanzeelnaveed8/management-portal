
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
// import { hashPassword } from '../lib/auth/password';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient({
     datasources: {
          db: {
               url: process.env.DATABASE_URL,
          },
     },
});

async function hashPassword(password) {
     const salt = await bcrypt.genSalt(10);
     return await bcrypt.hash(password, salt);
}


async function main() {
     console.log('Starting seeding...');

     // Create users with different roles
     const users = [
          {
               email: 'ceo@company.com',
               password: await hashPassword('CEO@123'),
               name: 'Mesam CEO',
               role: 'CEO',
               status: 'ACTIVE',
               jobTitle: 'Chief Executive Officer',
               department: 'Executive'
          },
          {
               email: 'pm@company.com',
               password: await hashPassword('PM@123'),
               name: 'Sarah PM',
               role: 'PROJECT_MANAGER',
               status: 'ACTIVE',
               jobTitle: 'Senior Project Manager',
               department: 'Project Management'
          },
          {
               email: 'lead@company.cteamom',
               password: await hashPassword('Lead@123'),
               name: 'Tanzeel Lead',
               role: 'TEAM_LEAD',
               status: 'ACTIVE',
               jobTitle: 'Technical Team Lead',
               department: 'Engineering'
          },
          {
               email: 'dev@company.com',
               password: await hashPassword('Dev@123'),
               name: 'Rimsha Arfeen',
               role: 'DEVELOPER',
               status: 'ACTIVE',
               jobTitle: 'Full Stack Developer',
               department: 'Engineering'
          }
     ];

     for (const userData of users) {
          const user = await prisma.user.upsert({
               where: { email: userData.email },
               update: {}, // Keeps existing users as they are
               create: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    role: userData.role,
                    status: userData.status,
                    jobTitle: userData.jobTitle,
                    department: userData.department,
               },
          });
          console.log(`Created/Updated user: ${user.name}`);
     }


     // Get user IDs for relationships
     // Use findUniqueOrThrow to stop the script if a required dependency is missing
     const pm = await prisma.user.findUniqueOrThrow({ where: { email: 'pm@company.com' } });
     const lead = await prisma.user.findUniqueOrThrow({ where: { email: 'teamlead@company.com' } });
     const ceo = await prisma.user.findUniqueOrThrow({ where: { email: 'ceo@company.com' } });
     const dev = await prisma.user.findUniqueOrThrow({ where: { email: 'dev@company.com' } });

     // Create sample projects
     const projects = [
          {
               name: 'E-commerce Platform',
               description: 'Building a modern e-commerce platform with Next.js and MongoDB',
               status: 'ACTIVE',
               priority: 'HIGH',
               startDate: new Date('2024-01-15'),
               deadline: new Date('2024-04-30'),
               progress: 65,
               clientName: 'ABC Corp',
               clientEmail: 'contact@abccorp.com',
               clientCompany: 'ABC Corporation',
               managerId: pm.id,
               teamLeadId: lead.id,
               createdById: ceo.id,
               riskLevel: 'LOW',
               isDelayed: false
          },
          {
               name: 'Mobile App Redesign',
               description: 'Redesign and rebuild mobile app with React Native',
               status: 'IN_DEVELOPMENT',
               priority: 'MEDIUM',
               startDate: new Date('2024-02-01'),
               deadline: new Date('2024-05-15'),
               progress: 30,
               clientName: 'XYZ Ltd',
               clientEmail: 'info@xyzltd.com',
               clientCompany: 'XYZ Limited',
               managerId: pm.id,
               teamLeadId: lead.id,
               createdById: ceo.id,
               riskLevel: 'MEDIUM',
               isDelayed: false
          }
     ];

     for (const projectData of projects) {
          const project = await prisma.project.create({
               data: projectData,
          });
          console.log(`Created project: ${project.name}`);

          // Create milestones for each project
          const milestones = [
               {
                    name: 'Planning & Design',
                    description: 'Initial planning and UI/UX design',
                    status: 'COMPLETED',
                    projectId: project.id,
                    startDate: new Date('2024-01-15'),
                    deadline: new Date('2024-02-15'),
                    completedAt: new Date('2024-02-10'),
                    progress: 100
               },
               {
                    name: 'Development Phase 1',
                    description: 'Core feature development',
                    status: 'IN_PROGRESS',
                    projectId: project.id,
                    startDate: new Date('2024-02-16'),
                    deadline: new Date('2024-03-30'),
                    progress: 60
               }
          ];

          for (const milestoneData of milestones) {
               const milestone = await prisma.milestone.create({
                    data: milestoneData,
               });
               console.log(`  Created milestone: ${milestone.name}`);

               // Create tasks for each milestone
               const tasks = [
                    {
                         title: 'Setup project infrastructure',
                         description: 'Initialize Next.js, configure database, setup authentication',
                         status: 'COMPLETED',
                         priority: 'HIGH',
                         projectId: project.id,
                         milestoneId: milestone.id,
                         assigneeId: dev.id,
                         createdById: lead.id,
                         startDate: new Date('2024-02-16'),
                         deadline: new Date('2024-02-20'),
                         completedAt: new Date('2024-02-19'),
                         estimatedHours: 16,
                         actualHours: 14
                    },
                    {
                         title: 'Create login page',
                         description: 'Implement login UI and authentication logic',
                         status: 'IN_PROGRESS',
                         priority: 'HIGH',
                         projectId: project.id,
                         milestoneId: milestone.id,
                         assigneeId: dev.id,
                         createdById: lead.id,
                         startDate: new Date('2024-02-21'),
                         deadline: new Date('2024-02-28'),
                         estimatedHours: 24,
                         actualHours: 10
                    }
               ];

               for (const taskData of tasks) {
                    await prisma.task.create({
                         data: taskData,
                    });
               }
               console.log(`    Created ${tasks.length} tasks`);
          }
     }

     console.log('Seeding completed!');
}

main()
     .catch((e) => {
          console.error('Error during seeding:', e);
          process.exit(1);
     })
     .finally(async () => {
          await prisma.$disconnect();
     });