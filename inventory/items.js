const itemsDB = {
    weapons: typeof itemsWeapons !== 'undefined' ? itemsWeapons : [],
    armor: typeof itemsArmor !== 'undefined' ? itemsArmor : [],
    potions: typeof itemsPotions !== 'undefined' ? itemsPotions : [],
    gear: typeof itemsGear !== 'undefined' ? itemsGear : []
};
const itemsDBAll = [...itemsDB.weapons, ...itemsDB.armor, ...itemsDB.potions, ...itemsDB.gear];