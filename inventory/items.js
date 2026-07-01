// Этот файл собирает все подключенные массивы предметов в единую базу данных itemsDB
const itemsDB = {
    weapons: typeof itemsWeapons !== 'undefined' ? itemsWeapons : [],
    armor: typeof itemsArmor !== 'undefined' ? itemsArmor : [],
    potions: typeof itemsPotions !== 'undefined' ? itemsPotions : [],
    gear: typeof itemsGear !== 'undefined' ? itemsGear : []
};

// Плоский массив (опционально, для быстрого поиска, о котором мы говорили ранее)
const itemsDBAll = [].concat(itemsDB.weapons, itemsDB.armor, itemsDB.potions, itemsDB.gear);