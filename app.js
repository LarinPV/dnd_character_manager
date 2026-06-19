let character = {
    name: "", race: "", class: "", background: "",
    level: 1, xp: 0, hp: 0, maxHp: 0,
    ac: "", initiative: "+0", speed: "30",
    proficiencyBonus: 2, inspiration: "", passivePerception: 10,
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    
    savesProf: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skillsProf: { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false },
    
    money: { cp: "", sp: "", ep: "", gp: "", pp: "" },
    equipment: "", attacks: "", features: "", proficiencies: "",
    traits: "", ideals: "", bonds: "", flaws: ""
};

const skillToStat = {
    acr: 'dexterity', ath: 'strength', prc: 'wisdom', sur: 'wisdom', ani: 'wisdom',
    inti: 'charisma', prf: 'charisma', his: 'intelligence', slg: 'dexterity',
    arc: 'intelligence', med: 'wisdom', dec: 'charisma', nat: 'intelligence',
    ins: 'wisdom', inv: 'intelligence', rel: 'intelligence', ste: 'dexterity', per: 'charisma'
};
const saveToStat = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom', cha: 'charisma' };

// --- ГЕНЕРАТОРЫ СЛУЧАЙНЫХ ДАННЫХ ДЛЯ ПРЕДЫСТОРИЙ ---
const randomLanguages = ["Эльфийский", "Дварфийский", "Орочий", "Драконий", "Гоблинский", "Великаний", "Гномьей", "Небесный"];
const randomTools = ["Инструменты вора", "Набор травника", "Инструменты кузнеца", "Инструменты пивовара", "Игровые карты", "Кости"];

const randomTraitsList = [
    "Я всегда вежлив и почтителен.", "Я не доверяю незнакомцам и ожидаю худшего.",
    "Я люблю хорошие шутки, даже в бою.", "Я готов на всё, чтобы защитить друзей.", "Я часто теряюсь в мечтах."
];
const randomIdealsList = [
    "Свобода. Никто не должен указывать мне, как жить.", "Справедливость. Закон должен быть один для всех.",
    "Жадность. Меня волнуют только деньги и власть.", "Знания. Мир хранит тайны, которые я разгадаю.", "Благородство. Мой долг — защищать слабых."
];
const randomBondsList = [
    "Моя семья для меня важнее всего на свете.", "Я должен отомстить за гибель моего наставника.",
    "Я ищу древний артефакт моего народа.", "Я готов умереть за своего сюзерена.", "Мой клинок принадлежит только моим товарищам."
];
const randomFlawsList = [
    "Я не могу устоять перед золотом.", "Я сначала действую, а потом думаю.",
    "Я панически боюсь замкнутых пространств.", "Я никогда не признаю своих ошибок.", "Я слишком доверяю красивым людям."
];

function getRandom(arr, count = 1) {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, count).join(", ");
}

const backgroundData = {
    "Солдат": {
        equip: "Знак отличия, трофей убитого врага, набор костей, обычная одежда.",
        money: { cp: "", sp: "", ep: "", gp: "10", pp: "" },
        profs: () => "Транспорт (сухопутный), " + getRandom(randomTools, 1),
        feature: "Военное звание: Солдаты, лояльные вашей прежней организации, признают ваш авторитет."
    },
    "Учёный": {
        equip: "Бутылочка чернил, перо, небольшой нож, письмо от коллеги, обычная одежда.",
        money: { cp: "", sp: "", ep: "", gp: "10", pp: "" },
        profs: () => getRandom(randomLanguages, 2),
        feature: "Исследователь: Вы часто знаете, где и у кого можно получить нужную информацию."
    },
    "Благородный": {
        equip: "Комплект отличной одежды, кольцо-печатка, свиток родословной.",
        money: { cp: "", sp: "", ep: "", gp: "25", pp: "" },
        profs: () => getRandom(randomLanguages, 1) + ", " + getRandom(randomTools, 1),
        feature: "Привилегированное положение: Благодаря вашему происхождению вас принимают в высшем обществе."
    },
    "Отшельник": {
        equip: "Футляр для свитков, теплое одеяло, обычная одежда, набор травника.",
        money: { cp: "", sp: "", ep: "", gp: "5", pp: "" },
        profs: () => "Набор травника, " + getRandom(randomLanguages, 1),
        feature: "Открытие: Тихое уединение позволило вам узнать великую тайну вселенной."
    }
};

