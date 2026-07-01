let character = {
    name: "", race: "", subrace: "", class: "", subclass: "", background: "",
    level: 1, xp: 0, hp: 0, maxHp: 0,
    ac: "", initiative: "+0", speed: "30",
    proficiencyBonus: 2, inspiration: "", passivePerception: 10,
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    savesProf: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skillsProf: { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false },
    expertiseProf: {}, 
    money: { cp: "", sp: "", ep: "", gp: "", pp: "" },
    inventory: [], spells: [], usedSlots: {},
    equipment: "", attacks: "", features: "", proficiencies: "",
    traits: "", ideals: "", bonds: "", flaws: ""
};

let historyStack = [];
let saveTimeout;
let isUndoing = false;
let isDarkTheme = localStorage.getItem("dnd_theme") === "dark";

const skillToStat = {
    acr: 'dexterity', ath: 'strength', prc: 'wisdom', sur: 'wisdom', ani: 'wisdom',
    inti: 'charisma', prf: 'charisma', his: 'intelligence', slg: 'dexterity',
    arc: 'intelligence', med: 'wisdom', dec: 'charisma', nat: 'intelligence',
    ins: 'wisdom', inv: 'intelligence', rel: 'intelligence', ste: 'dexterity', per: 'charisma'
};
const saveToStat = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom', cha: 'charisma' };

window.onload = () => {
    const saved = localStorage.getItem("dnd_char");
    if (saved) {
        document.getElementById("loadGameBtn").classList.remove("hidden");
        let clearBtn = document.getElementById("clearSaveBtn");
        let exportBtn = document.getElementById("exportGameBtn");
        if(clearBtn) clearBtn.classList.remove("hidden");
        if(exportBtn) exportBtn.classList.remove("hidden");
        
        character = JSON.parse(saved);
        if(!character.inventory) character.inventory = [];
        if(!character.spells) character.spells = [];
        if(!character.usedSlots) character.usedSlots = {};
        historyStack.push(JSON.stringify(character));
    }
    applyTheme(); 
};

function applyTheme() {
    if (isDarkTheme) {
        document.body.classList.add("dark-mode-active");
        document.querySelectorAll('.dnd-sheet').forEach(el => el.classList.add('dark-sheet'));
        let btn = document.getElementById("theme-btn");
        if(btn) btn.innerText = "☀️ Светлая тема";
    } else {
        document.body.classList.remove("dark-mode-active");
        document.querySelectorAll('.dnd-sheet').forEach(el => el.classList.remove('dark-sheet'));
        let btn = document.getElementById("theme-btn");
        if(btn) btn.innerText = "🌙 Темная тема";
    }
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem("dnd_theme", isDarkTheme ? "dark" : "light");
    applyTheme();
}

function nextScreen(id) {
    document.querySelector('.screen.active').classList.remove('active');
    document.getElementById(id).classList.add('active');
    if(id === 'screen-sheet') document.getElementById('dice-container').classList.remove('hidden');
    else document.getElementById('dice-container').classList.add('hidden');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function closeOnBackdrop(event, id) { if (event.target.id === id) closeModal(id); }
function toggleDiceMenu() { document.getElementById('dice-menu').classList.toggle('hidden'); }

function loadGame() {
    const saved = JSON.parse(localStorage.getItem("dnd_char"));
    character = { ...character, ...saved };
    if(!character.inventory) character.inventory = [];
    if(!character.spells) character.spells = [];
    if(!character.usedSlots) character.usedSlots = {};
    updateAllUI();
    nextScreen('screen-sheet');
}

function setName() {
    let input = document.getElementById("characterName").value.trim();
    if (!input) return alert("Пожалуйста, введите имя!");
    input = input.charAt(0).toUpperCase() + input.slice(1);
    character.name = input; 
    nextScreen('screen-race');
}

function setRace(race) { 
    character.race = race; character.subrace = "";
    if (subraceData[race]) {
        let container = document.getElementById('subrace-cards');
        container.innerHTML = subraceData[race].map(sr => 
            `<div class="card" onclick="setSubrace('${sr.name}')">
                <h3>${sr.name}</h3><p style="font-size: 0.9rem;">${sr.desc}</p>
            </div>`
        ).join('');
        nextScreen('screen-subrace');
    } else nextScreen('screen-class'); 
}

function setSubrace(subrace) { character.subrace = subrace; nextScreen('screen-class'); }

function setClass(cls) { 
    character.class = cls; character.subclass = "";
    generateStats('standard'); nextScreen('screen-stats'); 
}

function rollStat() {
    let rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b); return rolls[1] + rolls[2] + rolls[3];
}

function generateStats(mode = 'standard') {
    let values = [15, 14, 13, 12, 10, 8];
    if (mode === 'roll') values = [rollStat(), rollStat(), rollStat(), rollStat(), rollStat(), rollStat()].sort((a, b) => b - a);
    
    let prio = classStatPriority[character.class] || ["strength", "dexterity"];
    let rest = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].filter(s => !prio.includes(s));
    if (mode === 'roll') rest.sort(() => Math.random() - 0.5);

    let keysForAssignment = [...prio, ...rest];
    let tempStats = {};
    for (let i = 0; i < 6; i++) tempStats[keysForAssignment[i]] = values[i];
    
    let rData = racesData[character.race];
    if (rData && rData.stats) {
        for (let k in rData.stats) if (tempStats[k] !== undefined) tempStats[k] += rData.stats[k];
    }
    if (character.subrace && subraceData[character.race]) {
        let srData = subraceData[character.race].find(x => x.name === character.subrace);
        if (srData && srData.stats) {
            for (let k in srData.stats) if (tempStats[k] !== undefined) tempStats[k] += srData.stats[k];
        }
    }

    const fixedOrder = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    character.stats = {};
    fixedOrder.forEach(k => character.stats[k] = tempStats[k]);

    const labels = { strength: "Сила", dexterity: "Ловкость", constitution: "Телосложение", intelligence: "Интеллект", wisdom: "Мудрость", charisma: "Харизма" };
    const grid = document.getElementById("stats-grid");
    if (grid) {
        grid.innerHTML = fixedOrder.map(k => 
            `<div class="stat-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; padding: 10px 10px 10px 15px;">
                <span style="font-weight: bold; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">${labels[k]}</span>
                <input type="number" 
                       value="${character.stats[k]}" 
                       oninput="character.stats['${k}'] = this.value === '' ? '' : Number(this.value)" 
                       style="width: 65px; text-align: center; font-size: 1.1rem; padding: 6px; border-radius: 6px; border: 1px solid #4b5563; background: var(--panel-bg); color: var(--gold); font-weight: bold; outline: none; font-family: sans-serif; margin: 0; flex-shrink: 0;">
            </div>`
        ).join("");
    }

    const infoText = mode === 'standard' ? "Распределен Стандартный набор + Бонусы Расы." : "Случайный бросок кубиков + Бонусы Расы.";
    const pEl = document.getElementById("stats-info");
    if (pEl) pEl.innerHTML = infoText + `<br><span style="font-size: 0.8rem;">Максимальные значения уходят в главные характеристики класса. <strong>Вы можете отредактировать их вручную!</strong></span>`;
}

