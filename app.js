let character = {
    name: "", race: "", subrace: "", class: "", subclass: "", background: "",
    level: 1, xp: 0, hp: 0, maxHp: 0,
    ac: "", initiative: "+0", speed: "30",
    proficiencyBonus: 2, inspiration: "", passivePerception: 10,
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    savesProf: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skillsProf: { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false },
    money: { cp: "", sp: "", ep: "", gp: "", pp: "" },
    inventory: [], 
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
        if(clearBtn) clearBtn.classList.remove("hidden");
        
        character = JSON.parse(saved);
        if(!character.inventory) character.inventory = [];
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
    if (mode === 'roll') {
        values = [rollStat(), rollStat(), rollStat(), rollStat(), rollStat(), rollStat()].sort((a, b) => b - a);
    }

    let prio = classStatPriority[character.class] || ["strength", "dexterity"];
    let rest = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].filter(s => !prio.includes(s));
    
    if (mode === 'roll') {
        rest.sort(() => Math.random() - 0.5);
    }

    // 1. Умное распределение
    let keysForAssignment = [...prio, ...rest];
    let tempStats = {};
    for (let i = 0; i < 6; i++) {
        tempStats[keysForAssignment[i]] = values[i];
    }
    
    // 2. Расовые бонусы
    let rData = racesData[character.race];
    if (rData && rData.stats) {
        for (let k in rData.stats) {
            if (tempStats[k] !== undefined) tempStats[k] += rData.stats[k];
        }
    }
    
    if (character.subrace && subraceData[character.race]) {
        let srData = subraceData[character.race].find(x => x.name === character.subrace);
        if (srData && srData.stats) {
            for (let k in srData.stats) {
                if (tempStats[k] !== undefined) tempStats[k] += srData.stats[k];
            }
        }
    }

    // 3. Жесткий порядок для вывода
    const fixedOrder = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    character.stats = {};
    fixedOrder.forEach(k => {
        character.stats[k] = tempStats[k];
    });

    const labels = { strength: "Сила", dexterity: "Ловкость", constitution: "Телосложение", intelligence: "Интеллект", wisdom: "Мудрость", charisma: "Харизма" };
    const grid = document.getElementById("stats-grid");
    
    if (grid) {
        grid.innerHTML = fixedOrder.map(k => 
            `<div class="stat-row" style="align-items: center;">
                <span>${labels[k]}</span>
                <input type="number" 
                       value="${character.stats[k]}" 
                       oninput="character.stats['${k}'] = this.value === '' ? '' : Number(this.value)" 
                       style="width: 60px; text-align: center; font-size: 1.1rem; padding: 4px; border-radius: 6px; border: 1px solid #4b5563; background: var(--panel-bg); color: var(--gold); font-weight: bold; outline: none; font-family: sans-serif;">
            </div>`
        ).join("");
    }

    const infoText = mode === 'standard' ? "Распределен Стандартный набор (15, 14, 13, 12, 10, 8) + Бонусы Расы." : "Случайный бросок кубиков (4d6k3) + Бонусы Расы.";
    const pEl = document.getElementById("stats-info");
    
    if (pEl) {
        pEl.innerHTML = infoText + `<br><span style="font-size: 0.8rem;">Максимальные значения уходят в главные характеристики класса. <strong>Вы можете отредактировать их вручную!</strong></span>`;
    }
}

