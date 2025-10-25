<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { PromptField, VarType } from "../../lib/code-reader/types";
  import { coerceToType, looseEqualByType } from "../../lib/code-reader/types";

  /**
   * Props
   * - fields: per-step inputs (built by CodeReader)
   * - disabled: disable all inputs + button
   * - varTypes: optional varName -> VarType map (improves widget choice/validation)
   */
  const { 
    fields = [] as PromptField[], 
    disabled = false, 
    varTypes = {} as Record<string, VarType> 
  } = $props<{ fields?: PromptField[]; disabled?: boolean; varTypes?: Record<string, VarType> }>();

  const dispatch = createEventDispatcher<{ submit: { values: Record<string, unknown> } }>();

  // ⬇️ Annotate the `map` parameter
  let local = $state<PromptField[]>(fields.map((f: PromptField) => ({ ...f })));
  let errors = $state<string[]>([]);
  let showHints = $state(false);

  // Reset when inputs change for a new step
  $effect(() => {
    // ⬇️ Annotate here too
    local = fields.map((f: PromptField) => ({ ...f }));
    errors = [];
  });

  // ---- Helpers & validation ----

  type ScalarKind = "number" | "string" | "boolean";

  function resolveFieldKindType(f: PromptField): ScalarKind {
    // array-slot can carry an explicit hint
    if (f.kind === "array-slot" && f.itemTypeHint) return f.itemTypeHint;

    // If caller provided a var type, prefer that for scalars
    const vt = varTypes[f.varName];

    if (f.kind === "scalar") {
      if (vt === "number") return "number";
      if (vt === "boolean") return "boolean";
      return "string";
    }

    // array-slot without hint: infer from expected
    if (typeof f.expected === "number") return "number";
    if (typeof f.expected === "boolean") return "boolean";
    if (typeof f.expected === "string" && /^[-+]?\d+(\.\d+)?$/.test(f.expected.trim())) {
      return "number";
    }
    return "string";
  }

  function validate(): { ok: boolean; details: string[] } {
    const errs: string[] = [];
    for (const f of local) {
      const t = resolveFieldKindType(f);
      const ok = looseEqualByType(f.value, f.expected, t);
      if (!ok) errs.push(`${f.label} is not correct.`);
    }
    return { ok: errs.length === 0, details: errs };
  }

  function onSubmit(): void {
    const res = validate();
    errors = res.details;
    if (!res.ok) return;

    // Build a payload like { varName: scalar | [slot0, slot1, …] }
    const out: Record<string, unknown> = {};
    for (const f of local) {
      const t = resolveFieldKindType(f);
      if (f.kind === "scalar") {
        out[f.varName] = coerceToType(f.value, t);
      } else {
        out[f.varName] ??= [];
        (out[f.varName] as unknown[])[f.index] = coerceToType(f.value, t);
      }
    }
    dispatch("submit", { values: out });
  }

  function asString(v: string | number | boolean | null | undefined): string {
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v ?? "");
  }

  // Explicitly type the `f` parameter to avoid TS7006
  function onInputChangeScalar(
    f: Extract<PromptField, { kind: "scalar" }>,
    ev: Event
  ): void {
    const t = resolveFieldKindType(f);
    const el = ev.target as HTMLInputElement;
    if (t === "boolean") {
      f.value = el.checked;
    } else {
      // keep text/number as string until submit; coerce at submit time
      f.value = el.value;
    }
  }

  function onInputChangeArray(
    f: Extract<PromptField, { kind: "array-slot" }>,
    ev: Event
  ): void {
    const t = resolveFieldKindType(f);
    const el = ev.target as HTMLInputElement;
    if (t === "boolean") {
      f.value = el.checked;
    } else {
      f.value = el.value;
    }
  }
</script>

