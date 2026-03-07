'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { HealthState, TemplateSummary, TemplateVersionSummary } from '@/lib/types';

interface TemplateManagerProps {
  templates: TemplateSummary[];
  apiBase: string;
}

interface TemplateFormState {
  id?: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
  isActive: boolean;
}

interface FeedbackState {
  tone: HealthState;
  title: string;
  body: string;
}

function createBlankTemplate(): TemplateFormState {
  return {
    name: 'New template',
    category: 'General',
    description: '',
    subject: '',
    preheader: '',
    htmlBody: '<html><body><p></p></body></html>',
    textBody: '',
    isActive: true,
  };
}

function hydrateForm(template: TemplateSummary): TemplateFormState {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    subject: template.subject,
    preheader: template.preheader,
    htmlBody: template.htmlBody,
    textBody: template.textBody,
    isActive: template.isActive,
  };
}

function hydrateFromVersion(version: TemplateVersionSummary): TemplateFormState {
  return {
    id: version.templateId,
    name: version.name,
    category: version.category,
    description: version.description,
    subject: version.subject,
    preheader: version.preheader,
    htmlBody: version.htmlBody,
    textBody: version.textBody,
    isActive: version.isActive,
  };
}

function normalizeTemplateResponse(item: Record<string, unknown>): TemplateSummary {
  const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
  const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : createdAt;
  return {
    id: typeof item.id === 'string' ? item.id : `tpl-${Date.now()}`,
    name: typeof item.name === 'string' ? item.name : 'Untitled template',
    slug: typeof item.slug === 'string' ? item.slug : 'untitled-template',
    category: typeof item.category === 'string' ? item.category : 'General',
    description: typeof item.description === 'string' ? item.description : '',
    subject: typeof item.subject === 'string' ? item.subject : '',
    preheader: typeof item.preheader === 'string' ? item.preheader : '',
    htmlBody: typeof item.html_body === 'string' ? item.html_body : '',
    textBody: typeof item.text_body === 'string' ? item.text_body : '',
    isActive: typeof item.is_active === 'boolean' ? item.is_active : true,
    createdAt,
    updatedAt,
    versionCount: typeof item.version_count === 'number' ? item.version_count : 1,
    currentVersion: typeof item.current_version === 'number' ? item.current_version : 1,
  };
}

function normalizeVersionResponse(item: Record<string, unknown>): TemplateVersionSummary {
  return {
    id: typeof item.id === 'string' ? item.id : `tplver-${Date.now()}`,
    templateId: typeof item.template_id === 'string' ? item.template_id : '',
    versionNumber: typeof item.version_number === 'number' ? item.version_number : 1,
    name: typeof item.name === 'string' ? item.name : 'Untitled template',
    category: typeof item.category === 'string' ? item.category : 'General',
    description: typeof item.description === 'string' ? item.description : '',
    subject: typeof item.subject === 'string' ? item.subject : '',
    preheader: typeof item.preheader === 'string' ? item.preheader : '',
    htmlBody: typeof item.html_body === 'string' ? item.html_body : '',
    textBody: typeof item.text_body === 'string' ? item.text_body : '',
    isActive: typeof item.is_active === 'boolean' ? item.is_active : true,
    createdAt: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
  };
}

