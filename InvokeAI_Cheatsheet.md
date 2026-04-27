# 🎨 InvokeAI Cheatsheet

A comprehensive guide to the InvokeAI creative engine, covering WebUI shortcuts, CLI commands, and core features.

## ⌨️ WebUI Keyboard Shortcuts
*Access the Hotkeys Modal with `Shift + ?` to customize these.*

### Main Application
| Action | Shortcut |
| :--- | :--- |
| **Invoke Action** | `Ctrl + Enter` |
| **Invoke Action (Front of Queue)** | `Ctrl + Shift + Enter` |
| **Cancel Current Queue Item** | `Shift + X` |
| **Clear Queue** | `Ctrl + Shift + X` |
| **Focus on Prompt** | `Alt + A` |
| **Toggle Left Panel** | `T` or `O` |
| **Toggle Right Panel** | `G` |
| **Toggle All Panels** | `F` |
| **Reset Panel Layout** | `Shift + R` |
| **Switch Tabs** | `1` (Canvas), `2` (Upscaling), `3` (Workflows), `4/5` (Models/Queue) |

### Canvas (Drawing & Editing)
| Action | Shortcut |
| :--- | :--- |
| **Move Tool** | `V` |
| **Brush Tool** | `B` |
| **Eraser Tool** | `E` |
| **Bbox Tool** | `C` |
| **Rect Tool** | `U` |
| **View Tool** | `H` |
| **Color Picker** | `I` |
| **Tool Width** | `[` (Decrease) / `]` (Increase) |
| **Zoom** | `Ctrl + 0` (Fit Layers), `Ctrl + 1` (100%), `Ctrl + 2` (200%) |
| **Undo / Redo** | `Ctrl + Z` / `Ctrl + Shift + Z` |
| **Layer Navigation** | `Alt + [` (Prev) / `Alt + ]` (Next) |

### Workflows & Viewer
| Action | Shortcut |
| :--- | :--- |
| **Add Node** | `Shift + A` or `Space` |
| **Toggle Viewer** | `Z` |
| **Remix** | `R` |
| **Recall Seed/Prompt** | `S` (Seed), `P` (Prompt) |
| **Load Workflow** | `W` |

---

## 💻 CLI Commands & Usage
Accessed via the launcher or by running `invokeai`.

### Generation Arguments
Used after the `invoke>` prompt (e.g., `invoke> a futuristic city -W 640 -H 480 -n 4`):
- `-W` / `--width`: Image width (multiple of 64).
- `-H` / `--height`: Image height.
- `-n` / `--iterations`: Number of images.
- `-s` / `--steps`: Refinement steps.
- `-C` / `--cfg_scale`: Guidance scale (typically 5.0 - 20.0).
- `-S` / `--seed`: Set random seed.
- `-A` / `--sampler`: Select sampler.
- `-g` / `--grid`: Save results as a grid.
- `-I` / `--init_img`: Path for img2img initialization.
- `-M` / `--init_mask`: Path for inpainting mask.

### Administrative Commands (`!`)
- `!models`: List defined models and show active one.
- `!switch [model_name]`: Switch loaded models.
- `!import_model [path/url]`: Install model from HuggingFace or local disk.
- `!fix [filename]`: Upscale or face restoration post-processing.
- `!history`: Show numbered command history.
- `!fetch [filename]`: Retrieve parameters used for a specific image.
- `!search [term]`: Search command history.

---

## 🚀 Core Features
- **Unified Canvas:** Layer-based environment for img2img, inpainting, and outpainting.
- **Node-Based Workflows:** Visual graph backend for building complex, reproducible pipelines.
- **Model Management:** Intuitive manager for Flux, SDXL, and SD 1.5.
- **ControlNet Mastery:** Precision compositional control via depth, edges, and poses.
- **Local & Private:** 100% self-hosted for maximum privacy and control.

---
*Generated for the InvokeAI community.*
