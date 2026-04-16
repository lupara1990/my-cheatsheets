# ComfyUI Complete Guide
## From Basics to Midjourney-Quality Results

---

# PART A: ComfyUI Cheatsheet - Essential Nodes & Concepts

---

## Core Nodes You Need to Know

| Node | Purpose | Key Parameters |
|------|---------|----------------|
| **Load Checkpoint** | Loads your base model (SD 1.5, SDXL, SD3, Flux) | `ckpt_name` - select your .safetensors or .ckpt file |
| **Load LoRA** | Applies LoRA weights to your model | `lora_name`, `strength_model`, `strength_clip` |
| **CLIP Text Encode** | Converts text prompts into embeddings | Positive and negative prompt inputs |
| **Empty Latent Image** | Creates the initial noise canvas | `width`, `height`, `batch_size` |
| **KSampler** | The actual diffusion sampling process | `seed`, `steps`, `cfg`, `sampler_name`, `scheduler` |
| **VAEDecode** | Converts latent space to pixel image | VAE + latent input |
| **VAEEncode** | Converts image to latent space (for img2img/inpainting) | VAE + pixel image input |
| **Save Image** | Outputs your final image | `filename_prefix` |
| **Load Image** | Loads images for img2img/inpainting | `image` file upload |
| **Upscale Model Loader** | Loads ESRGAN/RealESRGAN upscalers | `model_name` |
| **ImageUpscaleWithModel** | Applies upscale model to image | Takes upscale model + image |

---

## Advanced/Must-Know Nodes

| Node | Purpose |
|------|---------|
| **ControlNet Apply** | Applies ControlNet conditioning (depth, pose, canny, etc.) |
| **IPAdapter Apply** | Style/face transfer from reference images |
| **Conditioning (Set Mask)** | For inpainting - masks where to regenerate |
| **Latent Composite** | Combines multiple latent images |
| **Reroute** | Organizes noodles - aesthetic + organizational |
| **Primitive** | Exposes parameters for easy tweaking |

---

## Key Concepts

### 1. The Basic Flow (Text2Img)
```
Load Checkpoint -> CLIP Encode (prompt) -> Empty Latent -> KSampler -> VAEDecode -> Save Image
```

### 2. Understanding KSampler Parameters

- **Seed**: Random seed for reproducibility (-1 = random)
- **Steps**: 20-30 is standard, 30-50 for quality, 4-8 for fast samplers
- **CFG (Classifier Free Guidance)**: 7-8 is default. Higher = more prompt adherence but can over-saturate
- **Sampler**: `dpmpp_2m`, `dpmpp_sde`, `euler`, `euler_ancestral` are most popular
- **Scheduler**: `normal`, `karras`, `exponential`. Karras is generally best

### 3. Latent Space
- Images are generated in compressed latent space (typically 64x64 or 128x128)
- SD 1.5 latent: 512x512 -> 64x64 (8x compression)
- SDXL latent: 1024x1024 -> 128x128
- Flux: 1024x1024 -> use specific Flux VAE

---

# PART B: Midjourney-Quality Setup Guide

---

## Step 1: Model Selection (Critical for Quality)

### Best Checkpoint Options for Midjourney-like Quality

| Model | Type | Best For |
|-------|------|----------|
| **Juggernaut XL** | SDXL | Photorealism, versatility |
| **RealVisXL** | SDXL | Photorealistic portraits |
| **ProtoVision XL** | SDXL | Artistic, painterly styles |
| **SDXL Base + Refiner** | SDXL | Native SDXL workflow |
| **Flux.1 Dev** | Flux | Current SOTA quality |
| **Flux.1 Schnell** | Flux | Fast, local generation |

**Recommended:** Flux.1 Dev or Juggernaut XL v9 for best Midjourney alternatives.

---

## Step 2: Essential Downloads

```bash
# 1. Install ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt

# 2. Model paths
# Checkpoints -> ComfyUI/models/checkpoints/
# LoRAs -> ComfyUI/models/loras/
# VAEs -> ComfyUI/models/vae/
# ControlNet -> ComfyUI/models/controlnet/
# Upscalers -> ComfyUI/models/upscale_models/
```

---

## Step 3: Recommended Supporting Models

### VAEs
- **SDXL:** sdxl_vae.safetensors
- **SD 1.5:** vae-ft-mse-840000-ema-pruned.ckpt
- **Flux:** ae.safetensors (comes with Flux)

### Upscalers
- 4x-UltraSharp.pth
- 4x-RealResRGAN.pth
- 4x_NMKD-Superscale-SP_178000_G.pth

### ControlNets (for precision)
- controlnet-canny-sdxl
- controlnet-depth-sdxl
- controlnet-openpose

---

## Step 4: The "90% Midjourney" Workflow

### Node-by-Node Setup for Best Quality

1. **Load Checkpoint** [Juggernaut XL v9 or Flux Dev]
   - Connect to KSampler and CLIP Text Encode

