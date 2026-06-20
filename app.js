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

const randomLanguages = ["Эльфийский", "Дварфийский", "Орочий", "Драконий", "Гоблинский", "Великаний", "Гномий", "Небесный"];
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
        feature: "Военное звание: Солдаты, лояльные вашей организации, признают ваш авторитет."
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
    if (saved) {
        document.getElementById("loadGameBtn").classList.remove("hidden");
        // Показываем кнопку очистки, если есть сохранение
        let clearBtn = document.getElementById("clearSaveBtn");
        if(clearBtn) clearBtn.classList.remove("hidden");
    }
};

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
    renderSheet();
    nextScreen('screen-sheet');
}

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
    
    let raceFeatures = "";
    let raceLangs = "";
    character.speed = "30"; 
    
    if (character.race === "Человек") {
        raceFeatures = "[Раса: Человек]\n- Универсальность: вы легко адаптируетесь к любой ситуации.\n- Базовая скорость 30 футов.";
        raceLangs = "Общий язык и еще один на выбор.";
    } else if (character.race === "Эльф") {
        raceFeatures = "[Раса: Эльф]\n- Тёмное зрение (60 фт.)\n- Острые чувства: вы владеете навыком Внимание.\n- Наследие фей: преимущество на спасброски от очарования, магия не может вас усыпить.\n- Транс: медитация 4 часа заменяет 8 часов сна.";
        character.skillsProf.prc = true;
        raceLangs = "Общий и Эльфийский языки.";
    } else if (character.race === "Гном") {
        raceFeatures = "[Раса: Гном]\n- Тёмное зрение (60 фт.)\n- Гномья хитрость: преимущество на спасброски Интеллекта, Мудрости и Харизмы против любой магии.\n- Базовая скорость 25 футов.";
        character.speed = "25";
        raceLangs = "Общий и Гномий языки.";
    }

    let classEquip = "";
    let classFeatures = "";
    let classProfs = "";

    character.hp = 0; 
    character.maxHp = 0; 

    if (character.class === "Воин") {
        character.savesProf.str = true; character.savesProf.con = true;
        character.skillsProf.ath = true; character.skillsProf.inti = true;
        classProfs = "[Броня и Оружие]\nВсе доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Класс: Воин 1-го уровня]\n- Боевой стиль (Дуэлянт: +2 к урону одноручным оружием)\n- Второе дыхание (бонусным действием восстанавливает 1d10 + ур. ПЗ)";
        classEquip = "Длинный меч, Щит, Кольчужная рубаха";
        character.attacks = "Длинный меч | +0 | 1d8+0 рубящий"; 
    } else if (character.class === "Волшебник") {
        character.savesProf.int = true; character.savesProf.wis = true;
        character.skillsProf.arc = true; character.skillsProf.his = true;
        classProfs = "[Броня и Оружие]\nКинжалы, дротики, пращи, боевые посохи, легкие арбалеты.";
        classFeatures = "[Класс: Волшебник 1-го уровня]\n- Тайное восстановление (восст. ячейки на коротком отдыхе)\n\n[Магия Волшебника]\nЯчейки: 2 (1 круг)\n- Фокусы: Огненный снаряд, Волшебная рука, Свет\n- 1 круг: Волшебная стрела, Магический доспех, Щит, Усыпление";
        classEquip = "Посох, Книга заклинаний";
        character.attacks = "Огненный снаряд | +0 | 1d10 огонь\nВолшебная стрела | Авто | 3шт x 1d4+1 силовое";
    } else if (character.class === "Жрец") {
        character.savesProf.wis = true; character.savesProf.cha = true;
        character.skillsProf.rel = true; character.skillsProf.med = true;
        classProfs = "[Броня и Оружие]\nЛегкие и средние доспехи (Домен Жизни: Тяжелые доспехи), щиты, простое оружие.";
        classFeatures = "[Класс: Жрец 1-го уровня]\n- Домен Жизни: Ученик жизни (ваши заклинания лечения восстанавливают дополнительно 2 + круг заклинания ПЗ)\n\n[Магия Жреца]\nЯчейки: 2 (1 круг)\n- Фокусы: Священное пламя, Чудотворство, Указание\n- 1 круг: Лечение ран, Направляющий снаряд, Щит веры, Благословение";
        classEquip = "Булава, Кольчужная рубаха, Щит, Священный символ";
        character.attacks = "Булава | +0 | 1d6+0 дробящий\nСвященное пламя | Спас Лов | 1d8 излучение";
    } else if (character.class === "Бард") {
        character.savesProf.dex = true; character.savesProf.cha = true;
        character.skillsProf.acr = true; character.skillsProf.per = true; character.skillsProf.prf = true;
        classProfs = "[Броня и Оружие]\nЛегкие доспехи, простое оружие, ручные арбалеты, длинные мечи, рапиры, короткие мечи. Три музыкальных инструмента.";
        classFeatures = "[Класс: Бард 1-го уровня]\n- Вдохновение барда (d6)\n\n[Магия Барда]\nЯчейки: 2 (1 круг)\n- Фокусы: Злая насмешка, Малая иллюзия\n- 1 круг: Лечение ран, Шёпот незримого, Очарование личности, Героизм";
        classEquip = "Рапира, Кожаная броня, Лютня, Набор путешественника";
        character.attacks = "Рапира | +0 | 1d8+0 колющий\nЗлая насмешка | Спас Муд | 1d4 психический";
    }

    const bgObj = backgroundData[bg];
    character.money = bgObj.money;
    character.equipment = `${classEquip}\n\n[Инвентарь предыстории]\n${bgObj.equip}`;
    character.proficiencies = `${classProfs}\n\n[Языки расы]\n${raceLangs}\n\n[От предыстории (${bg})]\n${bgObj.profs()}`;
    character.features = `${raceFeatures}\n\n${classFeatures}\n\n[Предыстория: ${bg}]\n${bgObj.feature}`;
    
    character.traits = getRandom(randomTraitsList);
    character.ideals = getRandom(randomIdealsList);
    character.bonds = getRandom(randomBondsList);
    character.flaws = getRandom(randomFlawsList);

    updateCalculations();
    character.hp = character.maxHp; 
    
    // Активация кнопок меню при успешном создании сохранения
    let loadBtn = document.getElementById("loadGameBtn");
    let clearBtn = document.getElementById("clearSaveBtn");
    if(loadBtn) loadBtn.classList.remove("hidden");
    if(clearBtn) clearBtn.classList.remove("hidden");

    saveGame(); renderSheet(); nextScreen('screen-sheet');
}