function setBackground(bg) {
    character.savesProf = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
    character.skillsProf = { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false };
    character.expertiseProf = {}; 
    character.spells = []; 
    character.usedSlots = {};

    character.background = bg;
    
    let rData = racesData[character.race] || {};
    character.speed = (rData.speed || 30).toString();
    let raceFeatures = rData.features || "";
    let raceLangs = rData.langs || "";
    if (rData.skills) { for(let k in rData.skills) character.skillsProf[k] = true; }
    
    if (character.subrace && subraceData[character.race]) {
        let srData = subraceData[character.race].find(x => x.name === character.subrace);
        if (srData) {
            if (srData.speed) character.speed = srData.speed.toString();
            if (srData.features) raceFeatures += "\n" + srData.features;
            if (srData.langs) raceLangs += srData.langs;
        }
    }

    if (bg === "Прислужник") { character.skillsProf.rel = true; character.skillsProf.ins = true; }
    else if (bg === "Шарлатан") { character.skillsProf.dec = true; character.skillsProf.slg = true; }
    else if (bg === "Преступник") { character.skillsProf.ste = true; character.skillsProf.dec = true; }
    else if (bg === "Артист") { character.skillsProf.acr = true; character.skillsProf.prf = true; }
    else if (bg === "Народный герой") { character.skillsProf.ani = true; character.skillsProf.sur = true; }
    else if (bg === "Ремесленный мастер") { character.skillsProf.ins = true; character.skillsProf.his = true; }
    else if (bg === "Отшельник") { character.skillsProf.med = true; character.skillsProf.rel = true; }
    else if (bg === "Благородный") { character.skillsProf.his = true; character.skillsProf.per = true; }
    else if (bg === "Чужеземец") { character.skillsProf.ath = true; character.skillsProf.sur = true; }
    else if (bg === "Моряк") { character.skillsProf.ath = true; character.skillsProf.prc = true; }
    else if (bg === "Солдат") { character.skillsProf.ath = true; character.skillsProf.inti = true; }
    else if (bg === "Беспризорник") { character.skillsProf.sle = true; character.skillsProf.ste = true; }
    else if (bg === "Учёный") { character.skillsProf.arc = true; character.skillsProf.his = true; }

    let classFeatures = "", classProfs = "";
    character.hp = 0; character.maxHp = 0; 
    character.inventory = [];
    const addGear = (name, eq=true) => { character.inventory.push({ id: Date.now()+Math.random(), name: name, equipped: eq }); };

    if (character.class === "Варвар") {
        character.savesProf.str = true; character.savesProf.con = true; character.skillsProf.ath = true; character.skillsProf.sur = true;
        classProfs = "Легкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Варвар 1 ур.]\n- Ярость (2/отдых)\n- Защита без доспехов.";
        addGear("Секира"); addGear("Ручной топор"); addGear("Метательное копье");
    } else if (character.class === "Воин") {
        character.savesProf.str = true; character.savesProf.con = true; character.skillsProf.ath = true; character.skillsProf.inti = true;
        classProfs = "Все доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Воин 1 ур.]\n- Боевой стиль (Дуэлянт)\n- Второе дыхание.";
        addGear("Длинный меч"); addGear("Щит"); addGear("Кольчужная рубаха");
    } else if (character.class === "Волшебник") {
        character.savesProf.int = true; character.savesProf.wis = true; character.skillsProf.arc = true; character.skillsProf.his = true;
        classProfs = "Кинжалы, дротики, пращи, посохи, легкие арбалеты.";
        classFeatures = "[Волшебник 1 ур.]\n- Тайное восстановление.\nЯчейки: 2 (1 круг).";
        addGear("Боевой посох"); addGear("Книга заклинаний", false);
    } else if (character.class === "Жрец") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.rel = true; character.skillsProf.med = true;
        classProfs = "Легкие/средние доспехи, щиты, простое оружие.";
        classFeatures = "[Жрец 1 ур.]\n- Владение магией.\nЯчейки: 2 (1 круг).";
        addGear("Булава"); addGear("Кольчужная рубаха"); addGear("Щит");
    } else if (character.class === "Бард") {
        character.savesProf.dex = true; character.savesProf.cha = true; character.skillsProf.acr = true; character.skillsProf.per = true; character.skillsProf.prf = true;
        classProfs = "Легкие доспехи, простое, ручные арбалеты, рапиры, короткие мечи. 3 инструмента.";
        classFeatures = "[Бард 1 ур.]\n- Вдохновение барда (d6)\nЯчейки: 2 (1 круг).";
        addGear("Рапира"); addGear("Кожаная броня"); addGear("Кинжал");
    } else if (character.class === "Друид") {
        character.savesProf.int = true; character.savesProf.wis = true; character.skillsProf.nat = true; character.skillsProf.med = true;
        classProfs = "Легкие/средние доспехи, щиты (НЕ из металла).";
        classFeatures = "[Друид 1 ур.]\n- Друидический язык.\nЯчейки: 2 (1 круг).";
        addGear("Боевой посох"); addGear("Кожаная броня"); addGear("Щит");
    } else if (character.class === "Монах") {
        character.savesProf.str = true; character.savesProf.dex = true; character.skillsProf.acr = true; character.skillsProf.ste = true;
        classProfs = "Простое оружие, короткие мечи.";
        classFeatures = "[Монах 1 ур.]\n- Защита без доспехов\n- Боевые искусства.";
        addGear("Короткий меч"); addGear("Дротик");
    } else if (character.class === "Паладин") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.ath = true; character.skillsProf.rel = true;
        classProfs = "Все доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Паладин 1 ур.]\n- Божественное чувство.\n- Наложение рук.";
        addGear("Длинный меч"); addGear("Кольчуга"); addGear("Щит");
    } else if (character.class === "Следопыт") {
        character.savesProf.str = true; character.savesProf.dex = true; character.skillsProf.ste = true; character.skillsProf.sur = true;
        classProfs = "Легкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Следопыт 1 ур.]\n- Избранный враг.\n- Исследователь природы.";
        addGear("Длинный лук"); addGear("Короткий меч"); addGear("Чешуйчатый доспех");
    } else if (character.class === "Плут") {
        character.savesProf.dex = true; character.savesProf.int = true; character.skillsProf.ste = true; character.skillsProf.acr = true; character.skillsProf.slg = true; character.skillsProf.dec = true;
        classProfs = "Легкая броня, простое, ручные арбалеты, мечи, рапиры.";
        classFeatures = "[Плут 1 ур.]\n- Компетентность (Выбраны скрытность и воровские инстр.).\n- Скрытая атака (+1d6).";
        character.expertiseProf = { ste: true, slg: true };
        addGear("Рапира"); addGear("Кинжал"); addGear("Кожаная броня");
    } else if (character.class === "Чародей") {
        character.savesProf.con = true; character.savesProf.cha = true; character.skillsProf.arc = true; character.skillsProf.dec = true;
        classProfs = "Кинжалы, дротики, пращи, посохи, арбалеты.";
        classFeatures = "[Чародей 1 ур.]\n- Использование магии.\nЯчейки: 2 (1 круг).";
        addGear("Боевой посох"); addGear("Кинжал");
    } else if (character.class === "Колдун") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.arc = true; character.skillsProf.inti = true;
        classProfs = "Легкие доспехи, простое оружие.";
        classFeatures = "[Колдун 1 ур.]\n- Договор Покровителя.\nЯчейки: 1 (1 круг).";
        addGear("Кинжал"); addGear("Кожаная броня");
    }

    const bgObj = backgroundData[bg];
    character.money = bgObj.money;
    character.equipment = `[Из предыстории]\n${bgObj.equip}`;
    character.proficiencies = `[Броня и Оружие]\n${classProfs}\n\n[Языки расы]\n${raceLangs}\n\n[От предыстории (${bg})]\n${bgObj.profs()}`;
    character.features = `${raceFeatures}\n\n${classFeatures}\n\n[Предыстория: ${bg}]\n${bgObj.feature}`;
    character.attacks = ""; 
    character.traits = getRandom(randomTraitsList); character.ideals = getRandom(randomIdealsList);
    character.bonds = getRandom(randomBondsList); character.flaws = getRandom(randomFlawsList);

    let rName = character.race.toLowerCase();
    let subName = (character.subrace || "").toLowerCase();

    const findAndAddSpell = (spellName) => {
        let s = typeof spellsDB !== 'undefined' ? spellsDB.find(x => x.name.toLowerCase() === spellName.toLowerCase()) : null;
        if (s && !character.spells.some(existing => existing.name === s.name)) {
            character.spells.push({ id: Date.now() + Math.random(), name: s.name, level: s.level });
        }
    };

    if (rName.includes("тифлинг")) findAndAddSpell("Чудотворство");
    if (rName.includes("эльф") && subName.includes("высокий")) findAndAddSpell("Огненный снаряд");
    if (rName.includes("гном") && subName.includes("лесной")) findAndAddSpell("Малая иллюзия");

    updateCalculations();
    character.hp = character.maxHp; 
    
    let loadBtn = document.getElementById("loadGameBtn");
    let clearBtn = document.getElementById("clearSaveBtn");
    let exportBtn = document.getElementById("exportGameBtn");
    if(loadBtn) loadBtn.classList.remove("hidden");
    if(clearBtn) clearBtn.classList.remove("hidden");
    if(exportBtn) exportBtn.classList.remove("hidden");

    saveGame(); updateAllUI(); nextScreen('screen-sheet');

    let casters = getBaseCasterClasses();
    let isTrueCaster = casters.some(c => c !== "Раса");
    if (isTrueCaster) {
        openModal('modal-initial-spells');
    }
}

