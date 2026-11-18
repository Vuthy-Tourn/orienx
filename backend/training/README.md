# Fine-Tuning Futera's Advisor (Phase 4)

Fine-tuning is the last step, not the first. It changes **style, format, Khmer fluency, refusal behavior, and tool-result summarization** — not facts. Tuition, deadlines, and eligibility must continue to come from PostgreSQL through retrieval and tools.

## Gate: 500+ good examples

```bash
cd backend
source venv/bin/activate

# 1. Check the data gate
python scripts/check_training_readiness.py

# 2. Export the approved examples (thumbs-down rows are excluded)
python scripts/export_ai_training_data.py --output data/ai_training_data.jsonl
```

The export uses the standard chat format:

```json
{"messages": [
  {"role": "system", "content": "..."},
  {"role": "user", "content": "..."},
  {"role": "assistant", "content": "..."}
]}
```

## Recommended recipe

- Base model: `gemma3:12b` (or `gemma3:4b` for a cheaper/faster experiment)
- Method: **QLoRA**, 4-bit, LoRA rank 16, alpha 32, dropout 0.05
- Target modules: attention projections (`q_proj`, `k_proj`, `v_proj`, `o_proj`) and MLP projections
- Epochs: 1–2 (more overfits a small dataset)
- Learning rate: `2e-4`, cosine schedule, warmup 3%
- Batch size: 1–2 with gradient accumulation 8–16
- Max sequence length: 2048
- Hardware: one 24 GB GPU (RTX 4090 / L4 / A10) or Apple Silicon via MLX

A minimal install for a CUDA machine:

```bash
pip install torch transformers datasets peft accelerate trl bitsandbytes
```

A typical TRL `SFTTrainer` setup formats each row with the tokenizer's chat template, masks the prompt tokens, and trains only the assistant completion. Keep a held-out 10% split.

## Evaluate before and after

Always compare against the 100-question set:

```bash
python scripts/evaluate_advisor.py --mode hybrid --with-model --limit 20
```

Fine-tune only if it improves Khmer quality or format compliance **without** lowering factual accuracy or refusal behavior. If the score drops, do not merge the adapter.

## Export back to Ollama

1. Merge the LoRA adapter into the base model.
2. Convert the merged model to GGUF with `llama.cpp`'s `convert_hf_to_gguf.py`.
3. Quantize to `Q4_K_M`.
4. Register it:

```bash
ollama create futera-advisor:12b -f training/Modelfile.example
```

Then set:

```env
AI_OLLAMA_MODEL=futera-advisor:12b
```

## What not to train

- tuition fees, scholarship deadlines, admission rules, or eligibility thresholds
- student names, emails, phone numbers, or assessment answers
- facts that change every intake cycle

Those belong in the source database and RAG layer. Re-run `sync_knowledge_embeddings.py` after catalogue updates.