window.onload = () => {
    const saved = localStorage.getItem("dnd_char");
    if (saved) document.getElementById("loadGameBtn").classList.remove("hidden");
};

// --- НАВИГАЦИЯ И ОКНА ---
function nextScreen(id) {
    document.querySelector('.screen.active').classList.remove('active');
    document.getElementById(id).classList.add('active');
    if(id === 'screen-sheet') document.getElementById('dice-roller').classList.remove('hidden');
    else document.getElementById('dice-roller').classList.add('hidden');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function closeOnBackdrop(event, id) { if (event.target.id === id) closeModal(id); }

function loadGame() {
    const saved = JSON.parse(localStorage.getItem("dnd_char"));
    character = { ...character, ...saved };
    renderSheet();
    nextScreen('screen-sheet');
}

// --- СОЗДАНИЕ ПЕРСОНАЖА ---
function setName() {
    const input = document.getElementById("characterName").value.trim();
    if (!input) return alert("Пожалуйста, введите имя!");
    character.name = input; nextScreen('screen-race');
}

function setRace(race) { character.race = race; nextScreen('screen-class'); }
function setClass(cls) { character.class = cls; generateStats(); nextScreen('screen-stats'); }

function rollStat() {
    let rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b); return rolls[1] + rolls[2] + rolls[3];
}

function generateStats() {
    character.stats = { strength: rollStat(), dexterity: rollStat(), constitution: rollStat(), intelligence: rollStat(), wisdom: rollStat(), charisma: rollStat() };
    
    // Расовые бонусы характеристик
    if (character.race === "Человек") {
        for (let key in character.stats) character.stats[key] += 1;
    } else if (character.race === "Эльф") {
        character.stats.dexterity += 2;
    } else if (character.race === "Гном") {
        character.stats.intelligence += 2;
    }

    const labels = { strength: "Сила", dexterity: "Ловкость", constitution: "Телосложение", intelligence: "Интеллект", wisdom: "Мудрость", charisma: "Харизма" };
    const grid = document.getElementById("stats-grid");
    grid.innerHTML = Object.entries(character.stats).map(([k, v]) => `<div class="stat-row"><span>${labels[k]}</span><strong class="accent">${v}</strong></div>`).join("");
}

function setBackground(bg) {
    character.background = bg;
    character.savesProf = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
    character.skillsProf = { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false };
    
    // 1. Формируем особенности расы
    let raceFeatures = "";
    character.speed = "30"; // Сброс по умолчанию
    
    if (character.race === "Человек") {
        raceFeatures = "[Раса: Человек]\n- Универсальность: вы легко адаптируетесь к любой ситуации.\n- Базовая скорость 30 футов.";
    } else if (character.race === "Эльф") {
        raceFeatures = "[Раса: Эльф]\n- Тёмное зрение (60 фт.)\n- Наследие фей: преимущество против очарования и иммунитет к магии сна.\n- Транс: глубокая медитация 4 часа вместо сна.";
        character.skillsProf.prc = true; // Острые чувства
    } else if (character.race === "Гном") {
        raceFeatures = "[Раса: Гном]\n- Тёмное зрение (60 фт.)\n- Гномья хитрость: преимущество на спасброски Интеллекта, Мудрости и Харизмы против магии.\n- Базовая скорость 25 футов.";
        character.speed = "25"; // Скорость гнома ниже
    }

    // 2. Формируем особенности и экипировку класса
    let classEquip = "";
    let classFeatures = "";

    if (character.class === "Воин") {
        character.maxHp = 12; character.hp = 12; character.ac = 16;
        character.savesProf.str = true; character.savesProf.con = true;
        character.skillsProf.ath = true; character.skillsProf.inti = true;
        classFeatures = "[Класс: Воин 1-го уровня]\n- Боевой стиль\n- Второе дыхание (восстановление 1d10 + ур. ПЗ)";
        classEquip = "Длинный меч, Щит, Кольчужная рубаха";
        character.attacks = "Длинный меч | +5 | 1d8+3 рубящий";
    } else if (character.class === "Маг") {
        character.maxHp = 8; character.hp = 8; character.ac = 10;
        character.savesProf.int = true; character.savesProf.wis = true;
        character.skillsProf.arc = true; character.skillsProf.his = true;
        classFeatures = "[Класс: Маг 1-го уровня]\n- Использование заклинаний\n- Тайное восстановление\n\nИзвестные заклинания:\n- Огненный снаряд (Фокус)\n- Фокус на выбор";
        classEquip = "Посох, Книга заклинаний";
        character.attacks = "Огненный снаряд | +5 | 1d10 огонь";
    } else if (character.class === "Жрец") {
        character.maxHp = 10; character.hp = 10; character.ac = 15; // Кольчужная рубаха(13) + щит(2)
        character.savesProf.wis = true; character.savesProf.cha = true;
        character.skillsProf.rel = true; character.skillsProf.med = true;
        classFeatures = "[Класс: Жрец 1-го уровня]\n- Использование заклинаний\n- Божественный домен (например: Домен Жизни)\n\nИзвестные заклинания:\n- Священное пламя (Фокус)\n- Чудотворство (Фокус)\n- Лечение ран\n- Направляющий снаряд";
        classEquip = "Булава, Кольчужная рубаха, Щит, Священный символ";
        character.attacks = "Булава | +4 | 1d6+2 дробящий\nСвященное пламя | Спас Лов | 1d8 излучение";
    }

    const bgObj = backgroundData[bg];
    
    character.money = bgObj.money;
    character.equipment = `${classEquip}\n\n[Инвентарь предыстории]\n${bgObj.equip}`;
    character.proficiencies = bgObj.profs();
    
    // Склеиваем Расу, Класс и Предысторию
    character.features = `${raceFeatures}\n\n${classFeatures}\n\n[Предыстория: ${bg}]\n${bgObj.feature}`;
    
    // Заполняем случайные черты характера
    character.traits = getRandom(randomTraitsList);
    character.ideals = getRandom(randomIdealsList);
    character.bonds = getRandom(randomBondsList);
    character.flaws = getRandom(randomFlawsList);

    saveGame(); renderSheet(); nextScreen('screen-sheet');
}