function upsertTemplate(items: TemplateSummary[], next: TemplateSummary): TemplateSummary[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [next, ...items];
  }

  const updated = [...items];
  updated[existingIndex] = next;
  return updated.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export default function TemplateManager({ templates, apiBase }: TemplateManagerProps) {
  const [items, setItems] = useState(templates);
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? '');
  const [form, setForm] = useState(templates[0] ? hydrateForm(templates[0]) : createBlankTemplate());
  const [versions, setVersions] = useState<Record<string, TemplateVersionSummary[]>>({});
  const [versionsPending, setVersionsPending] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectedTemplate = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!selectedId || versions[selectedId]) {
      return;
    }

    let cancelled = false;
    async function loadVersions() {
      setVersionsPending(true);
      try {
        const response = await fetch(`${apiBase}/templates/${selectedId}/versions`, {
          headers: { Accept: 'application/json' },
        });
        const payload = (await response.json()) as { items?: Record<string, unknown>[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load template history.');
        }
        if (!cancelled) {
          setVersions((current) => ({
            ...current,
            [selectedId]: Array.isArray(payload.items) ? payload.items.map(normalizeVersionResponse) : [],
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            tone: 'attention',
            title: 'Template history unavailable',
            body: error instanceof Error ? error.message : 'Unable to load template versions.',
          });
        }
      } finally {
        if (!cancelled) {
          setVersionsPending(false);
        }
      }
    }

    void loadVersions();
    return () => {
      cancelled = true;
    };
  }, [apiBase, selectedId, versions]);

  function selectTemplate(template: TemplateSummary) {
    setSelectedId(template.id);
    setForm(hydrateForm(template));
    setFeedback(null);
  }

  function resetForm() {
    setSelectedId('');
    setForm(createBlankTemplate());
    setFeedback(null);
  }

  function updateForm<K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadVersion(version: TemplateVersionSummary) {
    setSelectedId(version.templateId);
    setForm(hydrateFromVersion(version));
    setFeedback({
      tone: 'healthy',
      title: `Loaded version ${version.versionNumber}`,
      body: `${version.name} version ${version.versionNumber} is now loaded into the editor. Save it to restore it as the current template.`,
    });
  }

  async function saveTemplate() {
    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          category: form.category,
          description: form.description,
          subject: form.subject,
          preheader: form.preheader,
          html_body: form.htmlBody,
          text_body: form.textBody,
          is_active: form.isActive,
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to save template.');
      }

      const normalized = normalizeTemplateResponse(payload);
      setItems((current) => upsertTemplate(current, normalized));
      setSelectedId(normalized.id);
      setForm(hydrateForm(normalized));
      setVersions((current) => {
        const next = { ...current };
        delete next[normalized.id];
        return next;
      });
      setFeedback({
        tone: 'healthy',
        title: form.id ? 'Template updated' : 'Template created',
        body: `${normalized.name} is now available in the compose workbench and seed lab launcher.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Template save failed',
        body: error instanceof Error ? error.message : 'Unknown template save failure.',
      });
    } finally {
      setPending(false);
    }
  }

  const selectedVersions = selectedId ? versions[selectedId] ?? [] : [];

  return (
    <div className="grid gap-6 pb-12 xl:grid-cols-[0.92fr_1.08fr]">
      <Panel title="Template library" kicker="Reusable message systems">
        <div className="space-y-4">
          {items.map((template) => (
            <article key={template.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label={template.isActive ? 'active' : 'archived'} state={template.isActive ? 'healthy' : 'neutral'} />
                    <span className="text-[0.64rem] uppercase tracking-[0.24em] text-cyan-200/68">{template.category}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-slate-300/80">
                      v{template.currentVersion ?? 1} / {template.versionCount ?? 1}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{template.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300/72">{template.description || 'No template description yet.'}</p>
                </div>
                {selectedTemplate?.id === template.id ? <StatusPill label="editing" state="neutral" /> : null}
              </div>

              <div className="mt-5 grid gap-4 text-sm text-slate-300/72 sm:grid-cols-2">
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Subject</div>
                  <div className="mt-2 text-white">{template.subject || 'Pending subject'}</div>
                </div>
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Updated</div>
                  <div className="mt-2 text-white">{new Date(template.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => selectTemplate(template)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
                >
                  Edit template
                </button>
                <Link
                  href="/dashboard/compose"
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-white transition hover:bg-cyan-300/16"
                >
                  Open compose
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title={form.id ? 'Edit template' : 'Create template'} kicker="Template authoring">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Template name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Category</span>
                <input
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Subject</span>
              <input
                value={form.subject}
                onChange={(event) => updateForm('subject', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Preheader</span>
              <input
                value={form.preheader}
                onChange={(event) => updateForm('preheader', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">HTML body</span>
              <textarea
                rows={12}
                value={form.htmlBody}
                onChange={(event) => updateForm('htmlBody', event.target.value)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 font-mono text-[0.92rem] text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Plain-text body</span>
              <textarea
                rows={9}
                value={form.textBody}
                onChange={(event) => updateForm('textBody', event.target.value)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 font-mono text-[0.92rem] text-white outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300/76">
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm('isActive', event.target.checked)} />
                Active in compose and seed lab
              </label>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300/78">
                Subject {form.subject.length} chars
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300/78">
                HTML {form.htmlBody.length} chars
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveTemplate}
                disabled={pending}
                className="rounded-full border border-emerald-300/24 bg-emerald-300/12 px-5 py-2.5 text-sm text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Saving...' : form.id ? 'Update template' : 'Create template'}
              </button>
              <button
                onClick={resetForm}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
              >
                New template
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Version history" kicker="Template snapshots">
          {selectedId ? (
            <div className="space-y-3">
              {versionsPending && !selectedVersions.length ? (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/74">Loading template history...</div>
              ) : selectedVersions.length ? (
                selectedVersions.map((version) => (
                  <div key={version.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill label={`v${version.versionNumber}`} state="neutral" />
                      {selectedTemplate?.currentVersion === version.versionNumber ? <StatusPill label="current" state="healthy" /> : null}
                      <span className="text-sm text-slate-300/76">{new Date(version.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 text-sm font-medium text-white">{version.subject}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300/72">{version.description || 'No change note captured for this snapshot.'}</p>
                    <button
                      onClick={() => loadVersion(version)}
                      className="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
                    >
                      Load snapshot
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/74">
                  No saved versions yet. The next template save will create the first reusable snapshot.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/74">
              Choose a template to inspect its saved versions and restore older snapshots into the editor.
            </div>
          )}
        </Panel>

        {feedback ? (
          <Panel title={feedback.title} kicker="Template response">
            <div className="space-y-3 text-sm leading-6 text-slate-300/76">
              <StatusPill label={feedback.tone} state={feedback.tone} />
              <p>{feedback.body}</p>
            </div>
          </Panel>
        ) : null}

        <Panel title="Template policy" kicker="Phase 2 groundwork">
          <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
            <li>Every save now creates a version snapshot so operator-grade templates can evolve without losing good prior states.</li>
            <li>Keep HTML and text versions aligned so preflight does not flag structure drift.</li>
            <li>Seed lab runs can launch directly from these stored subject/body pairs.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