function setBackground(bg) {
    character.background = bg;
    character.savesProf = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
    character.skillsProf = { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false };
    
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

    let classFeatures = "", classProfs = "";
    character.hp = 0; character.maxHp = 0; 
    
    character.inventory = [];
    const addGear = (name, eq=true) => { character.inventory.push({ id: Date.now()+Math.random(), name: name, equipped: eq }); };

    if (character.class === "Варвар") {
        character.savesProf.str = true; character.savesProf.con = true; character.skillsProf.ath = true; character.skillsProf.sur = true;
        classProfs = "Легкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Варвар 1 ур.]\n- Ярость (2/отдых): преим. на Силу; +2 урон; сопротивление физ. урону.\n- Защита без доспехов (КД=10+ЛОВ+ТЕЛ).";
        addGear("Секира"); addGear("Ручной топор"); addGear("Ручной топор"); addGear("Метательное копье");
    } else if (character.class === "Воин") {
        character.savesProf.str = true; character.savesProf.con = true; character.skillsProf.ath = true; character.skillsProf.inti = true;
        classProfs = "Все доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Воин 1 ур.]\n- Боевой стиль (Дуэлянт: +2 к урону 1-ручн.)\n- Второе дыхание (хил 1d10+ур бонусным действием).";
        addGear("Длинный меч"); addGear("Щит"); addGear("Кольчужная рубаха");
    } else if (character.class === "Волшебник") {
        character.savesProf.int = true; character.savesProf.wis = true; character.skillsProf.arc = true; character.skillsProf.his = true;
        classProfs = "Кинжалы, дротики, пращи, посохи, легкие арбалеты.";
        classFeatures = "[Волшебник 1 ур.]\n- Тайное восстановление.\nЯчейки: 2 (1 круг). Фокусы: Огненный снаряд.";
        addGear("Боевой посох"); addGear("Книга заклинаний", false);
    } else if (character.class === "Жрец") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.rel = true; character.skillsProf.med = true;
        classProfs = "Легкие/средние доспехи, щиты, простое оружие.";
        classFeatures = "[Жрец 1 ур.]\n- Владение магией.\nЯчейки: 2 (1 круг). Фокусы: Священное пламя.";
        addGear("Булава"); addGear("Кольчужная рубаха"); addGear("Щит");
    } else if (character.class === "Бард") {
        character.savesProf.dex = true; character.savesProf.cha = true; character.skillsProf.acr = true; character.skillsProf.per = true; character.skillsProf.prf = true;
        classProfs = "Легкие доспехи, простое, ручные арбалеты, рапиры, короткие мечи. 3 инструмента.";
        classFeatures = "[Бард 1 ур.]\n- Вдохновение барда (d6)\nЯчейки: 2 (1 круг). Фокусы: Злая насмешка.";
        addGear("Рапира"); addGear("Кожаная броня"); addGear("Кинжал");
    } else if (character.class === "Друид") {
        character.savesProf.int = true; character.savesProf.wis = true; character.skillsProf.nat = true; character.skillsProf.med = true;
        classProfs = "Легкие/средние доспехи, щиты (НЕ из металла). Дубинки, кинжалы, копья, посохи, скимитары.";
        classFeatures = "[Друид 1 ур.]\n- Друидический язык.\nЯчейки: 2 (1 круг). Фокусы: Производство пламени.";
        addGear("Боевой посох"); addGear("Кожаная броня"); addGear("Щит");
    } else if (character.class === "Монах") {
        character.savesProf.str = true; character.savesProf.dex = true; character.skillsProf.acr = true; character.skillsProf.ste = true;
        classProfs = "Простое оружие, короткие мечи.";
        classFeatures = "[Монах 1 ур.]\n- Защита без доспехов (КД=10+ЛОВ+МУД).\n- Боевые искусства (урон без оружия 1d4, бонусная атака).";
        addGear("Короткий меч"); addGear("Дротик"); addGear("Дротик");
    } else if (character.class === "Паладин") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.ath = true; character.skillsProf.rel = true;
        classProfs = "Все доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Паладин 1 ур.]\n- Божественное чувство.\n- Наложение рук.";
        addGear("Длинный меч"); addGear("Кольчуга"); addGear("Щит"); addGear("Метательное копье");
    } else if (character.class === "Следопыт") {
        character.savesProf.str = true; character.savesProf.dex = true; character.skillsProf.ste = true; character.skillsProf.sur = true;
        classProfs = "Легкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Следопыт 1 ур.]\n- Избранный враг.\n- Исследователь природы.";
        addGear("Длинный лук"); addGear("Короткий меч"); addGear("Короткий меч"); addGear("Чешуйчатый доспех");
    } else if (character.class === "Плут") {
        character.savesProf.dex = true; character.savesProf.int = true; character.skillsProf.ste = true; character.skillsProf.acr = true; character.skillsProf.slg = true; character.skillsProf.dec = true;
        classProfs = "Легкая броня, простое, ручные арбалеты, длинные/короткие мечи, рапиры. Воровские инструменты.";
        classFeatures = "[Плут 1 ур.]\n- Компетентность.\n- Скрытая атака (+1d6).";
        addGear("Рапира"); addGear("Кинжал"); addGear("Кожаная броня");
    } else if (character.class === "Чародей") {
        character.savesProf.con = true; character.savesProf.cha = true; character.skillsProf.arc = true; character.skillsProf.dec = true;
        classProfs = "Кинжалы, дротики, пращи, боевые посохи, легкие арбалеты.";
        classFeatures = "[Чародей 1 ур.]\n- Использование магии.\nЯчейки: 2 (1 круг). Фокусы: Огненный снаряд.";
        addGear("Боевой посох"); addGear("Кинжал");
    } else if (character.class === "Колдун") {
        character.savesProf.wis = true; character.savesProf.cha = true; character.skillsProf.arc = true; character.skillsProf.inti = true;
        classProfs = "Легкие доспехи, простое оружие.";
        classFeatures = "[Колдун 1 ур.]\n- Договор Покровителя.\nЯчейки: 1 (1 круг). Фокусы: Мистический заряд.";
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

    updateCalculations();
    character.hp = character.maxHp; 
    
    let loadBtn = document.getElementById("loadGameBtn");
    let clearBtn = document.getElementById("clearSaveBtn");
    if(loadBtn) loadBtn.classList.remove("hidden");
    if(clearBtn) clearBtn.classList.remove("hidden");

    saveGame(); updateAllUI(); nextScreen('screen-sheet');
}