// --- ЛОГИКА ИНТЕРАКТИВНОГО ЛИСТА И ПРОКАЧКИ УРОВНЕЙ ---
function addXP(amount) {
    character.xp = (character.xp || 0) + amount;
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp(); saveGame();
}

function checkLevelUp() {
    let leveledUp = false;
    let oldLevel = character.level;
    
    if (character.xp >= 300 && character.level < 3) character.level = 3;
    else if (character.xp >= 100 && character.level < 2) character.level = 2;

    let newAbilities = []; // Сюда собираем названия новых фишек

    if (character.level > oldLevel) {
        leveledUp = true;
        
        for (let lvl = oldLevel + 1; lvl <= character.level; lvl++) {
            if (character.class === "Воин") { 
                character.maxHp += 6; 
                if (lvl === 2) newAbilities.push("Всплеск действий (Action Surge)");
                if (lvl === 3) newAbilities.push("Воинский архетип (например: Чемпион)");
            } 
            else if (character.class === "Маг") { 
                character.maxHp += 4; 
                if (lvl === 2) newAbilities.push("Магическая традиция (например: Школа Эвокации)");
                if (lvl === 3) newAbilities.push("Заклинания 2-го круга");
            }
            else if (character.class === "Жрец") { 
                character.maxHp += 5; // У жреца кубик здоровья d8 (среднее 5)
                if (lvl === 2) newAbilities.push("Божественный канал (Channel Divinity) - особенность домена");
                if (lvl === 3) newAbilities.push("Заклинания 2-го круга (например: Духовное оружие)");
            }
        }
        
        character.hp = character.maxHp;

        // Дописываем новые способности в конец списка Особенностей
        if (newAbilities.length > 0) {
            let abilitiesText = `\n\n[Получено на ${character.level} уровне]\n- ` + newAbilities.join("\n- ");
            character.features += abilitiesText;
        }
    }

    if (leveledUp) {
        alert(`Уровень повышен!\nВаш уровень теперь: ${character.level}\n\nВы получили:\n- Увеличение максимума ПЗ (теперь: ${character.maxHp})\n- ${newAbilities.join('\n- ')}\n\n(Новые способности добавлены во вкладку "Умения и Особенности")`);
        renderSheet();
    }
}

function calculateModifierRaw(score) { return Math.floor((score - 10) / 2); }

