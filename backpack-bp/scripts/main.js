import { world, system, Player, ItemStack, Container, EntityInventoryComponent } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// ============================================================================
// BACKPACK MOD - Main Script
// ============================================================================
// Features:
//   - Cosmetic backpack rendered on player's back via Bauble API
//   - Storage inventory (18 slots)
//   - Custom backpack item with texture
//   - Server-synced to other players
// ============================================================================

// -- CONFIGURATION -------------------------------------------------------
const BACKPACK_ITEM_ID = "backpack:backpack";
const BACKPACK_BAUBLE_SLOT = "back"; // Bauble slot for back accessories
const STORAGE_SIZE = 18;

// -- STATE -----------------------------------------------------------
const playerStorage = new Map(); // playerId -> ItemStack[]

// ============================================================================
// BAUBLE API - Backpack Cosmetic Rendering
// ============================================================================
// Registers the backpack as a bauble so it renders on the player's back

export function registerBaubleBackpack() {
  try {
    // Register the backpack bauble type
    const BaubleModule = require("@minecraft/bauble");
    if (BaubleModule) {
      BaubleModule.register({
        id: "backpack:backpack_bauble",
        slot: BACKPACK_BAUBLE_SLOT,
        render: {
          mesh: "geometry.backpack",
          textures: {
            default: "textures/models/backpack"
          }
        },
        onEquip: (player, slot) => {
          console.warn("Backpack equipped on: " + player.name);
        },
        onUnequip: (player, slot) => {
          console.warn("Backpack removed from: " + player.name);
        }
      });
    }
  } catch (e) {
    // Bauble not available - fallback render handled by animation controller
    console.warn("Bauble API unavailable, using fallback rendering");
  }
}

// ============================================================================
// STORAGE SYSTEM
// ============================================================================

function getOrCreateStorage(player) {
  if (!playerStorage.has(player.id)) {
    playerStorage.set(player.id, new Array(STORAGE_SIZE).fill(null));
  }
  return playerStorage.get(player.id);
}

function openStorageUI(player) {
  const storage = getOrCreateStorage(player);

  // Build inventory list
  let form = new ActionFormData()
    .title("Backpack Storage")
    .body(`Slots: ${storage.filter(s => s !== null).length}/${STORAGE_SIZE}`);

  // Add take/put options
  form.button("§aTake Item§r", "textures/ui/inventory");
  form.button("§bPut Item§r", "textures/ui/chest");

  form.show(player).then(result => {
    if (result.selection === 0) {
      showTakeItemForm(player);
    } else if (result.selection === 1) {
      showPutItemForm(player);
    }
  }).catch(e => console.error("Form error: " + e));
}

function showTakeItemForm(player) {
  const storage = getOrCreateStorage(player);

  // List items in backpack
  const items = storage
    .map((item, idx) => ({ item, index: idx }))
    .filter(({ item }) => item !== null);

  if (items.length === 0) {
    player.sendMessage("§c[Backpack] §fBackpack is empty!");
    return;
  }

  let form = new ModalFormData()
    .title("Take from Backpack")
    .dropdown("Select Item:", items.map(({ item, index }) =>
      `${item.typeId} x${item.amount} (slot ${index + 1})`
    ))
    .slider("Amount:", 1, items[0]?.item.amount ?? 1, 1);

  form.show(player).then(result => {
    if (result.canceled) return;

    const [{ item, index }] = [items[result.formValues[0]]];
    const amount = result.formValues[1];

    // Transfer to player inventory
    const taken = new ItemStack(item.typeId, amount);
    const playerInv = player.getComponent("Inventory")?.container;
    if (playerInv) {
      const remaining = addToInventory(playerInv, taken);
      if (remaining.amount === 0) {
        storage[index] = null;
        player.sendMessage(`§a[Backpack] §fTook ${amount}x ${item.typeId}`);
      } else {
        player.sendMessage(`§c[Backpack] §fInventory full! (put back ${remaining.amount})`);
      }
    }
  }).catch(e => console.error("Form error: " + e));
}

function showPutItemForm(player) {
  const storage = getOrCreateStorage(player);
  const playerInv = player.getComponent("Inventory")?.container;

  if (!playerInv) return;

  // List player's main inventory items
  let form = new ModalFormData()
    .title("Put in Backpack");

  let itemOptions = [];
  for (let i = 0; i < playerInv.size; i++) {
    const item = playerInv.getItem(i);
    if (item) {
      itemOptions.push({ item, index: i });
    }
  }

  if (itemOptions.length === 0) {
    player.sendMessage("§c[Backpack] §fNo items in your inventory!");
    return;
  }

  form.dropdown("Select Item:", itemOptions.map(({ item, index }) =>
    `${item.typeId} x${item.amount} (inv slot ${index})`
  ));
  form.slider("Amount:", 1, itemOptions[0]?.item.amount ?? 1, 1);

  form.show(player).then(result => {
    if (result.canceled) return;

    const [{ item, index }] = [itemOptions[result.formValues[0]]];
    const amount = result.formValues[1];
    const itemToStore = new ItemStack(item.typeId, amount);

    // Find empty slot or stack
    let stored = false;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i] === null) {
        storage[i] = itemToStore;
        playerInv.setItem(index, null);
        stored = true;
        player.sendMessage(`§a[Backpack] §fStored ${amount}x ${item.typeId}`);
        break;
      }
    }

    if (!stored) {
      player.sendMessage("§c[Backpack] §fNo space left in backpack!");
    }
  }).catch(e => console.error("Form error: " + e));
}

function addToInventory(container, item) {
  // Try to stack with existing items first
  for (let i = 0; i < container.size; i++) {
    const existing = container.getItem(i);
    if (existing && existing.typeId === item.typeId) {
      const space = 64 - existing.amount;
      if (space > 0) {
        const toAdd = Math.min(space, item.amount);
        existing.amount += toAdd;
        container.setItem(i, existing);
        item.amount -= toAdd;
        if (item.amount === 0) return item;
      }
    }
  }

  // Try empty slots
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) {
      container.setItem(i, item.amount <= 64 ? item : new ItemStack(item.typeId, 64));
      return new ItemStack(item.typeId, Math.max(0, item.amount - 64));
    }
  }

  return item; // Returns remainder
}

// ============================================================================
// ITEM HANDLER
// ============================================================================

world.afterEvents.itemUse.subscribe((event) => {
  const { item, source } = event;

  if (!(source instanceof Player)) return;
  if (item.typeId !== BACKPACK_ITEM_ID) return;

  system.run(() => {
    openStorageUI(source);
  });
});

// ============================================================================
// EQUIPMENT SYNC - Other players see the backpack
// ============================================================================

world.afterEvents.inventoryChunkDirty.subscribe((event) => {
  const player = event.player;
  if (!(player instanceof Player)) return;

  const inv = player.getComponent("Inventory")?.container;
  if (!inv) return;

  // Check if backpack is in any slot (equipped or carried)
  const hasBackpack = inv.findItem(i => i?.typeId === BACKPACK_ITEM_ID);

  // Sync bauble state to nearby players
  try {
    const BaubleModule = require("@minecraft/bauble");
    if (BaubleModule && hasBackpack) {
      BaubleModule.equip(player, "backpack:backpack_bauble");
    } else if (BaubleModule) {
      BaubleModule.unequip(player, "backpack:backpack_bauble");
    }
  } catch (e) {
    // Bauble not available
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

system.run(() => {
  registerBaubleBackpack();
  world.getAllPlayers().forEach(player => {
    player.sendMessage("§6[Backpack] §fBackpack mod loaded!");
  });
});

console.warn("Backpack mod initialized");