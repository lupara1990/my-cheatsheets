# Backpack Mod - Minecraft Bedrock

A cosmetic backpack mod for Minecraft Bedrock using the Bauble API for body accessories.

## Features

- **Cosmetic rendering** on the player's back (via Bauble)
- **18-slot storage** accessible by right-clicking the backpack
- **Server-synced** — other players see the equipped backpack
- **Custom item** with chestplate armor slot / main hand hold

## File Structure

```
backpack-bp/                    # Behavior Pack
├── manifest.json
├── scripts/
│   └── main.js                # All mod logic
├── items/
│   └── backpack.json          # Item definition
└── entity/
    └── backpack_equipped.json # Cosmetic entity

backpack-rp/                    # Resource Pack
├── manifest.json
└── textures/
    ├── item_texture.json
    └── models/
        └── backpack.json      # (placeholder - add your geometry)
```

## Setup

### 1. Add Bauble API dependency

In `backpack-bp/manifest.json`, the `dependencies` array references:
- `@minecraft/server` - vanilla scripting API

The Bauble API itself is accessed at runtime via `require("@minecraft/bauble")`. If Bauble is not installed on the server, the cosmetic rendering will not function but storage still works.

### 2. Add your textures

Create placeholder textures (or replace with your own):

```
backpack-rp/textures/
├── items/
│   └── backpack.png           # Item icon (16x16)
└── models/
    └── backpack.png           # In-world / equipped texture
```

### 3. Add your geometry

In `backpack-rp/models/` add `backpack.json` (Bedrock model format):

```json
{
  "format_version": "1.12.0",
  "minecraft:geometry": {
    "geometry.backpack": {
      "box_uv": true,
      "parent": "",
      // ... your model here
    }
  }
}
```

### 4. Build your RP BP

Minecraft Bedrock loads behavior + resource packs from the `com.mojang/behavior_packs/` and `com.mojang/resource_packs/` directories.

## Usage

1. Equip the backpack (hold in hand or put in chest armor slot)
2. Right-click to open the 18-slot storage UI
3. Other players see the backpack on your back

## Configuration

In `main.js`:
- `BACKPACK_ITEM_ID` - item identifier
- `BACKPACK_BAUBLE_SLOT` - `"back"` for back rendering (other slots: `"head"`, `"hand"`, `"shield"`)
- `STORAGE_SIZE` - default 18 slots