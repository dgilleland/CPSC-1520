// Core types for the code-reading experience

export type VarType = "number" | "string" | "Array" | "boolean" | "object";

// Variable definitions (optional global info about your tracked variables)
export interface VariableSpec {
  name: string;
  type: VarType;
  value: unknown;
}

/**
 * A scalar expected value (shown in JSON guide under "expect": { varName: "…" } )
 * We don't force JSON type here; guide authors can keep them as strings for readability.
 */
export type ExpectScalar = string | number | boolean;

/**
 * Array expectation (shown in JSON guide under "expect": { varName: { … } })
 * - length: how many elements to consider on this step
 * - current: UI hints for the student; use "" where you want them to type
 * - expected: ground truth values
 * - itemType (optional): tells the UI to use the right input control for array elements
 */
export interface ExpectArray {
  length?: number;
  current?: (string | number | boolean)[];
  expected: (string | number | boolean)[];
  itemType?: Extract<VarType, "number" | "string" | "boolean">;
}

export type ExpectValue = ExpectScalar | ExpectArray;

export interface Step {
  line: number;
  expect: Record<string, ExpectValue>; // variable name -> expectation
}

export interface GuideJson {
  codeBlock: string;           // URL to the JS/TS file shown in the code block
  variables: VariableSpec[];   // variable catalog (optional but recommended)
  steps: Step[];
}

/**
 * PromptField is produced by your UI (e.g., CodeReader) for a single student input.
 * Keep it generic so renderers (Svelte components) can interpret & display appropriately.
 */
export type PromptField =
  | {
      kind: "scalar";
      varName: string;
      label: string;
      expected: string | number | boolean;
      value: string | number | boolean;
    }
  | {
      kind: "array-slot";
      varName: string;
      index: number;
      label: string;
      expected: string | number | boolean;
      value: string | number | boolean;
      // Optional UI hint for this slot; if omitted, UI will infer from expected/varTypes
      itemTypeHint?: Extract<VarType, "number" | "string" | "boolean">;
    };

export interface ValidationResult {
  ok: boolean;
  details: string[];
}

/**
 * Runtime helpers (optional): common coercions the UI may use.
 * You can import and reuse these if you validate in other places.
 */
export function coerceToType(
  value: unknown,
  target:
    | "number"
    | "string"
    | "boolean"
): number | string | boolean | typeof NaN {
  switch (target) {
    case "number": {
      if (typeof value === "number") return value;
      const n = Number(String(value).trim());
      return n;
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      const s = String(value).trim().toLowerCase();
      // Accept common truthy/falsey user inputs
      if (["true", "1", "yes", "y", "on", "checked"].includes(s)) return true;
      if (["false", "0", "no", "n", "off", "unchecked"].includes(s)) return false;
      // Fallback: non-empty => true
      return Boolean(s);
    }
    case "string":
    default:
      return String(value);
  }
}

export function looseEqualByType(
  a: unknown,
  b: unknown,
  t: "number" | "string" | "boolean"
): boolean {
  const av = coerceToType(a, t);
  const bv = coerceToType(b, t);
  if (t === "number") {
    return typeof av === "number" && typeof bv === "number" && !Number.isNaN(av) && !Number.isNaN(bv) && av === bv;
  }
  return av === bv;
}
