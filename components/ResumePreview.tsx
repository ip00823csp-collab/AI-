"use client";

import type { ResumeData } from "@/lib/types/resume";

interface Props {
  data: ResumeData;
}

export function ResumePreview({ data }: Props) {
  const { basic, education, work, projects, skills } = data;

  return (
    <div className="bg-white text-zinc-900 p-10 shadow-sm border border-zinc-200 rounded-md min-h-[29.7cm] text-sm leading-relaxed font-serif">
      <header className="border-b border-zinc-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-wide">{basic.name || "姓名"}</h1>
        <p className="text-zinc-600 mt-1">{basic.title || "求职岗位"}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 mt-2">
          {basic.email && <span>{basic.email}</span>}
          {basic.phone && <span>{basic.phone}</span>}
          {basic.location && <span>{basic.location}</span>}
        </div>
        {basic.summary && (
          <p className="mt-4 text-sm text-zinc-800 whitespace-pre-wrap">{basic.summary}</p>
        )}
      </header>

      {work.length > 0 && (
        <Section title="工作经历">
          {work.map((w) => (
            <div key={w.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">
                  {w.position} · {w.company}
                </h3>
                <span className="text-xs text-zinc-500">
                  {w.startDate} — {w.endDate}
                </span>
              </div>
              <ul className="list-disc list-inside mt-1 text-zinc-800">
                {w.bullets.map((b, i) => (
                  <li key={i} className="whitespace-pre-wrap">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="项目经历">
          {projects.map((p) => (
            <div key={p.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">
                  {p.name}
                  {p.role && <span className="text-zinc-500 font-normal"> · {p.role}</span>}
                </h3>
                {(p.startDate || p.endDate) && (
                  <span className="text-xs text-zinc-500">
                    {p.startDate} — {p.endDate}
                  </span>
                )}
              </div>
              <ul className="list-disc list-inside mt-1 text-zinc-800">
                {p.bullets.map((b, i) => (
                  <li key={i} className="whitespace-pre-wrap">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="教育经历">
          {education.map((e) => (
            <div key={e.id} className="mb-2 flex justify-between items-baseline">
              <span className="font-semibold">
                {e.school} · {e.major} · {e.degree}
              </span>
              <span className="text-xs text-zinc-500">
                {e.startDate} — {e.endDate}
              </span>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="技能">
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-base font-semibold border-b border-zinc-200 pb-1 mb-2 tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}