<style>
  aside { display: grid; gap: .75rem; padding: .75rem; border: 1px solid var(--sl-color-gray-6, #2a3342); border-radius: .75rem; }
  header { display: flex; justify-content: space-between; align-items: center; }
  .field { display: grid; gap: .25rem; }
  label { font-size: .85rem; color: #8aa1c1; }
  input[type="text"], input[type="number"] {
    border: 1px solid #334157; background: #0f1520; color: #e8eef6; border-radius: .5rem;
    padding: .5rem .625rem; outline: none;
  }
  input[type="text"]:focus, input[type="number"]:focus { border-color: #6aa6ff; box-shadow: 0 0 0 3px #6aa6ff33; }
  .checkbox-row { display: inline-flex; gap: .5rem; align-items: center; }
  .controls { display: inline-flex; gap: .75rem; align-items: center; }
  .toggle { display: inline-flex; gap: .4rem; align-items: center; font-size: .9rem; color: #9eb5d6; }
  button {
    padding: .55rem .9rem; border-radius: .6rem; border: 1px solid #2a3d63;
    background: #19335c; color: white; cursor: pointer;
  }
  button:disabled { opacity: .5; cursor: not-allowed; }
  .grid { display: grid; gap: .5rem; }
  .errors { color: #ff9b9b; font-size: .9rem; }
  .hint { font-size: .8rem; color: #99a9c4; }
</style>

<aside>
  <header>
    <strong>Predict the values</strong>
    <div class="controls">
      <label class="toggle">
        <input type="checkbox" bind:checked={showHints} />
        Show type hints
      </label>
    </div>
  </header>

  <div class="grid">
    {#each local as f: PromptField, idx}
      <div class="field">
        <label for={"f-" + idx}>{f.label}</label>

        {#if f.kind === "scalar"}
          {#if resolveFieldKindType(f) === "boolean"}
            <span class="checkbox-row">
              <input
                id={"f-" + idx}
                type="checkbox"
                checked={Boolean(f.value)}
                onchange={(e) => onInputChangeScalar(f, e)}
                {disabled} />
              {#if showHints}<span class="hint">Type: boolean</span>{/if}
            </span>
          {:else if resolveFieldKindType(f) === "number"}
            <input
              id={"f-" + idx}
              type="number"
              step="any"
              value={asString(f.value)}
              oninput={(e) => onInputChangeScalar(f, e)}
              placeholder="Enter number…"
              {disabled} />
            {#if showHints}<span class="hint">Type: number</span>{/if}
          {:else}
            <input
              id={"f-" + idx}
              type="text"
              value={asString(f.value)}
              oninput={(e) => onInputChangeScalar(f, e)}
              placeholder="Enter text…"
              {disabled} />
            {#if showHints}<span class="hint">Type: string</span>{/if}
          {/if}
        {:else} <!-- array-slot -->
          {#if resolveFieldKindType(f) === "boolean"}
            <span class="checkbox-row">
              <input
                id={"f-" + idx}
                type="checkbox"
                checked={Boolean(f.value)}
                onchange={(e) => onInputChangeArray(f, e)}
                {disabled} />
              {#if showHints}<span class="hint">{f.varName}[{f.index}] Type: boolean</span>{/if}
            </span>
          {:else if resolveFieldKindType(f) === "number"}
            <input
              id={"f-" + idx}
              type="number"
              step="any"
              value={asString(f.value)}
              oninput={(e) => onInputChangeArray(f, e)}
              placeholder={`Enter ${f.varName}[${f.index}]…`}
              {disabled} />
            {#if showHints}<span class="hint">{f.varName}[{f.index}] Type: number</span>{/if}
          {:else}
            <input
              id={"f-" + idx}
              type="text"
              value={asString(f.value)}
              oninput={(e) => onInputChangeArray(f, e)}
              placeholder={`Enter ${f.varName}[${f.index}]…`}
              {disabled} />
            {#if showHints}<span class="hint">{f.varName}[{f.index}] Type: string</span>{/if}
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  {#if errors.length}
    <div class="errors" role="alert">
      <ul>
        {#each errors as err}<li>{err}</li>{/each}
      </ul>
    </div>
  {/if}

  <button onclick={onSubmit} disabled={disabled}>Check & Continue</button>
</aside>
