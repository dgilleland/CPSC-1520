<script lang="ts">
  const { code = "", activeLine = -1 } = $props<{ code?: string; activeLine?: number }>();

  const lines = $derived(code.split(/\r?\n/));
</script>

<style>
  pre {
    counter-reset: line;
    padding: 0.75rem 1rem;
    background: var(--sl-color-gray-8, #0b0d12);
    color: var(--sl-color-gray-1, #e8eef6);
    border-radius: 0.75rem;
    overflow: auto;
  }
  code { display: block; }
  .line {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .75rem;
    align-items: start;
    padding: .125rem .25rem;
    border-radius: .375rem;
    margin-top: 0;
  }
  .line mark {
    font-variant-numeric: tabular-nums;
    background: transparent;
    color: #8aa1c1;
    user-select: none;
    padding: 0 .25rem;
    border-radius: .25rem;
    min-width: 2ch;
    text-align: right;
  }
  .line mark.active {
    background: #2a3d63;
    color: white;
  }
  .line .text { white-space: pre; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
</style>

<pre aria-label="Source code"><code>{#each lines as ln, i}<div class="line" data-line={i + 1}><mark class:active={i + 1 === activeLine} data-line-number={i + 1}>{i + 1}</mark><span class="text">{ln}</span></div>{/each}</code></pre>