// === СИСТЕМА ИНВЕНТАРЯ И БАЗЫ ДАННЫХ ===
function getDBItem(name) {
    for(let cat in itemsDB) {
        let found = itemsDB[cat].find(i => i.name === name);
        if(found) return found;
    }
    return null;
}

function openInventoryDB() {
    document.getElementById('modal-item-db').classList.remove('hidden');
    renderDBList('weapons');
}

function renderDBList(category) {
    let container = document.getElementById('db-list-container');
    let items = itemsDB[category];
    let html = items.map((item, index) => {
        let details = "";
        if(category === 'weapons') details = `${item.dmg} ${item.dmgType} | ${item.prop.join(", ")}`;
        else if (category === 'armor') details = item.type === "Щит" ? `+2 КД` : `КД: ${item.ac}`;
        else details = item.desc;
        
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
    saveGame();
    renderInventory();
    alert(`Добавлено в рюкзак: ${item.name}`);
}

function renderInventory() {
    if(!character.inventory) character.inventory = [];
    let container = document.getElementById('inventory-list');
    if(!container) return;
    
    let html = character.inventory.map(item => {
        let dbItem = getDBItem(item.name);
        let isEquippable = dbItem && (itemsDB.weapons.includes(dbItem) || itemsDB.armor.includes(dbItem));
        
        let equipHTML = isEquippable ? 
            `<input type="checkbox" style="margin-right: 10px; width:16px; height:16px; cursor:pointer;" onchange="toggleEquip(${item.id}, this.checked)" ${item.equipped ? 'checked' : ''} title="Надеть/Снять">` : 
            `<span style="display:inline-block; width:26px;"></span>`;
            
        return `<div class="inv-item-row" style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #ddd; font-size: 0.95rem;">
            <div style="flex:1; display:flex; align-items:center;">
                ${equipHTML}
                <strong>${item.name}</strong>
            </div>
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
            // Если надеваем броню (и это не щит), снимаем остальную броню
            if(dbItem && itemsDB.armor.includes(dbItem) && dbItem.type !== "Щит") {
                character.inventory.forEach(i => {
                    let other = getDBItem(i.name);
                    if(other && itemsDB.armor.includes(other) && other.type !== "Щит" && i.id !== id) i.equipped = false;
                });
            }
        }
        item.equipped = isEquipped;
        saveGame();
        updateCalculations();
        renderInventory(); 
    }
}

function removeFromInventory(id) {
    character.inventory = character.inventory.filter(i => i.id !== id);
    saveGame();
    updateCalculations();
    renderInventory();
}

function addXP(amount) {
    character.xp = (character.xp || 0) + amount;
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp();
}

function addOneLevel() {
    if (character.level >= 20) return alert("Достигнут максимальный (20) уровень!");
    const xpThresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    character.xp = xpThresholds[character.level];
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp();
}

function checkLevelUp() {
    let oldLevel = character.level;
    let targetLevel = 1;
    const xpThresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    
    for (let i = 19; i >= 0; i--) {
        if (character.xp >= xpThresholds[i]) {
            targetLevel = i + 1;
            break;
        }
    }

    if (targetLevel > oldLevel) {
        let scInfo = subclassData[character.class];
        let needsSubclass = (scInfo && targetLevel >= scInfo.lvl && !character.subclass);
        showLevelUpModal(oldLevel, targetLevel, needsSubclass ? scInfo.opts : null);
    } else {
        updateCalculations(); saveGame(); updateAllUI();
    }
}

function showLevelUpModal(oldLvl, newLvl, subclassOpts) {
    let newAbilities = [];
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
    for (let lvl = oldLvl + 1; lvl <= newLvl; lvl++) {
        newAbilities.push(...getAbilitiesForLevel(character.class, character.subclass, lvl));
    }

    if (newAbilities.length > 0) {
        let abilitiesText = `\n\n[Получено при повышении до ${newLvl} ур.]\n- ` + newAbilities.join("\n- ");
        character.features += abilitiesText;
    }

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
    document.getElementById('sheet-hp').value = character.hp;
    saveGame();
}

function calculateModifierRaw(score) {
    let num = Number(score);
    if (isNaN(num) || score === "") num = 10;
    return Math.floor((num - 10) / 2); 
}

function updateCalculations() {
    let pb = Math.floor((character.level - 1) / 4) + 2;
    document.getElementById('sheet-prof').value = "+" + pb;

    // --- РАСЧЕТ ИСЦЕЛЕНИЯ (HP) ---
    let conMod = calculateModifierRaw(character.stats['constitution']);
    let hpBase = 0, hpPerLevel = 0;
    
    if (character.class === "Варвар") { hpBase = 12; hpPerLevel = 7; }
    else if (["Воин", "Паладин", "Следопыт"].includes(character.class)) { hpBase = 10; hpPerLevel = 6; }
    else if (["Жрец", "Бард", "Друид", "Монах", "Плут", "Колдун"].includes(character.class)) { hpBase = 8; hpPerLevel = 5; }
    else if (["Волшебник", "Чародей"].includes(character.class)) { hpBase = 6; hpPerLevel = 4; }

    if (hpBase > 0) {
        let newMaxHp = (hpBase + conMod) + (character.level - 1) * (hpPerLevel + conMod);
        if (character.subclass === "Наследие Драконов" || (character.class === "Чародей" && character.level < 3 && character.features.includes("Наследие драконов"))) {
            newMaxHp += character.level; 
        }
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

    // --- РАСЧЕТ КД (AC) С УЧЕТОМ ЭКИПИРОВКИ ---
    let dexMod = calculateModifierRaw(character.stats['dexterity']);
    let wisMod = calculateModifierRaw(character.stats['wisdom']);
    let conModActual = calculateModifierRaw(character.stats['constitution']);

    let equippedArmorItem = character.inventory.find(i => i.equipped && getDBItem(i.name) && itemsDB.armor.includes(getDBItem(i.name)) && getDBItem(i.name).type !== "Щит");
    let equippedShieldItem = character.inventory.find(i => i.equipped && getDBItem(i.name) && getDBItem(i.name).type === "Щит");
    
    let dbArmor = equippedArmorItem ? getDBItem(equippedArmorItem.name) : null;
    let ac = 10 + dexMod;
    
    if (dbArmor) {
        if (dbArmor.dexMod) ac = dbArmor.ac + Math.min(dexMod, dbArmor.dexMax);
        else ac = dbArmor.ac; // Тяжелая броня (без ловкости)
    } else {
        // Защита без доспехов
        if (character.class === "Варвар") ac = 10 + dexMod + conModActual;
        else if (character.class === "Монах") ac = 10 + dexMod + wisMod;
        else if (character.class === "Чародей" && (character.subclass === "Наследие Драконов" || character.level < 3)) ac = 13 + dexMod;
    }
    
    if (equippedShieldItem) ac += 2;
    character.ac = ac;
    document.getElementById('sheet-ac').value = character.ac;

    // --- РАСЧЕТ СКОРОСТИ ---
    let baseSpeed = 30;
    if (["Дварф", "Полурослик", "Гном"].includes(character.race)) baseSpeed = 25;
    if (character.subrace === "Лесной эльф") baseSpeed = 35;
    
    let speedBonus = 0;
    if (character.class === "Монах") {
        if (character.level >= 18) speedBonus = 30;
        else if (character.level >= 14) speedBonus = 25;
        else if (character.level >= 10) speedBonus = 20;
        else if (character.level >= 6) speedBonus = 15;
        else if (character.level >= 2) speedBonus = 10;
    } else if (character.class === "Варвар" && character.level >= 5) {
        speedBonus = 10;
    }

    character.speed = (baseSpeed + speedBonus).toString();
    let speedInput = document.getElementById('sheet-speed');
    if(speedInput) speedInput.value = character.speed;

    // --- ИНИЦИАТИВА ---
    let halfPb = Math.floor(pb / 2);
    let isBardJack = (character.class === "Бард" && character.level >= 2);
    let isChampionAthlete = (character.subclass === "Чемпион" && character.level >= 7);

    let initMod = dexMod;
    if (isBardJack) initMod += halfPb;
    else if (isChampionAthlete) initMod += Math.ceil(pb / 2);
    
    character.initiative = initMod >= 0 ? `+${initMod}` : `${initMod}`;
    document.getElementById('sheet-init').value = character.initiative;

    // --- АВТОМАТИЧЕСКИЙ РАСЧЕТ АТАК ОРУЖИЕМ ---
    let autoAttacksHTML = "";
    let strMod = calculateModifierRaw(character.stats['strength']);
    
    let weapons = character.inventory.filter(i => i.equipped && getDBItem(i.name) && itemsDB.weapons.includes(getDBItem(i.name)));
    weapons.forEach(w => {
        let dbW = getDBItem(w.name);
        
        let attr = dbW.attr || "str";
        let typeStr = (dbW.type || "").toLowerCase();
        let isMonkWeap = character.class === "Монах" && (typeStr.includes("простое") || w.name === "Короткий меч");

        let useDex = (attr === "dex") || (attr === "finesse" && dexMod > strMod) || (isMonkWeap && dexMod > strMod);
        let mod = useDex ? dexMod : strMod;
        let hit = mod + pb; // Предполагаем владение (Proficiency) всем надетым оружием
        let hitStr = hit >= 0 ? `+${hit}` : hit;

        let dmgMod = mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : "";
        let dmgDice = dbW.dmg;
        
        // Урон монаха растет с уровнем
        if(isMonkWeap && character.level >= 5) {
            let monkDice = character.level >= 17 ? "1d10" : (character.level >= 11 ? "1d8" : "1d6");
            if(parseInt(dmgDice.split('d')[1]) < parseInt(monkDice.split('d')[1])) dmgDice = monkDice;
        }
        
        autoAttacksHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #ccc; font-size:0.85rem; padding: 4px 0;">
            <span style="font-weight:bold; width: 45%;">${w.name}</span>
            <span style="width: 15%; text-align:center;">${hitStr}</span>
            <span style="width: 40%; text-align:right;">${dmgDice}${dmgMod} ${dbW.dmgType}</span>
        </div>`;
    });
    
    if (character.class === "Монах") {
        let monkDice = character.level >= 17 ? "1d10" : (character.level >= 11 ? "1d8" : (character.level >= 5 ? "1d6" : "1d4"));
        let mod = Math.max(strMod, dexMod);
        let hitStr = (mod + pb) >= 0 ? `+${mod + pb}` : (mod + pb);
        let dmgMod = mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : "";
        autoAttacksHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #ccc; font-size:0.85rem; padding: 4px 0;">
            <span style="font-weight:bold; width: 45%;">Удар без оружия</span>
            <span style="width: 15%; text-align:center;">${hitStr}</span>
            <span style="width: 40%; text-align:right;">${monkDice}${dmgMod} дроб</span>
        </div>`;
    }
    document.getElementById("auto-attacks-list").innerHTML = autoAttacksHTML;

    // --- СПАСБРОСКИ ---
    for (let sv in saveToStat) {
        let statName = saveToStat[sv];
        let mod = calculateModifierRaw(character.stats[statName]);
        let isProf = character.savesProf && character.savesProf[sv];
        
        let bonus = 0;
        if (isProf) bonus = pb;
        else if (isChampionAthlete && ['strength', 'dexterity', 'constitution'].includes(statName)) bonus = Math.ceil(pb / 2);

        let total = mod + bonus;
        let elVal = document.getElementById(`sv-${sv}-val`);
        let elChk = document.getElementById(`sv-${sv}`);
        if(elVal) elVal.value = (total >= 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
    }

    // --- НАВЫКИ ---
    for (let sk in skillToStat) {
        let statName = skillToStat[sk];
        let mod = calculateModifierRaw(character.stats[statName]);
        let isProf = character.skillsProf && character.skillsProf[sk];
        
        let bonus = 0;
        if (isProf) {
            bonus = pb;
        } else {
            if (isBardJack) bonus = halfPb;
            else if (isChampionAthlete && ['strength', 'dexterity', 'constitution'].includes(statName)) bonus = Math.ceil(pb / 2);
        }

        let total = mod + bonus;
        let elVal = document.getElementById(`sk-${sk}-val`);
        let elChk = document.getElementById(`sk-${sk}`);
        if(elVal) elVal.value = (total >= 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
    }

    let wisModCalc = calculateModifierRaw(character.stats['wisdom']);
    let prcProf = (character.skillsProf && character.skillsProf['prc']) ? pb : (isBardJack ? halfPb : 0);
    document.getElementById('sheet-pass-perc').value = 10 + wisModCalc + prcProf;
}

function updateAllUI() {
    document.getElementById("sheet-name").value = character.name || "";
    let sub = character.subrace ? ` (${character.subrace})` : "";
    document.getElementById("sheet-race").value = (character.race || "") + sub;
    let clsSub = character.subclass ? ` [${character.subclass}]` : "";
    document.getElementById("sheet-class").value = `${character.class || ""}${clsSub} ${character.level || 1}`;
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

    ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(coin => {
        let el = document.getElementById(`coin-${coin}`);
        if(el) el.value = character.money?.[coin] || "";
    });

    const textFields = ['equipment', 'attacks', 'features', 'traits', 'ideals', 'bonds', 'flaws', 'proficiencies'];
    textFields.forEach(field => {
        const el = document.getElementById(`sheet-${field}`);
        if(el) {
            el.value = character[field] || "";
            // Автоматически подгоняем высоту для поля заклинаний
            if (field === 'attacks') autoResizeTextarea(el);
        }
    });

    let xpBtnDiv = document.getElementById("xp-buttons-container");
    if (xpBtnDiv) {
        let xp1 = 10, xp2 = 50, xp3 = 100;
        if (character.level >= 15) { xp1 = 1000; xp2 = 5000; xp3 = 10000; }
        else if (character.level >= 10) { xp1 = 500; xp2 = 1000; xp3 = 2500; }
        else if (character.level >= 5) { xp1 = 100; xp2 = 250; xp3 = 500; }
        else if (character.level >= 3) { xp1 = 50; xp2 = 100; xp3 = 250; }
        
        xpBtnDiv.innerHTML = `
            <button type="button" onclick="addXP(${xp1})" class="btn-xp">+${xp1} ОП</button>
            <button type="button" onclick="addXP(${xp2})" class="btn-xp">+${xp2} ОП</button>
            <button type="button" onclick="addXP(${xp3})" class="btn-xp">+${xp3} ОП</button>
            <button type="button" onclick="addOneLevel()" class="btn-xp" style="background-color: var(--gold); color: #000; font-weight: bold;" title="Повысить уровень">+1 Ур.</button>
        `;
    }

    let clsBtnContainer = document.getElementById("class-info-buttons");
    if (clsBtnContainer) {
        clsBtnContainer.innerHTML = `
            <button type="button" class="btn-panel" style="font-size: 0.85rem; padding: 10px;" onclick="showBookDescription('class')">📖 Класс: ${character.class || 'Нет'}</button>
            ${character.subclass ? `<button type="button" class="btn-panel" style="font-size: 0.85rem; padding: 10px;" onclick="showBookDescription('subclass')">📖 Архетип: ${character.subclass}</button>` : ''}
        `;
    }

    renderInventory();
    updateCalculations();
}

function showBookDescription(type) {
    let title = type === 'class' ? character.class : character.subclass;
    if (!title) return;
    
    let content = "";
    document.getElementById("book-title").textContent = title;
    
    if (type === 'class') {
        content += `КЛАССОВЫЕ УМЕНИЯ (${title})\nПоказаны особенности, доступные по мере роста в уровне:\n\n`;
        for (let i = 1; i <= 20; i++) {
            let abilities = getAbilitiesForLevel(title, null, i);
            let filtered = abilities.filter(a => !a.startsWith('[')); 
            if (filtered.length > 0) content += `[Уровень ${i}]\n- ` + filtered.join("\n- ") + `\n\n`;
        }
    } else {
        content += `ОСОБЕННОСТИ АРХЕТИПА (${title})\n\n`;
        for (let i = 1; i <= 20; i++) {
            if (typeof archFeatures !== 'undefined' && archFeatures[title] && archFeatures[title][i]) {
                content += `[Уровень ${i}]\n- ${archFeatures[title][i]}\n\n`;
            }
        }
    }
    
    document.getElementById("book-content").textContent = content;
    openModal('modal-book-text');
}

function updateChar(key, value) {
    if (key === 'name') {
        value = value.charAt(0).toUpperCase() + value.slice(1);
        character[key] = value;
    }
    else if (key === 'class') character.class = value.replace(/\d+/g, '').trim(); 
    else if (key === 'xp') { character.xp = Number(value); checkLevelUp(); updateCalculations(); } 
    else character[key] = value;
    saveGame();
}

function updateNested(group, key, value) {
    if (!character[group]) character[group] = {};
    character[group][key] = value;
    saveGame();
}

function toggleProficiency(group, key, isChecked) {
    if (!character[group]) character[group] = {};
    character[group][key] = isChecked;
    saveGame(); updateCalculations();
}

function updateStat(statName, value) {
    if (value === "") {
        character.stats[statName] = "";
    } else {
        let numValue = Number(value);
        if (numValue > 99) numValue = 99;
        if (numValue < 0) numValue = 0;
        character.stats[statName] = numValue;
    }
    
    const idMap = { 'strength': 'str', 'dexterity': 'dex', 'constitution': 'con', 'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha' };
    let el = document.getElementById(`sheet-${idMap[statName]}`);
    if (el) el.value = character.stats[statName];

    let mod = calculateModifierRaw(character.stats[statName]);
    let elMod = document.getElementById(`sheet-${idMap[statName]}-mod`);
    if (elMod) elMod.value = mod >= 0 ? `+${mod}` : mod;
    
    saveGame(); updateCalculations(); 
}

function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const resultDiv = document.getElementById("dice-result");
    resultDiv.textContent = result;
    resultDiv.style.transform = "scale(1.3)"; resultDiv.style.color = "var(--gold)";
    setTimeout(() => { resultDiv.style.transform = "scale(1)"; resultDiv.style.color = "white"; }, 200);
}

function saveGame(pushToHistory = true) { 
    localStorage.setItem("dnd_char", JSON.stringify(character)); 
    if (pushToHistory && !isUndoing) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            let currentState = JSON.stringify(character);
            if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== currentState) {
                historyStack.push(currentState);
                if (historyStack.length > 30) historyStack.shift(); 
            }
        }, 600); 
    }
}

function undo() {
    if (historyStack.length > 1) {
        isUndoing = true;
        historyStack.pop(); 
        let previousState = historyStack[historyStack.length - 1]; 
        character = JSON.parse(previousState);
        saveGame(false); 
        updateAllUI();
        isUndoing = false;
    } else {
        alert("Больше нет действий для отмены.");
    }
}

function resetGame() {
    if(confirm("Вы уверены, что хотите удалить текущего персонажа? Убедитесь, что сделали экспорт (TXT)!")) {
        localStorage.removeItem("dnd_char");
        
        let loadBtn = document.getElementById("loadGameBtn");
        let clearBtn = document.getElementById("clearSaveBtn");
        if(loadBtn) loadBtn.classList.add("hidden");
        if(clearBtn) clearBtn.classList.add("hidden");
        
        character = {
            name: "", race: "", subrace: "", class: "", subclass: "", background: "",
            level: 1, xp: 0, hp: 0, maxHp: 0, ac: "", initiative: "+0", speed: "30",
            proficiencyBonus: 2, inspiration: "", passivePerception: 10,
            stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            savesProf: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
            skillsProf: { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false },
            money: { cp: "", sp: "", ep: "", gp: "", pp: "" }, inventory: [],
            equipment: "", attacks: "", features: "", proficiencies: "",
            traits: "", ideals: "", bonds: "", flaws: ""
        };
        
        historyStack = [];
        alert("Персонаж успешно удален.");
    }
}

function exportTXT() {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    const safeName = (character.name || "Безымянный").replace(/[\\/:*?"<>|]/g, "");
    const lvl = character.level || 1;
    
    a.download = `${safeName}_ур.${lvl}_${d}.${m}.${y}_${h}-${min}.txt`; 
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
                let loadBtn = document.getElementById("loadGameBtn");
                let clearBtn = document.getElementById("clearSaveBtn");
                if(loadBtn) loadBtn.classList.remove("hidden");
                if(clearBtn) clearBtn.classList.remove("hidden");

                saveGame(); updateAllUI(); nextScreen('screen-sheet');
            } else alert("Неверный формат данных!");
        } catch (err) { alert("Ошибка чтения файла!"); }
    };
    reader.readAsText(file);
    event.target.value = ""; 
}

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}