function addXP(amount) {
    character.xp = (character.xp || 0) + amount;
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp(); updateCalculations(); saveGame(); renderSheet();
}

function checkLevelUp() {
    let leveledUp = false;
    let oldLevel = character.level;
    
    if (character.xp >= 900 && character.level < 3) character.level = 3;
    else if (character.xp >= 300 && character.level < 2) character.level = 2;

    let newAbilities = [];

    if (character.level > oldLevel) {
        leveledUp = true;
        for (let lvl = oldLevel + 1; lvl <= character.level; lvl++) {
            if (character.class === "Воин") { 
                if (lvl === 2) newAbilities.push("Всплеск действий (Action Surge) - 1 доп. действие");
                if (lvl === 3) newAbilities.push("Архетип Чемпион: Улучшенный критический удар (Крит на 19-20)");
            } else if (character.class === "Волшебник") { 
                if (lvl === 2) {
                    newAbilities.push("Традиция Эвокации: Лепка заклинаний");
                    newAbilities.push("Магия: 3 ячейки (1 круг)");
                }
                if (lvl === 3) {
                    newAbilities.push("Магия: 4 ячейки (1 кр.), 2 ячейки (2 кр.)");
                    newAbilities.push("Добавлено: Пылающая сфера (2 круг)");
                    if (!character.attacks.includes("Пылающая сфера")) {
                        character.attacks += "\nПылающая сфера | Спас Лов | 2d6 огонь";
                    }
                }
            } else if (character.class === "Жрец") { 
                if (lvl === 2) {
                    newAbilities.push("Божественный канал: Сохранение жизни (массовое лечение)");
                    newAbilities.push("Магия: 3 ячейки (1 круг)");
                }
                if (lvl === 3) {
                    newAbilities.push("Магия: 4 ячейки (1 кр.), 2 ячейки (2 кр.)");
                    newAbilities.push("Добавлено: Духовное оружие (2 круг)");
                    if (!character.attacks.includes("Духовное оружие")) {
                        character.attacks += "\nДуховное оружие | +0 | 1d8+0 силовое (бон. действие)";
                    }
                }
            } else if (character.class === "Бард") {
                if (lvl === 2) {
                    newAbilities.push("Мастер на все руки (добавьте пол. бонуса мастерства ко всем проверкам)");
                    newAbilities.push("Песнь отдыха (d6)");
                    newAbilities.push("Магия: 3 ячейки (1 круг)");
                }
                if (lvl === 3) {
                    newAbilities.push("Коллегия Знаний");
                    newAbilities.push("Магия: 4 ячейки (1 кр.), 2 ячейки (2 кр.)");
                    newAbilities.push("Добавлено: Невидимость (2 круг)");
                }
            }
        }
        
        if (newAbilities.length > 0) {
            let abilitiesText = `\n\n[Получено на ${character.level} уровне]\n- ` + newAbilities.join("\n- ");
            character.features += abilitiesText;
        }
    }

    if (leveledUp) {
        updateCalculations();
        character.hp = character.maxHp;
        alert(`Уровень повышен!\nВаш уровень теперь: ${character.level}\n\nВы получили:\n- Увеличение максимума ПЗ (теперь: ${character.maxHp})\n- ${newAbilities.join('\n- ')}\n\n(Новые способности добавлены во вкладки)`);
    }
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

function calculateModifierRaw(score) { return Math.floor((score - 10) / 2); }

function updateCalculations() {
    let pb = Math.floor((character.level - 1) / 4) + 2;
    document.getElementById('sheet-prof').value = "+" + pb;

    let conMod = calculateModifierRaw(character.stats['constitution'] || 10);
    let hpBase = 0, hpPerLevel = 0;
    
    if (character.class === "Воин") { hpBase = 10; hpPerLevel = 6; }
    else if (character.class === "Жрец" || character.class === "Бард") { hpBase = 8; hpPerLevel = 5; }
    else if (character.class === "Волшебник") { hpBase = 6; hpPerLevel = 4; }

    if (hpBase > 0) {
        let newMaxHp = (hpBase + conMod) + (character.level - 1) * (hpPerLevel + conMod);
        let hpChanged = (character.maxHp !== newMaxHp);
        let diff = newMaxHp - character.maxHp;
        
        character.maxHp = newMaxHp;
        let hpInput = document.getElementById('sheet-maxhp');
        if(hpInput) hpInput.value = character.maxHp;
        
        if (character.hp === 0) {
            character.hp = character.maxHp;
        } else if (hpChanged && diff > 0 && character.level > 1) {
            character.hp += diff;
        }
        
        if (character.hp > character.maxHp) character.hp = character.maxHp;
        if(document.getElementById('sheet-hp')) document.getElementById('sheet-hp').value = character.hp;
    }

    let dexMod = calculateModifierRaw(character.stats['dexterity'] || 10);
    if (character.class === "Волшебник") {
        character.ac = 10 + dexMod;
    } else if (character.class === "Бард") {
        character.ac = 11 + dexMod; 
    } else if (character.class === "Жрец") {
        character.ac = 15 + Math.min(2, dexMod); 
    } else if (character.class === "Воин") {
        character.ac = 16; 
    }
    document.getElementById('sheet-ac').value = character.ac;

    character.initiative = dexMod > 0 ? `+${dexMod}` : `${dexMod}`;
    document.getElementById('sheet-init').value = character.initiative;

    if (character.attacks) {
        let strMod = calculateModifierRaw(character.stats['strength'] || 10);
        let intMod = calculateModifierRaw(character.stats['intelligence'] || 10);
        let wisMod = calculateModifierRaw(character.stats['wisdom'] || 10);
        let chaMod = calculateModifierRaw(character.stats['charisma'] || 10);
        let finMod = Math.max(strMod, dexMod); 
        
        let text = character.attacks;
        
        if (character.class === "Воин") {
            let hitStr = (strMod + pb > 0 ? "+" : "") + (strMod + pb);
            let dmgDueling = (strMod + 2 > 0 ? "+" + (strMod + 2) : (strMod + 2 < 0 ? (strMod + 2) : ""));
            text = text.replace(/Длинный меч \| [+\-0-9]+ \| 1d8[+\-0-9]* рубящий/, `Длинный меч | ${hitStr} | 1d8${dmgDueling} рубящий`);
        } else if (character.class === "Волшебник") {
            let hitInt = (intMod + pb > 0 ? "+" : "") + (intMod + pb);
            let dcInt = 8 + pb + intMod;
            text = text.replace(/Огненный снаряд \| [+\-0-9]+ \| 1d10 огонь/, `Огненный снаряд | ${hitInt} | 1d10 огонь`);
            text = text.replace(/Пылающая сфера \| Спас Лов( СЛ \d+)? \| 2d6 огонь/, `Пылающая сфера | Спас Лов СЛ ${dcInt} | 2d6 огонь`);
        } else if (character.class === "Жрец") {
            let hitStr = (strMod + pb > 0 ? "+" : "") + (strMod + pb);
            let dmgStr = (strMod > 0 ? "+" + strMod : (strMod < 0 ? strMod : ""));
            let dcWis = 8 + pb + wisMod;
            let hitWis = (wisMod + pb > 0 ? "+" : "") + (wisMod + pb);
            let dmgWis = (wisMod > 0 ? "+" + wisMod : (wisMod < 0 ? wisMod : ""));
            
            text = text.replace(/Булава \| [+\-0-9]+ \| 1d6[+\-0-9]* дробящий/, `Булава | ${hitStr} | 1d6${dmgStr} дробящий`);
            text = text.replace(/Священное пламя \| Спас Лов( СЛ \d+ )?\| 1d8 излучение/, `Священное пламя | Спас Лов СЛ ${dcWis} | 1d8 излучение`);
            text = text.replace(/Духовное оружие \| [+\-0-9]+ \| 1d8[+\-0-9]* силовое( \(бон\. действие\))?/, `Духовное оружие | ${hitWis} | 1d8${dmgWis} силовое (бон. действие)`);
        } else if (character.class === "Бард") {
            let hitFin = (finMod + pb > 0 ? "+" : "") + (finMod + pb);
            let dmgFin = (finMod > 0 ? "+" + finMod : (finMod < 0 ? finMod : ""));
            let dcCha = 8 + pb + chaMod;
            text = text.replace(/Рапира \| [+\-0-9]+ \| 1d8[+\-0-9]* колющий/, `Рапира | ${hitFin} | 1d8${dmgFin} колющий`);
            text = text.replace(/Злая насмешка \| Спас Муд( СЛ \d+ )?\| 1d4 психический/, `Злая насмешка | Спас Муд СЛ ${dcCha} | 1d4 психический`);
        }
        
        if (text !== character.attacks) {
            character.attacks = text;
            let atkInput = document.getElementById('sheet-attacks');
            if(atkInput) atkInput.value = text;
        }
    }

    for (let sv in saveToStat) {
        let statName = saveToStat[sv];
        let score = character.stats[statName] || 10;
        let mod = calculateModifierRaw(score);
        let isProf = character.savesProf && character.savesProf[sv];
        let total = mod + (isProf ? pb : 0);
        let elVal = document.getElementById(`sv-${sv}-val`);
        let elChk = document.getElementById(`sv-${sv}`);
        if(elVal) elVal.value = (total > 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
    }

    for (let sk in skillToStat) {
        let statName = skillToStat[sk];
        let score = character.stats[statName] || 10;
        let mod = calculateModifierRaw(score);
        let isProf = character.skillsProf && character.skillsProf[sk];
        let total = mod + (isProf ? pb : 0);
        let elVal = document.getElementById(`sk-${sk}-val`);
        let elChk = document.getElementById(`sk-${sk}`);
        if(elVal) elVal.value = (total > 0 ? '+' : '') + total;
        if(elChk) elChk.checked = isProf;
    }

    let wisModCalc = calculateModifierRaw(character.stats['wisdom'] || 10);
    let prcProf = (character.skillsProf && character.skillsProf['prc']) ? pb : 0;
    let passive = 10 + wisModCalc + prcProf;
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

    ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(coin => {
        let el = document.getElementById(`coin-${coin}`);
        if(el) el.value = character.money?.[coin] || "";
    });

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
    saveGame(); updateCalculations();
}

function updateStat(statName, value) {
    const numValue = Number(value);
    character.stats[statName] = numValue;
    
    const idMap = { 'strength': 'str', 'dexterity': 'dex', 'constitution': 'con', 'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha' };
    let mod = calculateModifierRaw(numValue);
    document.getElementById(`sheet-${idMap[statName]}-mod`).value = mod > 0 ? `+${mod}` : mod;
    
    saveGame(); updateCalculations(); 
}

function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const resultDiv = document.getElementById("dice-result");
    resultDiv.textContent = result;
    resultDiv.style.transform = "scale(1.3)"; resultDiv.style.color = "var(--gold)";
    setTimeout(() => { resultDiv.style.transform = "scale(1)"; resultDiv.style.color = "white"; }, 200);
}

function saveGame() { localStorage.setItem("dnd_char", JSON.stringify(character)); }

// МЯГКАЯ ОЧИСТКА СОХРАНЕНИЙ
function resetGame() {
    if(confirm("Вы уверены, что хотите удалить текущего персонажа? Убедитесь, что сделали экспорт (TXT)!")) {
        localStorage.removeItem("dnd_char");
        
        let loadBtn = document.getElementById("loadGameBtn");
        let clearBtn = document.getElementById("clearSaveBtn");
        if(loadBtn) loadBtn.classList.add("hidden");
        if(clearBtn) clearBtn.classList.add("hidden");
        
        character = {
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
        
        alert("Персонаж успешно удален.");
    }
}

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
                
                let loadBtn = document.getElementById("loadGameBtn");
                let clearBtn = document.getElementById("clearSaveBtn");
                if(loadBtn) loadBtn.classList.remove("hidden");
                if(clearBtn) clearBtn.classList.remove("hidden");

                saveGame(); renderSheet(); nextScreen('screen-sheet');
            } else alert("Неверный формат данных!");
        } catch (err) { alert("Ошибка чтения файла!"); }
    };
    reader.readAsText(file);
    event.target.value = ""; 
}