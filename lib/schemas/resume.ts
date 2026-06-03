import { z } from "zod";

export const BasicInfoSchema = z.object({
  name: z.string().min(1, "姓名必填"),
  title: z.string().min(1, "求职岗位必填"),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().min(6, "电话必填"),
  location: z.string().optional(),
  summary: z.string().optional(),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  school: z.string().min(1),
  major: z.string().min(1),
  degree: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
});

export const WorkItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional(),
  link: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const ResumeDataSchema = z.object({
  basic: BasicInfoSchema,
  education: z.array(EducationItemSchema).default([]),
  work: z.array(WorkItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  skills: z.array(z.string()).default([]),
});

export type ResumeDataInput = z.infer<typeof ResumeDataSchema>;
