<script lang="ts">
  import { onMount } from "svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import PredictionsPanel from "./PredictionsPanel.svelte";

  import type {
    GuideJson, Step, ExpectArray, ExpectValue, PromptField, VarType
  } from "../../lib/code-reader/types";
  import { coerceToType } from "../../lib/code-reader/types";

  const { guideUrl } = $props<{ guideUrl: string }>();

  // Loaded assets
  let guide = $state<GuideJson | null>(null);
  let codeText = $state("");

  // varName -> VarType (built from guide.variables)
  let varTypes = $state<Record<string, VarType>>({});

  // Step state
  let stepIndex = $state(0);
  let activeLine = $state(-1);

  // Current inputs to render
  let fields = $state<PromptField[]>([]);

  // UX
  let loading = $state(true);
  let error = $state<string | null>(null);
  let totalSteps = $state(0);

  // Derived flags
  const hasPrev = $derived(stepIndex > 0);

  onMount(async () => {
    try {
      const gRes = await fetch(guideUrl);
      if (!gRes.ok) throw new Error(`Failed to load guide: ${gRes.status}`);
      guide = await gRes.json();

      // Build varTypes map from guide.variables (if present)
      varTypes = Object.fromEntries((guide?.variables ?? []).map(v => [v.name, v.type]));

      const cRes = await fetch(guide!.codeBlock);
      if (!cRes.ok) throw new Error(`Failed to load code: ${cRes.status}`);
      codeText = await cRes.text();

      totalSteps = guide!.steps.length;
      applyStep(0);
      loading = false;
    } catch (e: any) {
      error = e?.message ?? "Unknown load error";
      loading = false;
    }
  });

  // ---- Helpers

  function isArrayExpect(v: ExpectValue): v is ExpectArray {
    return typeof v === "object" && v !== null && "expected" in v;
  }

  function normalizeExpectedScalar(varName: string, raw: unknown): string | number | boolean {
    const vt = varTypes[varName];
    if (vt === "number") return coerceToType(raw, "number") as number;
    if (vt === "boolean") return coerceToType(raw, "boolean") as boolean;
    return coerceToType(raw, "string") as string;
  }

  function inferItemTypeFromValue(v: unknown): "number" | "string" | "boolean" {
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "string" && /^[-+]?\d+(\.\d+)?$/.test(v.trim())) return "number";
    return "string";
  }

  // ---- Build prompt inputs for a step (type-aware)
  function buildFields(step: Step): PromptField[] {
    const list: PromptField[] = [];

    for (const [varName, exp] of Object.entries(step.expect)) {
      if (isArrayExpect(exp)) {
        const length = exp.length ?? exp.expected.length;
        const current = (exp.current ?? new Array(length).fill("")).slice(0, length);
        const expected = exp.expected.slice(0, length);

        // Choose item type hint:
        // 1) explicit from guide: exp.itemType
        // 2) inferred from first expected element
        const itemTypeHint =
          exp.itemType ??
          (expected.length > 0 ? inferItemTypeFromValue(expected[0]) : "string");

        for (let i = 0; i < length; i++) {
          const cur = current[i] ?? "";
          const goal = expected[i] ?? "";

          // Coerce goal to chosen item type for robust validation
          const coercedGoal =
            itemTypeHint === "number"
              ? (coerceToType(goal, "number") as number)
              : itemTypeHint === "boolean"
              ? (coerceToType(goal, "boolean") as boolean)
              : (coerceToType(goal, "string") as string);

          // Only ask for input when blank or incorrect (guided practice)
          const curStr = String(cur);
          const goalStr = String(coercedGoal);
          const needsInput = curStr === "" || curStr !== goalStr;

          if (needsInput) {
            list.push({
              kind: "array-slot",
              varName,
              index: i,
              label: `${varName}[${i}]`,
              expected: coercedGoal,
              value: curStr,
              itemTypeHint
            });
          }
        }
      } else {
        // Scalar: coerce expected based on varTypes map
        const coerced = normalizeExpectedScalar(varName, exp);
        list.push({
          kind: "scalar",
          varName,
          label: varName,
          expected: coerced,
          value: (varTypes[varName] === "boolean" ? false : "") as any
        });
      }
    }

    return list;
  }

  // ---- Step navigation
  function applyStep(nextIndex: number) {
    if (!guide) return;
    stepIndex = nextIndex;
    const step = guide.steps[stepIndex];
    activeLine = step.line;
    fields = buildFields(step);
    focusLine(step.line);
  }

  function focusLine(line: number) {
    // Scroll the active line into view (after DOM updates)
    queueMicrotask(() => {
      const el = document.querySelector(`[data-line="${line}"] mark.active`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function goPrev() {
    if (stepIndex > 0) applyStep(stepIndex - 1);
  }

  function handleSubmit(_e: CustomEvent<{ values: Record<string, unknown> }>) {
    if (!guide) return;
    const next = stepIndex + 1;
    if (next < guide.steps.length) {
      applyStep(next);
    } else {
      // Finished
      activeLine = -1;
      fields = [];
    }
  }
</script>

<style>
  .wrap { display: grid; gap: 1rem; }
  .controls {
    display: flex; gap: .5rem; align-items: center; flex-wrap: wrap;
  }
  .controls button {
    padding: .5rem .8rem; border-radius: .6rem; border: 1px solid #2a3d63;
    background: #132646; color: white; cursor: pointer;
  }
  .controls button:disabled { opacity: .5; cursor: not-allowed; }
  .hud { margin-left: auto; color: #9eb5d6; }
  .layout { display: grid; grid-template-columns: 1fr minmax(280px, 360px); gap: 1rem; align-items: start; }
  .done {
    padding: .75rem; border-radius: .75rem; background: #0e1f3a; color: #b8ffbf; border: 1px solid #1e3a5f;
  }
</style>

{#if loading}
  <p>Loading…</p>
{:else if error}
  <p style="color:#ff7b7b">Error: {error}</p>
{:else if guide}
  <div class="wrap">
    <div class="controls" aria-label="Navigation">
      <button onclick={goPrev} disabled={!hasPrev}>Previous Line</button>
      <span class="hud">Step {stepIndex + 1} / {totalSteps}{activeLine > -1 ? ` — focus line ${activeLine}` : ""}</span>
    </div>

    <div class="layout">
      <CodeBlock code={codeText} {activeLine} />

      {#if fields.length > 0}
        <!-- Pass varTypes so PredictionsPanel can render type-appropriate inputs -->
        <PredictionsPanel {fields} {varTypes} on:submit={handleSubmit} />
      {:else}
        <div class="done">All steps completed. 🎉</div>
      {/if}
    </div>
  </div>
{/if}