function getDBItem(name) {
    return (typeof itemsDBAll !== 'undefined' ? itemsDBAll.find(i => i.name === name) : null) || null;
}

function openInventoryDB() {
    document.getElementById('modal-item-db').classList.remove('hidden');
    renderDBList('weapons');
}

function renderDBList(category) {
    let container = document.getElementById('db-list-container');
    let items = itemsDB[category];
    let html = items.map((item, index) => {
        let details = category === 'weapons' ? `${item.dmg} ${item.dmgType} | ${item.prop.join(", ")}` : (category === 'armor' ? (item.type === "Щит" ? `+2 КД` : `КД: ${item.ac}`) : item.desc);
        return `<div class="inv-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
            <div><strong>${item.name}</strong><br><span style="font-size:0.8rem; color:#888;">${details}</span></div>
            <button class="btn-secondary" style="padding: 5px 10px; margin:0;" onclick="addToInventory('${category}', ${index})">Взять</button>
        </div>`;
    }).join('');
    container.innerHTML = html;
}

function addToInventory(category, index) {
    if(!character.inventory) character.inventory = [];
    let item = itemsDB[category][index];
    character.inventory.push({ id: Date.now() + Math.random(), name: item.name, equipped: false });
    saveGame(); renderInventory(); alert(`Добавлено: ${item.name}`);
}

function renderInventory() {
    if(!character.inventory) character.inventory = [];
    let container = document.getElementById('inventory-list');
    if(!container) return;
    
    let html = character.inventory.map(item => {
        let dbItem = getDBItem(item.name);
        let isEquippable = dbItem && (itemsDB.weapons.includes(dbItem) || itemsDB.armor.includes(dbItem));
        let equipHTML = isEquippable ? `<input type="checkbox" style="margin-right: 10px; width:16px; height:16px; cursor:pointer;" onchange="toggleEquip(${item.id}, this.checked)" ${item.equipped ? 'checked' : ''}>` : `<span style="display:inline-block; width:26px;"></span>`;
            
        return `<div class="inv-item-row" style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #ddd; font-size: 0.95rem;">
            <div style="flex:1; display:flex; align-items:center;">${equipHTML}<strong>${item.name}</strong></div>
            <button class="btn-danger" style="padding: 3px 8px; margin:0; font-size: 0.8rem;" onclick="removeFromInventory(${item.id})">✖</button>
        </div>`;
    }).join('');
    container.innerHTML = html || "<p style='color:#888; text-align:center; margin-top:20px;'>Рюкзак пуст</p>";
}

function toggleEquip(id, isEquipped) {
    let item = character.inventory.find(i => i.id === id);
    if(item) {
        if(isEquipped) {
            let dbItem = getDBItem(item.name);
            if(dbItem && itemsDB.armor.includes(dbItem) && dbItem.type !== "Щит") {
                character.inventory.forEach(i => {
                    let other = getDBItem(i.name);
                    if(other && itemsDB.armor.includes(other) && other.type !== "Щит" && i.id !== id) i.equipped = false;
                });
            }
        }
        item.equipped = isEquipped;
        saveGame(); updateCalculations(); renderInventory(); 
    }
}

function removeFromInventory(id) {
    character.inventory = character.inventory.filter(i => i.id !== id);
    saveGame(); updateCalculations(); renderInventory();
}

function addXP(amount) {
    character.xp = (character.xp || 0) + amount;
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp();
}

function addOneLevel() {
    if (character.level >= 20) return alert("Максимальный уровень!");
    const xpThresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    character.xp = xpThresholds[character.level];
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp();
}

function checkLevelUp() {
    let oldLevel = character.level;
    let targetLevel = 1;
    const xpThresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    for (let i = 19; i >= 0; i--) if (character.xp >= xpThresholds[i]) { targetLevel = i + 1; break; }

    if (targetLevel > oldLevel) {
        let scInfo = subclassData[character.class];
        let needsSubclass = (scInfo && targetLevel >= scInfo.lvl && !character.subclass);
        showLevelUpModal(oldLevel, targetLevel, needsSubclass ? scInfo.opts : null);
    } else {
        updateCalculations(); saveGame(); updateAllUI();
    }
}

function getSpellLevelUpMessage(lvl) {
    let cClasses = getBaseCasterClasses();
    if(cClasses.length === 0) return "";
    
    let cls = cClasses[0]; 
    const full = ["Бард", "Жрец", "Друид", "Волшебник", "Чародей"];
    const half = ["Паладин", "Следопыт"];
    
    if(full.includes(cls)) {
        let max = Math.ceil(lvl / 2);
        let count = (cls === "Волшебник") ? 2 : 1;
        let msg = `Доступны заклинания до ${max} круга. Выберите ${count} новых заклинания для изучения. `;
        if([4, 10].includes(lvl)) msg += " Вы также получаете +1 новый заговор!";
        return `<p style="font-weight: bold;">Магия: ${msg}</p>`;
    }
    
    if(half.includes(cls) && lvl >= 2) {
        let max = Math.ceil(lvl / 2) - 1;
        return `<p style="font-weight: bold;">Магия: Доступны заклинания до ${max} круга. Выберите 1 новое заклинание для изучения.</p>`;
    }
    
    if(cls === "Колдун") {
        let max = Math.min(Math.ceil(lvl / 2), 5);
        let msg = `Круг ячеек повышен до ${max}. Выберите 1 новое заклинание для изучения.`;
        if([4, 10].includes(lvl)) msg += " Вы получаете +1 новый заговор!";
        return `<p style="font-weight: bold;">Магия: ${msg}</p>`;
    }
    
    return "";
}