2. **CLIP Text Encode (Positive)**
   - Prompt: `masterpiece, best quality, cinematic lighting, 8k uhd, dslr, film grain, Fujifilm XT3, [your subject]`

3. **CLIP Text Encode (Negative)**
   - Prompt: `(worst quality:1.4), (low quality:1.4), (normal quality:1.4), lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username, blurry, artist name`

4. **Empty Latent Image**
   - Width: 1024 (SDXL/Flux) or 512 (SD 1.5)
   - Height: 1024 or 768 (portrait) or 1344 (landscape)
   - Batch Size: 1-4

5. **KSampler** [CONNECTED HERE]
   - Seed: -1 (or fixed for consistency)
   - Steps: 30-40 (SDXL), 4-8 (Flux with specific schedulers)
   - CFG: 6-8 (SDXL), 1-3 (Flux)
   - Sampler: dpmpp_2m_sde (SDXL) or euler (Flux)
   - Scheduler: karras (SDXL)
   - Denoise: 1.0 (full generation)

6. **VAEDecode** -> Save Image

7. **[Optional] Upscale**
   - Load Upscale Model -> ImageUpscaleWithModel -> Save Image

---

## Step 5: Prompting Like Midjourney

### Midjourney-Style Prompt Structure
```
[Quality tags], [Subject], [Action/Pose], [Environment/Background], 
[Lighting], [Camera/Style], [Artist/Medium]
```

### Example Prompt
```
masterpiece, best quality, 8k uhd, cinematic film still, portrait of a 
cyberpunk samurai, neon-lit street in Tokyo, heavy rain, volumetric fog, 
red and blue neon lights reflecting on wet armor, shallow depth of field, 
bokeh, shot on Arri Alexa 35, anamorphic lens flare, film grain, 
color graded teal and orange
```

### Key Midjourney-Style Keywords

**Cinematic/Film:**
- `cinematic`, `film still`, `movie still`
- `bokeh`, `depth of field`, `shallow depth of field`

**Lighting:**
- `golden hour`, `blue hour`, `magic hour`
- `volumetric lighting`, `god rays`, `atmospheric`

**Camera/Film Stock:**
- `35mm`, `medium format`, `large format`
- `Kodak Portra`, `Fujifilm`, `Ilford`

**Lens Effects:**
- `anamorphic`, `lens flare`, `chromatic aberration`

---

## Step 6: Getting Even Closer to Midjourney

### Option 1: Use MJ-Style LoRAs
- Download "Midjourney Style" LoRAs from CivitAI
- Apply at 0.6-0.8 strength

### Option 2: Use IP-Adapter
- Load a Midjourney-generated reference image
- Use IPAdapter Unified Loader + IPAdapter Encoder + IPAdapter Apply
- Weight: 0.7-1.0 for strong style transfer

### Option 3: Ultimate Quality Pipeline (Hi-Res Fix Equivalent)
```
KSampler (base 1024px) -> VAEDecode -> 
[Upscale by 1.5-2x using 4x-UltraSharp] -> 
VAEEncode -> KSampler (img2img, denoise 0.4-0.5, steps 15-20) -> 
VAEDecode -> Save
```

---

## Step 7: Recommended Custom Nodes

Install via ComfyUI Manager:

| Node Pack | Purpose |
|-----------|---------|
| **ComfyUI-Manager** | Essential - manage other nodes |
| **ComfyUI-Impact-Pack** | Detailed face detailers |
| **ComfyUI-ControlNet-Aux** | Preprocessors |
| **ComfyUI_IPAdapter_plus** | Style/face transfer |
| **ComfyUI-Efficiency-Nodes** | Simplified workflows |

---

## Quick Reference: Recommended Settings

### For SDXL (Juggernaut XL, RealVisXL)
| Setting | Value |
|---------|-------|
| Resolution | 1024x1024 or 896x1152 |
| Steps | 30-40 |
| CFG | 6-8 |
| Sampler | dpmpp_2m_sde |
| Scheduler | karras |

### For Flux
| Setting | Value |
|---------|-------|
| Resolution | 1024x1024 or 1216x832 |
| Steps | 4-8 (with appropriate scheduler) |
| CFG | 1-3 |
| Sampler | euler or dpmpp_2m |

### For SD 1.5
| Setting | Value |
|---------|-------|
| Resolution | 512x512 or 512x768 |
| Steps | 20-30 |
| CFG | 7-8 |
| Sampler | dpmpp_2m |
| Scheduler | karras |

---

## Resources & Links

- **ComfyUI GitHub:** https://github.com/comfyanonymous/ComfyUI
- **CivitAI (Models):** https://civitai.com
- **HuggingFace (Models):** https://huggingface.co/models
- **ComfyUI Examples:** https://comfyanonymous.github.io/ComfyUI_examples/

---

*Generated for ComfyUI Learning - 2026*