function updateCalculations() {
    let pb = Math.floor((character.level - 1) / 4) + 2;
    document.getElementById('sheet-prof').value = "+" + pb;

    let dexMod = calculateModifierRaw(character.stats['dexterity'] || 10);
    character.initiative = dexMod > 0 ? `+${dexMod}` : `${dexMod}`;
    document.getElementById('sheet-init').value = character.initiative;

    for (let sv in saveToStat) {
        let statName = saveToStat[sv];
        let score = character.stats[statName] || 10;
        let mod = calculateModifierRaw(score);
        let isProf = character.savesProf && character.savesProf[sv];
        let total = mod + (isProf ? pb : 0);
        document.getElementById(`sv-${sv}-val`).value = (total > 0 ? '+' : '') + total;
        document.getElementById(`sv-${sv}`).checked = isProf;
    }

    for (let sk in skillToStat) {
        let statName = skillToStat[sk];
        let score = character.stats[statName] || 10;
        let mod = calculateModifierRaw(score);
        let isProf = character.skillsProf && character.skillsProf[sk];
        let total = mod + (isProf ? pb : 0);
        document.getElementById(`sk-${sk}-val`).value = (total > 0 ? '+' : '') + total;
        document.getElementById(`sk-${sk}`).checked = isProf;
    }

    let wisMod = calculateModifierRaw(character.stats['wisdom'] || 10);
    let prcProf = (character.skillsProf && character.skillsProf['prc']) ? pb : 0;
    let passive = 10 + wisMod + prcProf;
    document.getElementById('sheet-pass-perc').value = passive;
}

function renderSheet() {
    document.getElementById("sheet-name").value = character.name || "";
    document.getElementById("sheet-class").value = `${character.class || ""} ${character.level || 1}`;
    document.getElementById("sheet-bg").value = character.background || "";
    document.getElementById("sheet-race").value = character.race || "";
    document.getElementById("sheet-xp").value = character.xp || 0;
    
    document.getElementById("sheet-hp").value = character.hp || 0;
    document.getElementById("sheet-maxhp").value = character.maxHp || 0;
    document.getElementById("sheet-ac").value = character.ac || "";
    document.getElementById("sheet-speed").value = character.speed || "30";
    document.getElementById("sheet-insp").value = character.inspiration || "";

    const statsList = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const fullNames = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom', cha: 'charisma' };
    
    statsList.forEach(st => {
        const score = character.stats[fullNames[st]] || 10;
        document.getElementById(`sheet-${st}`).value = score;
        let mod = calculateModifierRaw(score);
        document.getElementById(`sheet-${st}-mod`).value = mod > 0 ? `+${mod}` : mod;
    });

    ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(coin => document.getElementById(`coin-${coin}`).value = character.money?.[coin] || "");

    const textFields = ['equipment', 'attacks', 'features', 'traits', 'ideals', 'bonds', 'flaws', 'proficiencies'];
    textFields.forEach(field => {
        const el = document.getElementById(`sheet-${field}`);
        if(el) el.value = character[field] || "";
    });

    updateCalculations();
}

function updateChar(key, value) {
    if (key === 'class') character.class = value.replace(/\d+/g, '').trim(); 
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
    saveGame();
    updateCalculations();
}

function updateStat(statName, value) {
    const numValue = Number(value);
    character.stats[statName] = numValue;
    
    const idMap = { 'strength': 'str', 'dexterity': 'dex', 'constitution': 'con', 'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha' };
    let mod = calculateModifierRaw(numValue);
    document.getElementById(`sheet-${idMap[statName]}-mod`).value = mod > 0 ? `+${mod}` : mod;
    
    saveGame();
    updateCalculations(); 
}

// --- БРОСОК КУБИКА ---
function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const resultDiv = document.getElementById("dice-result");
    resultDiv.textContent = result;
    resultDiv.style.transform = "scale(1.3)"; resultDiv.style.color = "var(--gold)";
    setTimeout(() => { resultDiv.style.transform = "scale(1)"; resultDiv.style.color = "white"; }, 200);
}

// --- СОХРАНЕНИЕ / ИМПОРТ / ЭКСПОРТ ---
function saveGame() { localStorage.setItem("dnd_char", JSON.stringify(character)); }

function exportTXT() {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${character.name || "Герой"}_DnD.txt`; a.click(); URL.revokeObjectURL(url);
}

function importTXT(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && importedData.stats) {
                character = { ...character, ...importedData };
                saveGame(); renderSheet(); nextScreen('screen-sheet');
            } else alert("Неверный формат данных!");
        } catch (err) { alert("Ошибка чтения файла!"); }
    };
    reader.readAsText(file);
    event.target.value = ""; 
}