function showLevelUpModal(oldLvl, newLvl, subclassOpts) {
    let newAbilities = [];
    let spellInfo = getSpellLevelUpMessage(newLvl);
    if (spellInfo) newAbilities.push(spellInfo);

    for (let lvl = oldLvl + 1; lvl <= newLvl; lvl++) {
        newAbilities.push(...getAbilitiesForLevel(character.class, character.subclass, lvl));
    }

    let container = document.getElementById("levelup-options");
    let html = `<p class="levelup-desc">Ваш уровень повышен до ${newLvl}!</p>`;

    if (newAbilities.length > 0) {
        html += `<ul style="text-align: left; margin-bottom: 20px; font-size: 0.9rem; line-height: 1.4;">`;
        newAbilities.forEach(ab => { html += `<li>${ab}</li>`; });
        if (subclassOpts) html += `<li><strong>Особенности выбранной специализации появятся ниже:</strong></li>`;
        html += `</ul>`;
    }

    if (subclassOpts) {
        html += `<p style="font-weight:bold; margin-bottom: 10px;">Выберите специализацию:</p>`;
        html += `<div class="flex-col gap-10" style="align-items: center;">` + subclassOpts.map(opt => 
            `<button type="button" class="btn-panel btn-full-width no-scale" style="text-align:center;" onclick="commitLevelUp(${oldLvl}, ${newLvl}, '${opt}')">${opt}</button>`
        ).join("") + `</div>`;
    } else {
        html += `<button type="button" class="btn-secondary btn-full-width no-scale" style="padding: 15px;" onclick="commitLevelUp(${oldLvl}, ${newLvl}, null)">Отлично! Принять изменения</button>`;
    }

    container.innerHTML = html;
    document.getElementById("modal-levelup").classList.remove("hidden");
}

function commitLevelUp(oldLvl, newLvl, chosenSubclass) {
    document.getElementById("modal-levelup").classList.add("hidden");
    if (chosenSubclass) character.subclass = chosenSubclass;

    let newAbilities = [];
    for (let lvl = oldLvl + 1; lvl <= newLvl; lvl++) newAbilities.push(...getAbilitiesForLevel(character.class, character.subclass, lvl));

    if (newAbilities.length > 0) character.features += `\n\n[Получено при повышении до ${newLvl} ур.]\n- ` + newAbilities.join("\n- ");

    character.level = newLvl; 
    let oldMax = character.maxHp;
    updateCalculations(); 
    let hpGain = character.maxHp - oldMax;
    character.hp = character.maxHp; 
    
    saveGame(); updateAllUI();
}

function changeHP(amount) {
    let current = Number(character.hp) || 0;
    let max = Number(character.maxHp) || 0;
    current += amount;
    if (current < 0) current = 0;
    if (current > max) current = max; 
    character.hp = current;
    let hpInput = document.getElementById('sheet-hp');
    if(hpInput) hpInput.value = character.hp;
    saveGame();
}

// ==== ФУНКЦИИ ОТДЫХА ====
function longRest() {
    if (!confirm("Совершить Длинный отдых?\nЭто восстановит все хиты и магические ячейки.")) return;
    
    character.hp = character.maxHp;
    let hpInput = document.getElementById('sheet-hp');
    if (hpInput) hpInput.value = character.hp;
    
    character.usedSlots = {}; 
    
    if (!document.getElementById('modal-spellbook').classList.contains('hidden')) {
        renderSpellbookList();
    }
    
    saveGame();
    alert("⛺ Длинный отдых завершен! Хиты и магия полностью восстановлены.");
}

function getHitDie() {
    let clsStr = (character.class || "").toLowerCase();
    if (clsStr.includes("варвар")) return 12;
    if (["воин", "паладин", "следопыт"].some(c => clsStr.includes(c))) return 10;
    if (["волшебник", "чародей"].some(c => clsStr.includes(c))) return 6;
    return 8; // жрец, бард, друид, монах, плут, колдун
}

function openShortRestModal() {
    let hd = getHitDie();
    let conMod = calculateModifierRaw(character.stats['constitution']);
    let conStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
    
    document.getElementById('hit-die-label').innerText = `1d${hd} ${conStr}`;
    document.getElementById('short-rest-hp-input').value = 0;
    openModal('modal-short-rest');
}

function rollHitDie() {
    let hd = getHitDie();
    let conMod = calculateModifierRaw(character.stats['constitution']);
    
    let roll = Math.floor(Math.random() * hd) + 1;
    let heal = roll + conMod;
    if (heal < 0) heal = 0;
    if (heal === 0 && roll > 0) heal = 1; // Минимум 1 ХП при любом положительном броске по правилам
    
    let input = document.getElementById('short-rest-hp-input');
    let current = Number(input.value) || 0;
    input.value = current + heal;

    // Визуальный эффект
    let btn = document.getElementById('btn-roll-hit-die');
    let originalText = btn.innerHTML;
    btn.innerHTML = `🎲 Выпало ${roll} (Итог: ${heal})!`;
    btn.style.backgroundColor = "var(--gold)";
    btn.style.color = "#000";
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = "";
        btn.style.color = "";
    }, 1200);
}

function applyShortRest() {
    let healAmount = Number(document.getElementById('short-rest-hp-input').value) || 0;
    if (healAmount > 0) {
        changeHP(healAmount);
    }
    
    let cClasses = getBaseCasterClasses();
    let warlockRestored = false;
    
    if (cClasses.includes("Колдун")) {
        if(character.usedSlots) delete character.usedSlots['pact'];
        warlockRestored = true;
        if (!document.getElementById('modal-spellbook').classList.contains('hidden')) {
            renderSpellbookList();
        }
    }
    
    saveGame();
    closeModal('modal-short-rest');
    alert(`☕ Короткий отдых завершен! Хиты обновлены.${warlockRestored ? " Ячейки Колдуна восстановлены!" : ""}`);
}
// ========================

function calculateModifierRaw(score) {
    let num = Number(score);
    if (isNaN(num) || score === "") num = 10;
    return Math.floor((num - 10) / 2); 
}

