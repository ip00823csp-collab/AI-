"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/types/resume";
import { uid } from "@/lib/utils";

interface Props {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: Props) {
  const update = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });
  const updateBasic = (patch: Partial<ResumeData["basic"]>) =>
    onChange({ ...data, basic: { ...data.basic, ...patch } });

  return (
    <div className="space-y-6">
      <Card title="基本信息">
        <Grid2>
          <Field label="姓名" value={data.basic.name} onChange={(v) => updateBasic({ name: v })} />
          <Field
            label="求职岗位"
            value={data.basic.title}
            onChange={(v) => updateBasic({ title: v })}
          />
          <Field
            label="邮箱"
            value={data.basic.email}
            onChange={(v) => updateBasic({ email: v })}
          />
          <Field
            label="电话"
            value={data.basic.phone}
            onChange={(v) => updateBasic({ phone: v })}
          />
          <Field
            label="所在地"
            value={data.basic.location ?? ""}
            onChange={(v) => updateBasic({ location: v })}
          />
        </Grid2>
        <TextArea
          label="个人总结"
          value={data.basic.summary ?? ""}
          onChange={(v) => updateBasic({ summary: v })}
          rows={3}
        />
        <PolishButton
          section="summary"
          text={data.basic.summary ?? ""}
          context={data.basic.title}
          onResult={(rewritten) => updateBasic({ summary: rewritten })}
        />
      </Card>

      <Card title="工作经历">
        {data.work.map((w, idx) => (
          <ItemBlock
            key={w.id}
            title={`${w.position || "工作"} @ ${w.company || "公司"}`}
            onRemove={() => update({ work: data.work.filter((x) => x.id !== w.id) })}
          >
            <Grid2>
              <Field
                label="公司"
                value={w.company}
                onChange={(v) =>
                  update({
                    work: data.work.map((x) => (x.id === w.id ? { ...x, company: v } : x)),
                  })
                }
              />
              <Field
                label="职位"
                value={w.position}
                onChange={(v) =>
                  update({
                    work: data.work.map((x) => (x.id === w.id ? { ...x, position: v } : x)),
                  })
                }
              />
              <Field
                label="开始时间"
                value={w.startDate}
                onChange={(v) =>
                  update({
                    work: data.work.map((x) => (x.id === w.id ? { ...x, startDate: v } : x)),
                  })
                }
              />
              <Field
                label="结束时间"
                value={w.endDate}
                onChange={(v) =>
                  update({
                    work: data.work.map((x) => (x.id === w.id ? { ...x, endDate: v } : x)),
                  })
                }
              />
            </Grid2>
            <BulletList
              bullets={w.bullets}
              onChange={(bullets) =>
                update({ work: data.work.map((x) => (x.id === w.id ? { ...x, bullets } : x)) })
              }
              polishContext={`${w.position} @ ${w.company}`}
            />
            <span className="text-xs text-zinc-400">序号 {idx + 1}</span>
          </ItemBlock>
        ))}
        <AddBtn
          label="+ 添加工作经历"
          onClick={() =>
            update({
              work: [
                ...data.work,
                {
                  id: uid(),
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  bullets: [""],
                },
              ],
            })
          }
        />
      </Card>

      <Card title="项目经历">
        {data.projects.map((p) => (
          <ItemBlock
            key={p.id}
            title={p.name || "项目"}
            onRemove={() => update({ projects: data.projects.filter((x) => x.id !== p.id) })}
          >
            <Grid2>
              <Field
                label="项目名"
                value={p.name}
                onChange={(v) =>
                  update({
                    projects: data.projects.map((x) => (x.id === p.id ? { ...x, name: v } : x)),
                  })
                }
              />
              <Field
                label="角色"
                value={p.role ?? ""}
                onChange={(v) =>
                  update({
                    projects: data.projects.map((x) => (x.id === p.id ? { ...x, role: v } : x)),
                  })
                }
              />
              <Field
                label="链接"
                value={p.link ?? ""}
                onChange={(v) =>
                  update({
                    projects: data.projects.map((x) => (x.id === p.id ? { ...x, link: v } : x)),
                  })
                }
              />
            </Grid2>
            <BulletList
              bullets={p.bullets}
              onChange={(bullets) =>
                update({
                  projects: data.projects.map((x) => (x.id === p.id ? { ...x, bullets } : x)),
                })
              }
              polishContext={p.name}
            />
          </ItemBlock>
        ))}
        <AddBtn
          label="+ 添加项目"
          onClick={() =>
            update({
              projects: [
                ...data.projects,
                { id: uid(), name: "", role: "", bullets: [""] },
              ],
            })
          }
        />
      </Card>

      <Card title="技能">
        <TagInput
          tags={data.skills}
          onChange={(skills) => update({ skills })}
        />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-zinc-200 rounded-md p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-700 mb-3 tracking-wide">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ItemBlock({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-200 rounded-md p-3 space-y-3 bg-zinc-50">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-zinc-700">{title}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-700"
        >
          删除
        </button>
      </div>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function BulletList({
  bullets,
  onChange,
  polishContext,
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
  polishContext?: string;
}) {
  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-zinc-400 mt-2">•</span>
          <textarea
            value={b}
            rows={2}
            onChange={(e) => onChange(bullets.map((x, j) => (j === i ? e.target.value : x)))}
            className="flex-1 px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col gap-1">
            <PolishButton
              section="bullet"
              text={b}
              context={polishContext}
              onResult={(rewritten) =>
                onChange(bullets.map((x, j) => (j === i ? rewritten : x)))
              }
            />
            <button
              type="button"
              onClick={() => onChange(bullets.filter((_, j) => j !== i))}
              className="text-xs text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...bullets, ""])}
        className="text-xs text-blue-600 hover:text-blue-800"
      >
        + 添加要点
      </button>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded text-xs flex items-center gap-1"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              className="text-zinc-400 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder="输入技能后回车添加"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            onChange([...tags, input.trim()]);
            setInput("");
          }
        }}
        className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-dashed border-zinc-300 rounded hover:border-blue-400"
    >
      {label}
    </button>
  );
}

function PolishButton({
  section,
  text,
  context,
  onResult,
}: {
  section: "summary" | "bullet";
  text: string;
  context?: string;
  onResult: (rewritten: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) {
      setError("内容为空，无法润色");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, text, context }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "润色失败");
      onResult(json.rewritten);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
      >
        {loading ? "AI 润色中…" : "✨ AI 润色"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