function updateCalculations() {
    let pb = Math.floor((character.level - 1) / 4) + 2;
    document.getElementById('sheet-prof').value = "+" + pb;

    let conMod = calculateModifierRaw(character.stats['constitution']);
    let hpBase = 0, hpPerLevel = 0;
    
    let clsStr = (character.class || "").toLowerCase();
    if (clsStr.includes("варвар")) { hpBase = 12; hpPerLevel = 7; }
    else if (["воин", "паладин", "следопыт"].some(c => clsStr.includes(c))) { hpBase = 10; hpPerLevel = 6; }
    else if (["жрец", "бард", "друид", "монах", "плут", "колдун"].some(c => clsStr.includes(c))) { hpBase = 8; hpPerLevel = 5; }
    else if (["волшебник", "чародей"].some(c => clsStr.includes(c))) { hpBase = 6; hpPerLevel = 4; }

    if (hpBase > 0) {
        let newMaxHp = (hpBase + conMod) + (character.level - 1) * (hpPerLevel + conMod);
        if (character.subclass === "Наследие Драконов" || (clsStr.includes("чародей") && character.level < 3 && character.features.includes("Наследие драконов"))) newMaxHp += character.level; 
        if (character.subrace === "Холмовой дварф") newMaxHp += character.level; 
        
        let hpChanged = (character.maxHp !== newMaxHp);
        let diff = newMaxHp - character.maxHp;
        character.maxHp = newMaxHp;
        let hpInput = document.getElementById('sheet-maxhp');
        if(hpInput) hpInput.value = character.maxHp;
        
        if (character.hp === 0) character.hp = character.maxHp; 
        else if (hpChanged && diff > 0 && character.level > 1) character.hp += diff;
        if (character.hp > character.maxHp) character.hp = character.maxHp;
        
        if(document.getElementById('sheet-hp')) document.getElementById('sheet-hp').value = character.hp;
    }

    let dexMod = calculateModifierRaw(character.stats['dexterity']);
    let wisMod = calculateModifierRaw(character.stats['wisdom']);
    let conModActual = calculateModifierRaw(character.stats['constitution']);

    let equippedArmorItem = character.inventory.find(i => i.equipped && getDBItem(i.name) && itemsDB.armor.includes(getDBItem(i.name)) && getDBItem(i.name).type !== "Щит");
    let equippedShieldItem = character.inventory.find(i => i.equipped && getDBItem(i.name) && getDBItem(i.name).type === "Щит");
    
    let dbArmor = equippedArmorItem ? getDBItem(equippedArmorItem.name) : null;
    let ac = 10 + dexMod;
    
    if (dbArmor) {
        if (dbArmor.dexMod) ac = dbArmor.ac + Math.min(dexMod, dbArmor.dexMax);
        else ac = dbArmor.ac;
    } else {
        if (clsStr.includes("варвар")) ac = 10 + dexMod + conModActual;
        else if (clsStr.includes("монах")) ac = 10 + dexMod + wisMod;
        else if (clsStr.includes("чародей") && (character.subclass === "Наследие Драконов" || character.level < 3)) ac = 13 + dexMod;
    }
    if (equippedShieldItem) ac += 2;
    character.ac = ac;
    document.getElementById('sheet-ac').value = character.ac;

    let baseSpeed = 30;
    if (["Дварф", "Полурослик", "Гном"].includes(character.race)) baseSpeed = 25;
    if (character.subrace === "Лесной эльф") baseSpeed = 35;
    
    let speedBonus = 0;
    if (clsStr.includes("монах")) {
        if (character.level >= 18) speedBonus = 30;
        else if (character.level >= 14) speedBonus = 25;
        else if (character.level >= 10) speedBonus = 20;
        else if (character.level >= 6) speedBonus = 15;
        else if (character.level >= 2) speedBonus = 10;
    } else if (clsStr.includes("варвар") && character.level >= 5) speedBonus = 10;

    character.speed = (baseSpeed + speedBonus).toString();
    if(document.getElementById('sheet-speed')) document.getElementById('sheet-speed').value = character.speed;

    let halfPb = Math.floor(pb / 2);
    let isBardJack = (clsStr.includes("бард") && character.level >= 2);
    let isChampionAthlete = (character.subclass === "Чемпион" && character.level >= 7);

    let initMod = dexMod;
    if (isBardJack) initMod += halfPb;
    else if (isChampionAthlete) initMod += Math.ceil(pb / 2);
    character.initiative = initMod >= 0 ? `+${initMod}` : `${initMod}`;
    document.getElementById('sheet-init').value = character.initiative;

    let autoAttacksHTML = "";
    let strMod = calculateModifierRaw(character.stats['strength']);
    
    let weapons = character.inventory.filter(i => i.equipped && getDBItem(i.name) && itemsDB.weapons.includes(getDBItem(i.name)));
    weapons.forEach(w => {
        let dbW = getDBItem(w.name);
        let attr = dbW.attr || "str";
        let typeStr = (dbW.type || "").toLowerCase();
        let isMonkWeap = clsStr.includes("монах") && (typeStr.includes("простое") || w.name === "Короткий меч");

        let useDex = (attr === "dex") || (attr === "finesse" && dexMod > strMod) || (isMonkWeap && dexMod > strMod);
        let mod = useDex ? dexMod : strMod;
        let hit = mod + pb; 
        let hitStr = hit >= 0 ? `+${hit}` : hit;

        let dmgMod = mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : "";
        let dmgDice = dbW.dmg;
        
        if(isMonkWeap && character.level >= 5) {
            let monkDice = character.level >= 17 ? "1d10" : (character.level >= 11 ? "1d8" : "1d6");
            if(parseInt(dmgDice.split('d')[1]) < parseInt(monkDice.split('d')[1])) dmgDice = monkDice;
        }
        
        autoAttacksHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #ccc; font-size:0.85rem; padding: 4px 0;">
            <span style="font-weight:bold; width: 45%;">${w.name}</span><span style="width: 15%; text-align:center;">${hitStr}</span><span style="width: 40%; text-align:right;">${dmgDice}${dmgMod} ${dbW.dmgType}</span>
        </div>`;
    });
    
    if (clsStr.includes("монах")) {
        let monkDice = character.level >= 17 ? "1d10" : (character.level >= 11 ? "1d8" : (character.level >= 5 ? "1d6" : "1d4"));
        let mod = Math.max(strMod, dexMod);
        let hitStr = (mod + pb) >= 0 ? `+${mod + pb}` : (mod + pb);
        let dmgMod = mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : "";
        autoAttacksHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #ccc; font-size:0.85rem; padding: 4px 0;">
            <span style="font-weight:bold; width: 45%;">Удар без оружия</span><span style="width: 15%; text-align:center;">${hitStr}</span><span style="width: 40%; text-align:right;">${monkDice}${dmgMod} дроб</span>
        </div>`;
    }
    
    if (character.spells && character.spells.length > 0) {
        let cantrips = character.spells.filter(s => s.level === 0);
        if (cantrips.length > 0) {
            let stat = getSpellcastingStat();
            let statMod = calculateModifierRaw(character.stats[stat]);
            let modStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;

            cantrips.sort((a,b) => a.name.localeCompare(b.name)).forEach(sp => {
                let dbSp = typeof spellsDB !== 'undefined' ? spellsDB.find(s => s.name === sp.name) : null;
                let desc = dbSp ? dbSp.desc : "";
                
                desc = desc.replace(/\+\s*мод\.?\s*магии/gi, modStr);
                desc = desc.replace(/\+\s*мод\.?/gi, modStr);

                autoAttacksHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; font-size:0.85rem; padding: 4px 0;">
                    <span style="font-weight:bold; width: 35%;">${sp.name}</span><span style="width: 65%; text-align:right;">${desc}</span>
                </div>`;
            });
        }
    }
    document.getElementById("auto-attacks-list").innerHTML = autoAttacksHTML;

    for (let sv in saveToStat) {
        let statName = saveToStat[sv];
        let mod = calculateModifierRaw(character.stats[statName]);
        let isProf = character.savesProf && character.savesProf[sv];
        let bonus = isProf ? pb : (isChampionAthlete && ['strength', 'dexterity', 'constitution'].includes(statName) ? Math.ceil(pb / 2) : 0);
        let total = mod + bonus;
        let elVal = document.getElementById(`sv-${sv}-val`);
        let elChk = document.getElementById(`sv-${sv}`);
        if(elVal) elVal.value = (total >= 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
    }

    let isRogue = clsStr.includes("плут");
    for (let sk in skillToStat) {
        let statName = skillToStat[sk];
        let mod = calculateModifierRaw(character.stats[statName]);
        let isProf = character.skillsProf && character.skillsProf[sk];
        let isExp = character.expertiseProf && character.expertiseProf[sk];
        
        let bonus = 0;
        if (isExp && isRogue) bonus = pb * 2;
        else if (isProf) bonus = pb;
        else if (isBardJack) bonus = halfPb;
        else if (isChampionAthlete && ['strength', 'dexterity', 'constitution'].includes(statName)) bonus = Math.ceil(pb / 2);

        let total = mod + bonus;
        let elVal = document.getElementById(`sk-${sk}-val`);
        let elChk = document.getElementById(`sk-${sk}`);
        let elExp = document.getElementById(`exp-${sk}`);
        if(elVal) elVal.value = (total >= 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
        if(elExp) elExp.checked = isExp;
    }

    let wisModCalc = calculateModifierRaw(character.stats['wisdom']);
    let prcProf = (character.expertiseProf?.['prc'] && isRogue) ? (pb*2) : (character.skillsProf?.['prc'] ? pb : (isBardJack ? halfPb : 0));
    document.getElementById('sheet-pass-perc').value = 10 + wisModCalc + prcProf;
}

function getBaseCasterClasses() {
    let classes = [];
    let cls = (character.class || "").toLowerCase();
    let sub = (character.subclass || "").toLowerCase();
    let race = (character.race || "").toLowerCase();
    let bg = (character.background || "").toLowerCase();

    if (cls.includes("бард")) classes.push("Бард");
    if (cls.includes("жрец")) classes.push("Жрец");
    if (cls.includes("друид")) classes.push("Друид");
    if (cls.includes("волшебник") || sub.includes("мистический рыцарь") || sub.includes("мистический ловкач")) classes.push("Волшебник");
    if (cls.includes("чародей")) classes.push("Чародей");
    if (cls.includes("колдун")) classes.push("Колдун");
    if (cls.includes("паладин")) classes.push("Паладин");
    if (cls.includes("следопыт")) classes.push("Следопыт");

    if (classes.length === 0) {
        if (["эльф", "тифлинг", "драконорожденный", "гном"].some(r => race.includes(r))) {
            classes.push("Раса"); 
        }
    }

    return classes;
}

function getSpellcastingStat() {
    let cls = (character.class || "").toLowerCase();
    let sub = (character.subclass || "").toLowerCase();
    
    if (cls.includes("волшебник") || sub.includes("мистический рыцарь") || sub.includes("мистический ловкач")) return "intelligence";
    if (cls.includes("жрец") || cls.includes("друид") || cls.includes("следопыт") || cls.includes("монах")) return "wisdom";
    if (cls.includes("бард") || cls.includes("паладин") || cls.includes("чародей") || cls.includes("колдун")) return "charisma";
    
    return "intelligence"; 
}

function updateAllUI() {
    document.getElementById("sheet-name").value = character.name || "";
    document.getElementById("sheet-race").value = (character.race || "") + (character.subrace ? ` (${character.subrace})` : "");
    document.getElementById("sheet-class").value = `${character.class || ""}${character.subclass ? ` [${character.subclass}]` : ""} ${character.level || 1}`;
    document.getElementById("sheet-bg").value = character.background || "";
    document.getElementById("sheet-xp").value = character.xp || 0;
    
    document.getElementById("sheet-hp").value = character.hp || 0;
    document.getElementById("sheet-maxhp").value = character.maxHp || 0;
    document.getElementById("sheet-ac").value = character.ac || "";
    document.getElementById("sheet-speed").value = character.speed || "30";
    document.getElementById("sheet-insp").value = character.inspiration || "";

    const statsList = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const fullNames = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom', cha: 'charisma' };
    statsList.forEach(st => {
        const score = character.stats[fullNames[st]];
        let el = document.getElementById(`sheet-${st}`);
        if (el) el.value = score !== undefined ? score : "";
        let mod = calculateModifierRaw(score);
        let elMod = document.getElementById(`sheet-${st}-mod`);
        if (elMod) elMod.value = mod >= 0 ? `+${mod}` : mod;
    });

    ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(coin => { let el = document.getElementById(`coin-${coin}`); if(el) el.value = character.money?.[coin] || ""; });

    const textFields = ['equipment', 'attacks', 'features', 'traits', 'ideals', 'bonds', 'flaws', 'proficiencies'];
    textFields.forEach(field => {
        const el = document.getElementById(`sheet-${field}`);
        if(el) { el.value = character[field] || ""; if (field === 'attacks') autoResizeTextarea(el); }
    });

    let xpBtnDiv = document.getElementById("xp-buttons-container");
    if (xpBtnDiv) {
        let xp1 = 10, xp2 = 50, xp3 = 100;
        if (character.level >= 15) { xp1 = 1000; xp2 = 5000; xp3 = 10000; }
        else if (character.level >= 10) { xp1 = 500; xp2 = 1000; xp3 = 2500; }
        else if (character.level >= 5) { xp1 = 100; xp2 = 250; xp3 = 500; }
        else if (character.level >= 3) { xp1 = 50; xp2 = 100; xp3 = 250; }
        xpBtnDiv.innerHTML = `
            <button type="button" onclick="addXP(${xp1}); closeModal('modal-xp')" class="btn-panel">+${xp1} ОП</button>
            <button type="button" onclick="addXP(${xp2}); closeModal('modal-xp')" class="btn-panel">+${xp2} ОП</button>
            <button type="button" onclick="addXP(${xp3}); closeModal('modal-xp')" class="btn-panel">+${xp3} ОП</button>
            <button type="button" onclick="addOneLevel(); closeModal('modal-xp')" class="btn-panel" style="border-color: var(--gold); background: #fff8e7;">+1 Уровень</button>
        `;
    }

    let clsBtnContainer = document.getElementById("class-info-buttons");
    if (clsBtnContainer) {
        clsBtnContainer.innerHTML = `
            <button type="button" class="btn-panel" style="font-size: 0.85rem; padding: 10px;" onclick="showBookDescription('class')">📖 Класс: ${character.class || 'Нет'}</button>
            ${character.subclass ? `<button type="button" class="btn-panel" style="font-size: 0.85rem; padding: 10px;" onclick="showBookDescription('subclass')">📖 Архетип: ${character.subclass}</button>` : ''}
        `;
    }

    let isRogue = (character.class || "").toLowerCase().includes("плут");
    document.querySelectorAll('.exp-box').forEach(el => {
        if(isRogue) el.classList.remove('hidden'); else el.classList.add('hidden');
    });

    let casterClasses = getBaseCasterClasses();
    let btnSpellbook = document.getElementById("btn-spellbook");
    if (btnSpellbook) {
        if (casterClasses.length > 0) btnSpellbook.classList.remove("hidden");
        else btnSpellbook.classList.add("hidden");
    }

    renderInventory(); updateCalculations();
}

function showBookDescription(type) {
    let title = type === 'class' ? character.class : character.subclass;
    if (!title) return;
    let content = "";
    document.getElementById("book-title").textContent = title;
    
    let cleanTitle = title.replace(/\[.*?\]|\d+/g, '').trim();

    if (type === 'class') {
        content += `КЛАССОВЫЕ УМЕНИЯ (${cleanTitle})\nПоказаны особенности, доступные по мере роста в уровне:\n\n`;
        for (let i = 1; i <= 20; i++) {
            let abilities = getAbilitiesForLevel(cleanTitle, null, i).filter(a => !a.startsWith('[')); 
            if (abilities.length > 0) content += `[Уровень ${i}]\n- ` + abilities.join("\n- ") + `\n\n`;
        }
    } else {
        content += `ОСОБЕННОСТИ АРХЕТИПА (${cleanTitle})\n\n`;
        for (let i = 1; i <= 20; i++) if (typeof archFeatures !== 'undefined' && archFeatures[cleanTitle] && archFeatures[cleanTitle][i]) content += `[Уровень ${i}]\n- ${archFeatures[cleanTitle][i]}\n\n`;
    }
    document.getElementById("book-content").textContent = content; openModal('modal-book-text');
}

function updateChar(key, value) {
    if (key === 'name') character[key] = value.charAt(0).toUpperCase() + value.slice(1);
    else if (key === 'xp') { character.xp = Number(value); checkLevelUp(); updateCalculations(); } 
    else character[key] = value;
    saveGame();
}

function updateNested(group, key, value) { if (!character[group]) character[group] = {}; character[group][key] = value; saveGame(); }

function toggleProficiency(group, key, isChecked) {
    if (!character[group]) character[group] = {};
    character[group][key] = isChecked;
    saveGame(); updateCalculations();
}

function toggleExpertise(key, isChecked) {
    if (!character.expertiseProf) character.expertiseProf = {};
    character.expertiseProf[key] = isChecked;
    if (isChecked && (!character.skillsProf || !character.skillsProf[key])) {
        if (!character.skillsProf) character.skillsProf = {};
        character.skillsProf[key] = true;
    }
    saveGame(); updateCalculations();
}

function updateStat(statName, value) {
    if (value === "") character.stats[statName] = "";
    else character.stats[statName] = Math.max(0, Math.min(99, Number(value)));
    
    const idMap = { 'strength': 'str', 'dexterity': 'dex', 'constitution': 'con', 'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha' };
    const shortName = idMap[statName];
    
    let el = document.getElementById(`sheet-${shortName}`);
    if (el) el.value = character.stats[statName];
    
    let mod = calculateModifierRaw(character.stats[statName]);
    let elMod = document.getElementById(`sheet-${shortName}-mod`);
    if (elMod) elMod.value = mod >= 0 ? `+${mod}` : mod;
    
    saveGame(); 
    updateCalculations(); 
}

function rollDice(sides) {
    const resultDiv = document.getElementById("dice-result");
    resultDiv.textContent = Math.floor(Math.random() * sides) + 1;
    resultDiv.style.transform = "scale(1.3)"; resultDiv.style.color = "var(--gold)";
    setTimeout(() => { resultDiv.style.transform = "scale(1)"; resultDiv.style.color = "white"; }, 200);
}

function saveGame(pushToHistory = true) { 
    localStorage.setItem("dnd_char", JSON.stringify(character)); 
    if (pushToHistory && !isUndoing) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            let state = JSON.stringify(character);
            if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== state) {
                historyStack.push(state); if (historyStack.length > 30) historyStack.shift(); 
            }
        }, 600); 
    }
}

function undo() {
    if (historyStack.length > 1) {
        isUndoing = true; historyStack.pop(); 
        character = JSON.parse(historyStack[historyStack.length - 1]);
        saveGame(false); updateAllUI(); isUndoing = false;
    } else alert("Больше нет действий для отмены.");
}

function resetGame() {
    if(confirm("Вы уверены, что хотите удалить текущего персонажа? Убедитесь, что сделали экспорт (TXT)!")) {
        localStorage.removeItem("dnd_char");
        character = { name: "", race: "", subrace: "", class: "", subclass: "", background: "", level: 1, xp: 0, hp: 0, maxHp: 0, ac: "", initiative: "+0", speed: "30", proficiencyBonus: 2, inspiration: "", passivePerception: 10, stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, savesProf: { str: false, dex: false, con: false, int: false, wis: false, cha: false }, skillsProf: { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false }, expertiseProf: {}, money: { cp: "", sp: "", ep: "", gp: "", pp: "" }, inventory: [], spells: [], usedSlots: {}, equipment: "", attacks: "", features: "", proficiencies: "", traits: "", ideals: "", bonds: "", flaws: "" };
        historyStack = []; document.getElementById("loadGameBtn").classList.add("hidden"); document.getElementById("clearSaveBtn").classList.add("hidden"); document.getElementById("exportGameBtn").classList.add("hidden");
        alert("Персонаж успешно удален.");
    }
}

function exportTXT() {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    const now = new Date(); const d = String(now.getDate()).padStart(2, '0'); const m = String(now.getMonth() + 1).padStart(2, '0');
    a.download = `${(character.name || "Безымянный").replace(/[\\/:*?"<>|]/g, "")}_ур.${character.level || 1}_${d}.${m}.${now.getFullYear()}.txt`; 
    a.click(); URL.revokeObjectURL(url);
}

function importTXT(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && importedData.stats) {
                character = structuredClone({ ...character, ...importedData });
                if(!character.inventory) character.inventory = [];
                if(!character.spells) character.spells = [];
                if(!character.usedSlots) character.usedSlots = {};
                document.getElementById("loadGameBtn").classList.remove("hidden"); 
                document.getElementById("clearSaveBtn").classList.remove("hidden");
                document.getElementById("exportGameBtn").classList.remove("hidden");
                saveGame(); updateAllUI(); nextScreen('screen-sheet');
            } else alert("Неверный формат данных!");
        } catch (err) { alert("Ошибка чтения файла!"); }
    };
    reader.readAsText(file); event.target.value = ""; 
}

function autoResizeTextarea(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

// === КНИГА ЗАКЛИНАНИЙ И ЯЧЕЙКИ ===
let currentSpellLevel = 0;

function getMaxSpellLevel() {
    let type = "none";
    let cClasses = getBaseCasterClasses();
    
    if (["Бард", "Жрец", "Друид", "Волшебник", "Чародей"].some(c => cClasses.includes(c))) type = "full";
    else if (["Паладин", "Следопыт"].some(c => cClasses.includes(c))) type = "half";
    else if (cClasses.includes("Колдун")) type = "warlock";
    else if (character.subclass && (character.subclass.includes("Мистический рыцарь") || character.subclass.includes("Мистический ловкач"))) type = "third";
    
    if (type === "none") return 0;
    
    const maxLevels = {
        full:  [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9],
        half:  [0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
        third: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4],
        warlock: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9]
    };
    return maxLevels[type][character.level] || 0;
}

function getMaxSlots(charLvl, spellLvl) {
    if (spellLvl === 0) return 0;
    let type = "none";
    let cClasses = getBaseCasterClasses();
    
    if (["Бард", "Жрец", "Друид", "Волшебник", "Чародей"].some(c => cClasses.includes(c))) type = "full";
    else if (["Паладин", "Следопыт"].some(c => cClasses.includes(c))) type = "half";
    else if (cClasses.includes("Колдун")) type = "warlock";
    else if (character.subclass && (character.subclass.includes("Мистический рыцарь") || character.subclass.includes("Мистический ловкач"))) type = "third";
    
    if (type === "none") return 0;
    let lvl = Math.min(20, Math.max(1, charLvl));

    if (type === "warlock") {
        const pactSlots = [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4];
        const pactLevel = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
        
        if (spellLvl > 0 && spellLvl <= pactLevel[lvl]) {
            return pactSlots[lvl];
        } else if (spellLvl > 5) {
            const arcanum = {
                6: [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
                7: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                8: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
                9: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1]
            };
            return arcanum[spellLvl]?.[lvl] || 0;
        }
        return 0;
    }

    const fullSlots = {
        1: [0, 2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4], 2: [0, 0,0,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        3: [0, 0,0,0,0,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3], 4: [0, 0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3],
        5: [0, 0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,3,3,3], 6: [0, 0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2],
        7: [0, 0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2], 8: [0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
        9: [0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1]
    };
    const halfSlots = {
        1: [0, 0,2,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4], 2: [0, 0,0,0,0,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        3: [0, 0,0,0,0,0,0,0,0,2,2,3,3,3,3,3,3,3,3,3,3], 4: [0, 0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,3,3],
        5: [0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2]
    };
    const thirdSlots = {
        1: [0, 0,0,2,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4], 2: [0, 0,0,0,0,0,0,2,2,2,3,3,3,3,3,3,3,3,3,3,3],
        3: [0, 0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,3,3,3,3,3], 4: [0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1]
    };
    
    if (type === "full") return fullSlots[spellLvl]?.[lvl] || 0;
    if (type === "half") return halfSlots[spellLvl]?.[lvl] || 0;
    if (type === "third") return thirdSlots[spellLvl]?.[lvl] || 0;
    return 0;
}

function autoSelectSpells() {
    const defaults = {
        "Волшебник": ["Огненный снаряд", "Малая иллюзия", "Свет", "Волшебная стрела", "Щит"], 
        "Жрец": ["Священное пламя", "Указание", "Лечение ран", "Щит веры"],
        "Бард": ["Злая насмешка", "Малая иллюзия", "Лечение ран", "Слово исцеления"],
        "Друид": ["Друидическое искусство", "Указание", "Лечение ран", "Слово исцеления"],
        "Чародей": ["Огненный снаряд", "Малая иллюзия", "Дружба", "Шоковое прикосновение", "Волшебная стрела", "Щит"], 
        "Колдун": ["Мистический заряд", "Малая иллюзия", "Сглаз"],
        "Паладин": ["Щит веры", "Лечение ран"],
        "Следопыт": ["Метка охотника", "Лечение ран"]
    };
    
    let cClasses = getBaseCasterClasses();
    let baseCls = cClasses[0] || (character.class || "").replace(/\[.*?\]|\d+/g, '').trim();
    let toAdd = defaults[baseCls] || [];
    
    character.spells = [];
    toAdd.forEach(name => {
        let s = typeof spellsDB !== 'undefined' ? spellsDB.find(x => x.name === name) : null;
        if(s) character.spells.push({ id: Date.now()+Math.random(), name: s.name, level: s.level });
    });
    saveGame(); updateCalculations();
    closeModal('modal-initial-spells');
    alert("Стартовые заклинания добавлены!");
}

function openSpellbook() {
    renderSpellTabs(); selectSpellTab(0); openModal('modal-spellbook');
}

function renderSpellTabs() {
    let maxLvl = getMaxSpellLevel();
    let tabsHTML = "";
    for(let i = 0; i <= maxLvl; i++) {
        let label = i === 0 ? "Заговоры" : `${i} Круг`;
        let activeClass = i === currentSpellLevel ? "background-color: var(--gold); color: #000;" : "";
        tabsHTML += `<button type="button" class="btn-secondary" style="${activeClass} padding: 8px 12px; margin: 0; white-space: nowrap;" onclick="selectSpellTab(${i})">${label}</button>`;
    }
    document.getElementById('spell-tabs').innerHTML = tabsHTML;
}

function selectSpellTab(level) {
    currentSpellLevel = level;
    document.getElementById('spell-tab-title').innerText = level === 0 ? "Заговоры (0 круг)" : `${level} Круг`;
    renderSpellTabs(); 
    renderSpellbookList();
}

function renderSpellbookList() {
    let container = document.getElementById('spellbook-list');
    if(!character.spells) character.spells = [];
    if(!character.usedSlots) character.usedSlots = {};
    
    let stat = getSpellcastingStat();
    let statMod = calculateModifierRaw(character.stats[stat]);
    let pb = Math.floor((character.level - 1) / 4) + 2;
    let spellAttack = statMod + pb;
    let spellSaveDC = 8 + statMod + pb;
    
    let modStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;
    let atkStr = spellAttack >= 0 ? `+${spellAttack}` : `${spellAttack}`;

    let slotsHTML = "";
    let casterClasses = getBaseCasterClasses();
    if (casterClasses.length > 0) {
        slotsHTML += `<div style="background: #374151; color: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-around; text-align: center; font-size: 0.95rem;">
            <div><strong>Бонус атаки:</strong> <span style="color: var(--gold); font-size: 1.2rem; margin-left: 5px;">${atkStr}</span></div>
            <div><strong>Сл. Спаса:</strong> <span style="color: var(--gold); font-size: 1.2rem; margin-left: 5px;">${spellSaveDC}</span></div>
        </div>`;
    }

    let slotKey = currentSpellLevel;
    if (casterClasses.includes("Колдун") && currentSpellLevel >= 1 && currentSpellLevel <= 5) {
        slotKey = 'pact';
    }

    let maxSlots = getMaxSlots(character.level, currentSpellLevel);
    
    if (maxSlots > 0) {
        let used = character.usedSlots[slotKey] || 0;
        slotsHTML += `<div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
                <strong style="color: #333;">Доступно ячеек:</strong>
                <div id="spell-slots-container" style="display: inline-flex; gap: 5px; flex-wrap: wrap;">`;
        for (let i = 0; i < maxSlots; i++) {
            let isChecked = i < (maxSlots - used) ? "checked" : "";
            slotsHTML += `<input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #8b5cf6;" ${isChecked} onchange="toggleSpellSlot(${currentSpellLevel}, '${slotKey}')">`;
        }
        slotsHTML += `</div></div><span style="font-size: 0.7rem; color: #666;">Снимите галочку при касте</span></div>`;
    }

    let filtered = character.spells.filter(s => s.level === currentSpellLevel);
    let html = filtered.map(sp => {
        let dbSp = typeof spellsDB !== 'undefined' ? spellsDB.find(s => s.name === sp.name) : null;
        let desc = dbSp ? dbSp.desc : "";
        
        desc = desc.replace(/\+\s*мод\.?\s*магии/gi, modStr);
        desc = desc.replace(/\+\s*мод\.?/gi, modStr);

        return `<div class="inv-item-row" style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #ddd; font-size: 0.95rem; gap: 10px;">
            <div style="flex:1;">
                <strong>${sp.name}</strong><br>
                <span style="font-size:0.8rem; color:#888;">${desc}</span>
            </div>
            <button class="btn-danger" style="padding: 3px 8px; margin:0; font-size: 0.8rem; flex-shrink: 0;" onclick="removeSpell(${sp.id})">✖</button>
        </div>`;
    }).join('');
    
    container.innerHTML = slotsHTML + (html || "<p style='color:#888; text-align:center; padding-top:20px;'>В этом круге пока нет заклинаний</p>");
}

function toggleSpellSlot(level, slotKey) {
    if (!character.usedSlots) character.usedSlots = {};
    let container = document.getElementById('spell-slots-container');
    if(!container) return;
    
    let checkboxes = container.querySelectorAll('input[type="checkbox"]');
    let checkedCount = 0;
    checkboxes.forEach(cb => { if(cb.checked) checkedCount++; });
    
    let maxSlots = getMaxSlots(character.level, level);
    character.usedSlots[slotKey] = maxSlots - checkedCount;
    saveGame(false);
}

function openSpellDB() {
    document.getElementById('modal-spell-db').classList.remove('hidden');
    let container = document.getElementById('spell-db-list-container');
    
    let cClasses = getBaseCasterClasses();
    if (cClasses.length === 0) cClasses = [(character.class || "Неизвестный").replace(/\[.*?\]|\d+/g, '').trim()];

    if (typeof spellsDB === 'undefined' || !Array.isArray(spellsDB)) {
        container.innerHTML = `<p style='text-align:center; color:red;'>Ошибка: файл spells.js не подключен или пуст.</p>`;
        return;
    }

    let spells = spellsDB.filter(s => {
        if (s.level !== currentSpellLevel) return false;
        if (!s.classes || !Array.isArray(s.classes)) return true; 
        
        let isClassMatch = false;
        for (let dbClass of s.classes) {
            for (let myClass of cClasses) {
                if (dbClass.toLowerCase().trim() === myClass.toLowerCase().trim()) {
                    isClassMatch = true;
                }
            }
        }

        if (!isClassMatch && cClasses.includes("Раса")) {
            if (currentSpellLevel === 0 && character.race.toLowerCase().includes("эльф") && s.classes.map(c => c.toLowerCase()).includes("волшебник")) {
                isClassMatch = true;
            }
        }

        return isClassMatch;
    });
    
    let html = spells.map((sp) => {
        return `<div class="inv-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
            <div style="padding-right: 15px;"><strong>${sp.name}</strong><br><span style="font-size:0.8rem; color:#888;">${sp.desc}</span></div>
            <button class="btn-secondary" style="padding: 5px 10px; margin:0; white-space: nowrap;" onclick="addSpell('${sp.name}', ${sp.level})">Добавить</button>
        </div>`;
    }).join('');
    
    let classesStr = cClasses.join(', ');
    container.innerHTML = html || `<p style='text-align:center;'>Для <strong>${classesStr}</strong> нет доступных заклинаний ${currentSpellLevel} круга в базе.</p>`;
}

function addSpell(name, level) {
    if(!character.spells) character.spells = [];
    if(character.spells.find(s => s.name === name)) return alert("Это заклинание уже есть в вашей книге!");
    
    character.spells.push({ id: Date.now() + Math.random(), name, level });
    saveGame(); 
    renderSpellbookList(); 
    updateCalculations();
    
    alert(`Добавлено: ${name}`);
}

function removeSpell(id) {
    character.spells = character.spells.filter(s => s.id !== id);
    saveGame(); renderSpellbookList(); updateCalculations();
}