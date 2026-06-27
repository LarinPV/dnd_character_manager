let character = {
    name: "", race: "", subrace: "", class: "", subclass: "", background: "",
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

// Данные подрас
const subraceData = {
    "Дварф": [
        {name: "Горный дварф", desc: "+2 Сила. Владение легкой/средней броней."},
        {name: "Холмовой дварф", desc: "+1 Мудрость. +1 Макс ПЗ за каждый уровень."}
    ],
    "Эльф": [
        {name: "Высший эльф", desc: "+1 Интеллект. Доп. заговор и язык."},
        {name: "Лесной эльф", desc: "+1 Мудрость. Скорость 35 фт, скрытность в природе."},
        {name: "Тёмный эльф (Дроу)", desc: "+1 Харизма. Зрение 120 фт, магия дроу."}
    ],
    "Полурослик": [
        {name: "Легконогий", desc: "+1 Харизма. Естественная скрытность."},
        {name: "Коренастый", desc: "+1 Телосложение. Устойчивость к ядам."}
    ],
    "Гном": [
        {name: "Лесной гном", desc: "+1 Ловкость. Иллюзии, общение с мелкими зверями."},
        {name: "Скальный гном", desc: "+1 Телосложение. Создание механизмов."}
    ]
};

// Данные подклассов при повышении уровня
const subclassData = {
    "Варвар": { lvl: 3, opts: ["Путь Берсерка", "Путь Тотемного воина"] },
    "Бард": { lvl: 3, opts: ["Коллегия Знаний", "Коллегия Доблести"] },
    "Воин": { lvl: 3, opts: ["Чемпион", "Мастер боевых искусств", "Мистический рыцарь"] },
    "Волшебник": { lvl: 2, opts: ["Школа Эвокации", "Школа Ограждения", "Школа Иллюзии"] },
    "Друид": { lvl: 2, opts: ["Круг Земли", "Круг Луны"] },
    "Жрец": { lvl: 2, opts: ["Домен Жизни", "Домен Света", "Домен Бури"] },
    "Монах": { lvl: 3, opts: ["Путь Открытой Ладони", "Путь Тени"] },
    "Паладин": { lvl: 3, opts: ["Клятва Преданности", "Клятва Древних"] },
    "Следопыт": { lvl: 3, opts: ["Охотник", "Повелитель зверей"] },
    "Плут": { lvl: 3, opts: ["Вор", "Убийца", "Мистический ловкач"] },
    "Чародей": { lvl: 3, opts: ["Наследие Драконов", "Дикая Магия"] },
    "Колдун": { lvl: 3, opts: ["Договор Гримуара", "Договор Клинка", "Договор Цепи"] }
};

// Расшифровка особенностей конкретных архетипов для добавления их в текст листа
const archFeatures = {
    "Путь Берсерка": {3: "Бешенство (доп. атака бонусным действием)", 6: "Бездумная ярость (иммунитет к испугу/очарованию)", 10: "Устрашающее присутствие (пугает врагов действием)", 14: "Ответный удар (атака реакцией при получении урона)"},
    "Путь Тотемного воина": {3: "Дух тотема (сопротивление урону), Искатель духов (ритуалы природы)", 6: "Аспект зверя (пассивные бонусы вне боя)", 10: "Странствующий в духах (призыв природы)", 14: "Тотемное родство (сильные эффекты в бою)"},
    "Коллегия Знаний": {3: "Доп. навыки (3 любых навыка), Острые слова (дебафф врага костью барда)", 6: "Доп. тайны магии (2 любых заклинания)", 14: "Непревзойденный навык (бафф своих проверок)"},
    "Коллегия Доблести": {3: "Боевая магия (владение броней/оружием), Боевое вдохновение (бафф урона/КД)", 6: "Дополнительная атака (2 удара за действие)", 14: "Боевая магия (атака бонусным после заклинания)"},
    "Чемпион": {3: "Улучшенный крит (крит на 19-20)", 7: "Выдающийся атлет (бонус к прыжкам/проверкам)", 10: "Доп. боевой стиль (новая стойка)", 15: "Превосходный крит (крит на 18-20)", 18: "Уцелевший (регенерация ХП в бою)"},
    "Мастер боевых искусств": {3: "Превосходство в бою (боевые маневры и кости d8), Мастер ремесла (инструмент)", 7: "Оценка врага (узнать статы мастера)", 10: "Улучш. превосходство (кости становятся d10)", 15: "Неумолимый (возврат 1 кости при инициативе)", 18: "Улучш. превосходство (кости становятся d12)"},
    "Мистический рыцарь": {3: "Использование магии (заклинания 1 круга), Связь с оружием (нельзя выбить, призыв бонусным)", 7: "Магия войны (заговор + бонусная атака)", 10: "Мистический удар (атака дает помеху врагу на спасбросок)", 15: "Мистический рывок (телепорт при Всплеске действий)", 18: "Улучш. магия войны (заклинание + бонусная атака)"},
    "Школа Эвокации": {2: "Скульптор заклинаний (защита союзников от АоЕ)", 6: "Мощный заговор (гарантированный урон при промахе)", 10: "Усиленная эвокация (+Интеллект к урону заклинаний)", 14: "Перегрузка (максимальный урон, но с отдачей)"},
    "Школа Ограждения": {2: "Магический оберег (щит из ХП при касте ограждения)", 6: "Проекция оберега (передача щита союзнику реакцией)", 10: "Улучшенное ограждение (бонус к контрзаклинанию/снятию)", 14: "Сопротивление магии (преимущество на спасброски заклинаний)"},
    "Школа Иллюзии": {2: "Улучшенная малая иллюзия (звук + образ одновременно)", 6: "Податливые иллюзии (изменение иллюзии без перекаста)", 10: "Иллюзорная сущность (уворот реакцией 1/отдых)", 14: "Реальность иллюзии (материализация объекта)"},
    "Круг Земли": {2: "Доп. заговор (из списка друида), Естественное восстановление (восст. ячейки на коротком отдыхе)", 6: "Шаг сквозь заросли (игнор сложной местности)", 10: "Оберег природы (иммунитет к яду/очарованию)", 14: "Святилище природы (животные не могут атаковать)"},
    "Круг Луны": {2: "Боевой дикий облик (превращение бонусным), Облик круга (существа до CR 1)", 6: "Стихийный удар (маг. урон в звере), Облик круга (до CR 2)", 10: "Элементальный облик (превращение в элементалей), Облик круга (до CR 3)", 14: "Тысяча лиц (бесконечная смена внешности)"},
    "Домен Жизни": {2: "Сохранение жизни (АоЕ хил за счет Канала)", 6: "Благословенный целитель (самохил при лечении других)", 8: "Божественный удар (+1d8 излуч. урона к атаке)", 17: "Высшее исцеление (хил всегда кидает макс. кости)"},
    "Домен Света": {2: "Сияние рассвета (АоЕ урон за счет Канала)", 6: "Улучшенная вспышка (наложение помехи на атаку врага)", 8: "Мощный заговор (+Мудрость к урону заговоров)", 17: "Венец света (АоЕ дебафф врагам на спасброски)"},
    "Домен Бури": {2: "Гнев бури (макс. урон молнией за счет Канала)", 6: "Удар молнии (отталкивание врагов на 10 фт)", 8: "Божественный удар (+1d8 урона звуком/молнией)", 17: "Дитя бури (постоянный полет на улице)"},
    "Путь Открытой Ладони": {3: "Техника ладони (нокдаун/отталкивание при Шквале ударов)", 6: "Исцеление тела (самохил действием)", 11: "Умиротворение (авто-Убежище после отдыха)", 17: "Дрожащая ладонь (сокрушительный ваншот/урон за 3 Ци)"},
    "Путь Тени": {3: "Искусство тени (заклинания тьмы и иллюзий за Ци)", 6: "Шаг тени (телепорт в темноте на 60 фт)", 11: "Плащ теней (невидимость в темноте)", 17: "Удар тени (атака реакцией при телепорте врага)"},
    "Клятва Преданности": {3: "Святое оружие (+Харизма к атаке), Изгнание нечисти (отпугивание Канала)", 7: "Аура преданности (иммунитет к очарованию союзникам)", 15: "Чистота духа (постоянный эффект защиты от зла)", 20: "Нимб святости (АоЕ урон излучением, преим. на спасы)"},
    "Клятва Древних": {3: "Гнев природы (опутывание лозами), Изгнание неверных (отпугивание фей/извергов)", 7: "Аура оберега (сопротивление урону от заклинаний)", 15: "Бессмертный страж (выживание при 0 ХП 1/отдых)", 20: "Старейший чемпион (быстрый каст, регенерация 10 ХП)"},
    "Охотник": {3: "Добыча охотника (доп. урон или контратака)", 7: "Оборонительная тактика (защита от мультиатак или страха)", 11: "Многоцелевая атака (АоЕ удары по площади)", 15: "Превосходная защита (уворот или снижение урона)"},
    "Повелитель зверей": {3: "Верный спутник (боевой питомец)", 7: "Исключительная дрессировка (питомец бьет бонусным действием)", 11: "Звериная ярость (2 атаки питомца за ход)", 15: "Разделение заклинаний (бафф себя = бафф питомца)"},
    "Вор": {3: "Быстрые руки (предмет бонусным действием), Форточник (скорость лазанья)", 9: "Превосходная скрытность (преимущество на стелс)", 13: "Использование маг. устройств (игнорирование требований шмота)", 17: "Воровские рефлексы (2 полноценных хода в первом раунде)"},
    "Убийца": {3: "Бонус убийцы (набор ядов/грима), Мастерство проникновения (авто-крит при сюрпризе)", 9: "Искусность внедрения (создание фальшивых личностей)", 13: "Самозванец (безупречное копирование голоса/почерка)", 17: "Смертоносный удар (удвоение урона при засаде)"},
    "Мистический ловкач": {3: "Магия (заклинания иллюзий/очарования), Невидимая рука (Магическая рука ворует)", 9: "Магическая засада (помеха врагу на спасброски заклинаний)", 13: "Универсальный ловкач (отвлечение врага бонусной рукой)", 17: "Похищение магии (кража заклинаний у магов)"},
    "Наследие Драконов": {6: "Стихийное родство (+Харизма к урону своей стихии, сопр.)", 14: "Драконьи крылья (полет со скоростью ходьбы)", 18: "Драконий облик (аура страха за 5 очков чар)"}, 
    "Дикая Магия": {6: "Изгиб удачи (+/- 1d4 к любому броску за 2 очка чар)", 14: "Контролируемый хаос (выбор из 2 эффектов таблицы)", 18: "Бомбардировка заклинаниями (взрывной доп. урон костями)"},
    "Договор Гримуара": {3: "Гримуар теней (3 любых заговора из любого класса)"},
    "Договор Клинка": {3: "Договорное оружие (создание маг. оружия в руке)"},
    "Договор Цепи": {3: "Договор фамильяра (особый сильный питомец/бес)"}
};

const classStatPriority = {
    "Варвар": ["strength", "constitution"],
    "Воин": ["strength", "constitution"],
    "Волшебник": ["intelligence", "dexterity"],
    "Жрец": ["wisdom", "strength"],
    "Бард": ["charisma", "dexterity"],
    "Друид": ["wisdom", "constitution"],
    "Монах": ["dexterity", "wisdom"],
    "Паладин": ["strength", "charisma"],
    "Следопыт": ["dexterity", "wisdom"],
    "Плут": ["dexterity", "intelligence"],
    "Чародей": ["charisma", "constitution"],
    "Колдун": ["charisma", "dexterity"]
};

function getRandom(arr, count = 1) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, count).join(", "); }

const backgroundData = {
    "Артист": { equip: "Музыкальный инструмент, подарок от поклонника, сценический костюм.", money: { cp: "", sp: "", ep: "", gp: "15", pp: "" }, profs: () => "[Навыки: Акробатика, Выступление]\nНабор для грима, один музыкальный инструмент", feature: "Повсеместное признание: Вы всегда можете найти место для выступления и ночлега." },
    "Беспризорник": { equip: "Маленький нож, карта города, ручная мышь, жетон на память о родителях, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Ловкость рук, Скрытность]\nНабор для грима, инструменты вора", feature: "Городские тайны: В городах вы и ваша группа перемещаетесь в два раза быстрее." },
    "Благородный": { equip: "Комплект отличной одежды, кольцо-печатка, свиток родословной.", money: { cp: "", sp: "", ep: "", gp: "25", pp: "" }, profs: () => "[Навыки: История, Убеждение]\nОдин игровой набор, " + getRandom(randomLanguages, 1), feature: "Привилегированное положение: Благодаря происхождению вас принимают в высшем обществе." },
    "Моряк": { equip: "Короткая дубинка, шелковая веревка (50 фт.), талисман на удачу, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Атлетика, Восприятие]\nИнструменты навигатора, транспорт (водный)", feature: "Корабельный проезд: Вы можете договориться о бесплатном проезде на корабле." },
    "Народный герой": { equip: "Ремесленные инструменты, лопата, железный горшок, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Выживание, Уход за животными]\nОдни ремесленные инструменты, транспорт (сухопутный)", feature: "Деревенское гостеприимство: Простые люди всегда готовы помочь вам и укрыть вас." },
    "Отшельник": { equip: "Футляр для свитков, теплое одеяло, обычная одежда, набор травника.", money: { cp: "", sp: "", ep: "", gp: "5", pp: "" }, profs: () => "[Навыки: Медицина, Религия]\nНабор травника, " + getRandom(randomLanguages, 1), feature: "Открытие: Тихое уединение позволило вам узнать великую тайну вселенной." },
    "Преступник": { equip: "Ломик, комплект темной обычной одежды с капюшоном.", money: { cp: "", sp: "", ep: "", gp: "15", pp: "" }, profs: () => "[Навыки: Обман, Скрытность]\nОдин игровой набор, инструменты вора", feature: "Криминальные связи: Вы знаете, как связаться со своей криминальной сетью." },
    "Прислужник": { equip: "Священный символ, молитвенник, 5 палочек благовоний, облачение, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "15", pp: "" }, profs: () => "[Навыки: Проницательность, Религия]\n" + getRandom(randomLanguages, 2), feature: "Приют для верующих: Вас и ваших союзников поддержат в храме вашей веры." },
    "Ремесленный мастер": { equip: "Ремесленные инструменты, рекомендательное письмо от гильдии, дорожная одежда.", money: { cp: "", sp: "", ep: "", gp: "15", pp: "" }, profs: () => "[Навыки: Проницательность, Убеждение]\nОдни ремесленные инструменты, " + getRandom(randomLanguages, 1), feature: "Членство в гильдии: Ваша гильдия может предоставить еду, жилье и защиту." },
    "Солдат": { equip: "Знак отличия, трофей убитого врага, набор костей, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Атлетика, Запугивание]\nТранспорт (сухопутный), один игровой набор", feature: "Военное звание: Солдаты, лояльные вашей организации, признают ваш авторитет." },
    "Учёный": { equip: "Бутылочка чернил, перо, небольшой нож, письмо от коллеги, обычная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Магия, История]\n" + getRandom(randomLanguages, 2), feature: "Исследователь: Вы часто знаете, где и у кого можно получить нужную информацию." },
    "Чужеземец": { equip: "Посох, капкан, трофей убитого животного, дорожная одежда.", money: { cp: "", sp: "", ep: "", gp: "10", pp: "" }, profs: () => "[Навыки: Атлетика, Выживание]\nОдин музыкальный инструмент, " + getRandom(randomLanguages, 1), feature: "Странник: Вы отлично ориентируетесь и можете находить еду в диких местах." },
    "Шарлатан": { equip: "Комплект отличной одежды, набор для грима, инструменты мошенника.", money: { cp: "", sp: "", ep: "", gp: "15", pp: "" }, profs: () => "[Навыки: Обман, Ловкость рук]\nНабор для грима, набор для фальсификации", feature: "Поддельная личность: Вы создали вторую личность со всеми документами и связями." }
};

window.onload = () => {
    const saved = localStorage.getItem("dnd_char");
    if (saved) {
        document.getElementById("loadGameBtn").classList.remove("hidden");
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
    updateAllUI();
    nextScreen('screen-sheet');
}

function setName() {
    const input = document.getElementById("characterName").value.trim();
    if (!input) return alert("Пожалуйста, введите имя!");
    character.name = input; nextScreen('screen-race');
}

function setRace(race) { 
    character.race = race; 
    character.subrace = "";
    if (subraceData[race]) {
        let container = document.getElementById('subrace-cards');
        container.innerHTML = subraceData[race].map(sr => 
            `<div class="card" onclick="setSubrace('${sr.name}')">
                <h3>${sr.name}</h3><p style="font-size: 0.9rem;">${sr.desc}</p>
            </div>`
        ).join('');
        nextScreen('screen-subrace');
    } else {
        nextScreen('screen-class'); 
    }
}

function setSubrace(subrace) { character.subrace = subrace; nextScreen('screen-class'); }

function setClass(cls) { 
    character.class = cls; 
    character.subclass = "";
    generateStats(true); 
    nextScreen('screen-stats'); 
}

function rollStat() {
    let rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b); return rolls[1] + rolls[2] + rolls[3];
}

function generateStats(isStandard = true) {
    let values = isStandard ? [15, 14, 13, 12, 10, 8] : Array.from({length: 6}, rollStat).sort((a, b) => b - a);
    let prio = classStatPriority[character.class] || ["strength", "dexterity"];
    let rest = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].filter(s => !prio.includes(s));
    
    if (!isStandard) rest.sort(() => Math.random() - 0.5);

    let keys = [...prio, ...rest];
    character.stats = {};
    for (let i = 0; i < 6; i++) character.stats[keys[i]] = values[i];
    
    if (character.race === "Человек") {
        for (let key in character.stats) character.stats[key] += 1;
    } else if (character.race === "Эльф") character.stats.dexterity += 2;
    else if (character.race === "Дварф") character.stats.constitution += 2;
    else if (character.race === "Полурослик") character.stats.dexterity += 2;
    else if (character.race === "Драконорожденный") { character.stats.strength += 2; character.stats.charisma += 1; }
    else if (character.race === "Гном") character.stats.intelligence += 2;
    else if (character.race === "Полуэльф") { character.stats.charisma += 2; character.stats.dexterity += 1; character.stats.intelligence += 1; }
    else if (character.race === "Полуорк") { character.stats.strength += 2; character.stats.constitution += 1; }
    else if (character.race === "Тифлинг") { character.stats.charisma += 2; character.stats.intelligence += 1; }

    if (character.subrace === "Горный дварф") character.stats.strength += 2;
    else if (character.subrace === "Холмовой дварф") character.stats.wisdom += 1;
    else if (character.subrace === "Высший эльф") character.stats.intelligence += 1;
    else if (character.subrace === "Лесной эльф") character.stats.wisdom += 1;
    else if (character.subrace === "Тёмный эльф (Дроу)") character.stats.charisma += 1;
    else if (character.subrace === "Легконогий") character.stats.charisma += 1;
    else if (character.subrace === "Коренастый") character.stats.constitution += 1;
    else if (character.subrace === "Лесной гном") character.stats.dexterity += 1;
    else if (character.subrace === "Скальный гном") character.stats.constitution += 1;

    const labels = { strength: "Сила", dexterity: "Ловкость", constitution: "Телосложение", intelligence: "Интеллект", wisdom: "Мудрость", charisma: "Харизма" };
    const grid = document.getElementById("stats-grid");
    if(grid) grid.innerHTML = Object.entries(character.stats).map(([k, v]) => `<div class="stat-row"><span>${labels[k]}</span><strong class="accent">${v}</strong></div>`).join("");
}

function setBackground(bg) {
    character.background = bg;
    character.savesProf = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
    character.skillsProf = { acr: false, ath: false, prc: false, sur: false, ani: false, inti: false, prf: false, his: false, slg: false, arc: false, med: false, dec: false, nat: false, ins: false, inv: false, rel: false, ste: false, per: false };
    
    let raceFeatures = "", raceLangs = "";
    character.speed = "30"; 
    
    if (character.race === "Человек") {
        raceFeatures = "[Раса: Человек]\n- Универсальность: легко адаптируетесь.\n- Базовая скорость 30 фт.";
        raceLangs = "Общий язык и еще один на выбор.";
    } else if (character.race === "Эльф") {
        raceFeatures = "[Раса: Эльф]\n- Тёмное зрение (60 фт.)\n- Острые чувства: навык Восприятие.\n- Наследие фей: преимущество против очарования, иммунитет к сну.\n- Транс: 4 часа заменяют 8 часов сна.";
        character.skillsProf.prc = true; raceLangs = "Общий и Эльфийский.";
        if (character.subrace === "Высший эльф") { raceFeatures += "\n[Высший эльф] Доп. заговор волшебника, доп. язык."; raceLangs += " + 1 язык."; }
        else if (character.subrace === "Лесной эльф") { raceFeatures += "\n[Лесной эльф] Базовая скорость 35 фт. Маскировка в дикой природе."; character.speed = "35"; }
        else if (character.subrace === "Тёмный эльф (Дроу)") { raceFeatures += "\n[Дроу] Тёмное зрение 120 фт. Магия дроу. Чувствительность к солнцу."; }
    } else if (character.race === "Дварф") {
        raceFeatures = "[Раса: Дварф]\n- Тёмное зрение (60 фт.)\n- Дварфская устойчивость: преимущество против яда, сопротивление яду.\n- Владение топорами/молотами.\n- Знание камня (История).";
        character.speed = "25"; raceLangs = "Общий и Дварфский.";
        if (character.subrace === "Горный дварф") raceFeatures += "\n[Горный дварф] Владение легкими и средними доспехами.";
        else if (character.subrace === "Холмовой дварф") raceFeatures += "\n[Холмовой дварф] Дварфская выдержка (+1 макс ПЗ за уровень).";
    } else if (character.race === "Полурослик") {
        raceFeatures = "[Раса: Полурослик]\n- Везучий: переброс '1' на атаках/проверках.\n- Храбрый: преимущество против испуга.\n- Проворство: проход через крупных существ.";
        character.speed = "25"; raceLangs = "Общий и язык Полуросликов.";
        if (character.subrace === "Легконогий") raceFeatures += "\n[Легконогий] Естественная скрытность (можно прятаться за союзниками).";
        else if (character.subrace === "Коренастый") raceFeatures += "\n[Коренастый] Устойчивость к ядам (как у дварфов).";
    } else if (character.race === "Драконорожденный") {
        raceFeatures = "[Раса: Драконорожденный]\n- Наследие драконов.\n- Оружие дыхания (2d6).\n- Сопротивление стихии.";
        raceLangs = "Общий и Драконий.";
    } else if (character.race === "Гном") {
        raceFeatures = "[Раса: Гном]\n- Тёмное зрение (60 фт.)\n- Гномья хитрость: преимущество на Инт, Муд, Хар спасброски против магии.";
        character.speed = "25"; raceLangs = "Общий и Гномий.";
        if (character.subrace === "Лесной гном") raceFeatures += "\n[Лесной гном] Фокус Малая Иллюзия, общение с мелкими зверями.";
        else if (character.subrace === "Скальный гном") raceFeatures += "\n[Скальный гном] Ремесленные знания. Жестянщик (создание механизмов).";
    } else if (character.race === "Полуэльф") {
        raceFeatures = "[Раса: Полуэльф]\n- Тёмное зрение (60 фт.)\n- Наследие фей.\n- Универсальность навыков: владение 2 доп. навыками.";
        character.skillsProf.dec = true; character.skillsProf.per = true; raceLangs = "Общий, Эльфийский + 1.";
    } else if (character.race === "Полуорк") {
        raceFeatures = "[Раса: Полуорк]\n- Тёмное зрение (60 фт.)\n- Угрожающий вид: навык Запугивание.\n- Непоколебимая стойкость: при 0 ПЗ остаетесь с 1 ПЗ (1/отдых).\n- Свирепые атаки: доп. урон при крите.";
        character.skillsProf.inti = true; raceLangs = "Общий и Орочий.";
    } else if (character.race === "Тифлинг") {
        raceFeatures = "[Раса: Тифлинг]\n- Тёмное зрение (60 фт.)\n- Адское сопротивление: урон огнём.\n- Дьявольское наследие: фокус Чудотворство.";
        raceLangs = "Общий и Инфернальный.";
    }

    let classEquip = "", classFeatures = "", classProfs = "";
    character.hp = 0; character.maxHp = 0; 

    if (character.class === "Варвар") {
        character.savesProf.str = true; character.savesProf.con = true;
        character.skillsProf.ath = true; character.skillsProf.sur = true;
        classProfs = "[Броня и Оружие]\nЛегкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Варвар 1 ур.]\n- Ярость (2/отдых): преим. на Силу; +2 урон; сопротивление физ. урону.\n- Защита без доспехов (КД=10+ЛОВ+ТЕЛ).";
        classEquip = "Секира, 2 Ручных топора, 4 Метательных копья.";
        character.attacks = "Секира | +0 | 1d12+0 рубящий\nРучной топор | +0 | 1d6+0 рубящий"; 
    } else if (character.class === "Воин") {
        character.savesProf.str = true; character.savesProf.con = true;
        character.skillsProf.ath = true; character.skillsProf.inti = true;
        classProfs = "[Броня и Оружие]\nВсе доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Воин 1 ур.]\n- Боевой стиль (Дуэлянт: +2 к урону 1-ручн.)\n- Второе дыхание (хил 1d10+ур бонусным действием).";
        classEquip = "Длинный меч, Щит, Кольчужная рубаха";
        character.attacks = "Длинный меч | +0 | 1d8+0 рубящий"; 
    } else if (character.class === "Волшебник") {
        character.savesProf.int = true; character.savesProf.wis = true;
        character.skillsProf.arc = true; character.skillsProf.his = true;
        classProfs = "[Броня и Оружие]\nКинжалы, дротики, пращи, посохи, легкие арбалеты.";
        classFeatures = "[Волшебник 1 ур.]\n- Тайное восстановление (восст. ячеек на коротком отдыхе).\n[Магия]\nЯчейки: 2 (1 круг)\n- Фокусы: Огненный снаряд, Свет\n- 1 круг: Волшебная стрела, Щит, Усыпление";
        classEquip = "Посох, Книга заклинаний";
        character.attacks = "Огненный снаряд | +0 | 1d10 огонь\nВолшебная стрела | Авто | 3x1d4+1 силов.";
    } else if (character.class === "Жрец") {
        character.savesProf.wis = true; character.savesProf.cha = true;
        character.skillsProf.rel = true; character.skillsProf.med = true;
        classProfs = "[Броня и Оружие]\nЛегкие/средние доспехи, щиты, простое оружие.";
        classFeatures = "[Жрец 1 ур.]\n- Владение магией.\n[Магия]\nЯчейки: 2 (1 круг)\n- Фокусы: Священное пламя, Чудотворство\n- 1 круг: Лечение ран, Направляющий снаряд";
        classEquip = "Булава, Кольчужная рубаха, Щит";
        character.attacks = "Булава | +0 | 1d6+0 дробящий\nСвященное пламя | Спас Лов | 1d8 излуч.";
    } else if (character.class === "Бард") {
        character.savesProf.dex = true; character.savesProf.cha = true;
        character.skillsProf.acr = true; character.skillsProf.per = true; character.skillsProf.prf = true;
        classProfs = "[Броня и Оружие]\nЛегкие доспехи, простое, ручные арбалеты, рапиры, короткие мечи. 3 инструмента.";
        classFeatures = "[Бард 1 ур.]\n- Вдохновение барда (кубик d6 для бонуса другу)\n[Магия]\nЯчейки: 2 (1 круг)\n- Фокусы: Злая насмешка\n- 1 круг: Лечение ран, Героизм";
        classEquip = "Рапира, Кожаная броня, Лютня";
        character.attacks = "Рапира | +0 | 1d8+0 колющий\nЗлая насмешка | Спас Муд | 1d4 псих.";
    } else if (character.class === "Друид") {
        character.savesProf.int = true; character.savesProf.wis = true;
        character.skillsProf.nat = true; character.skillsProf.med = true;
        classProfs = "[Броня и Оружие]\nЛегкие/средние доспехи, щиты (НЕ из металла). Дубинки, кинжалы, копья, посохи, скимитары.";
        classFeatures = "[Друид 1 ур.]\n- Друидический язык.\n[Магия]\nЯчейки: 2 (1 круг)\n- Фокусы: Производство пламени, Дубинка\n- 1 круг: Лечение ран, Опутывание";
        classEquip = "Боевой посох, Кожаная броня, Щит (дерев.)";
        character.attacks = "Боевой посох | +0 | 1d6+0 дробящий\nПроизводство пламени | +0 | 1d8 огонь";
    } else if (character.class === "Монах") {
        character.savesProf.str = true; character.savesProf.dex = true;
        character.skillsProf.acr = true; character.skillsProf.ste = true;
        classProfs = "[Броня и Оружие]\nПростое оружие, короткие мечи.";
        classFeatures = "[Монах 1 ур.]\n- Защита без доспехов (КД=10+ЛОВ+МУД).\n- Боевые искусства (урон без оружия 1d4, бонусная атака).";
        classEquip = "Короткий меч, 10 дротиков";
        character.attacks = "Короткий меч | +0 | 1d6+0 колющий\nБезоружный удар | +0 | 1d4+0 дробящий";
    } else if (character.class === "Паладин") {
        character.savesProf.wis = true; character.savesProf.cha = true;
        character.skillsProf.ath = true; character.skillsProf.rel = true;
        classProfs = "[Броня и Оружие]\nВсе доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Паладин 1 ур.]\n- Божественное чувство (радар зла/добра).\n- Наложение рук (пул хила: 5 х Уровень).";
        classEquip = "Длинный меч, Щит, Кольчуга, 4 копья";
        character.attacks = "Длинный меч | +0 | 1d8+0 рубящий\nМетательное копье | +0 | 1d6+0 колющий";
    } else if (character.class === "Следопыт") {
        character.savesProf.str = true; character.savesProf.dex = true;
        character.skillsProf.ste = true; character.skillsProf.sur = true;
        classProfs = "[Броня и Оружие]\nЛегкие/средние доспехи, щиты, простое и воинское оружие.";
        classFeatures = "[Следопыт 1 ур.]\n- Избранный враг (бонус к выживанию/знаниям).\n- Исследователь природы (бонус в местности).";
        classEquip = "Длинный лук, Два коротких меча, Чешуйчатый доспех";
        character.attacks = "Длинный лук | +0 | 1d8+0 колющий\nКороткий меч | +0 | 1d6+0 колющий";
    } else if (character.class === "Плут") {
        character.savesProf.dex = true; character.savesProf.int = true;
        character.skillsProf.ste = true; character.skillsProf.acr = true; character.skillsProf.slg = true; character.skillsProf.dec = true;
        classProfs = "[Броня и Оружие]\nЛегкая броня, простое оружие, ручные арбалеты, длинные мечи, рапиры, короткие мечи. Воровские инструменты.";
        classFeatures = "[Плут 1 ур.]\n- Компетентность (х2 бонус мастерства на 2 навыка).\n- Скрытая атака (доп. урон +1d6).\n- Воровской жаргон (тайный язык).";
        classEquip = "Рапира, Кинжал, Кожаная броня, Инструменты вора";
        character.attacks = "Рапира | +0 | 1d8+0 колющий\nСкрытая атака | Доп. урон | +1d6 колющий";
    } else if (character.class === "Чародей") {
        character.savesProf.con = true; character.savesProf.cha = true;
        character.skillsProf.arc = true; character.skillsProf.dec = true;
        classProfs = "[Броня и Оружие]\nКинжалы, дротики, пращи, боевые посохи, легкие арбалеты.";
        classFeatures = "[Чародей 1 ур.]\n- Использование магии.\n[Магия]\nЯчейки: 2 (1 круг)\n- Фокусы: Огненный снаряд, Луч холода\n- 1 круг: Волшебная стрела, Доспех Агафиса";
        classEquip = "Боевой посох, 2 кинжала";
        character.attacks = "Огненный снаряд | +0 | 1d10 огонь\nКинжал | +0 | 1d4+0 колющий";
    } else if (character.class === "Колдун") {
        character.savesProf.wis = true; character.savesProf.cha = true;
        character.skillsProf.arc = true; character.skillsProf.inti = true;
        classProfs = "[Броня и Оружие]\nЛегкие доспехи, простое оружие.";
        classFeatures = "[Колдун 1 ур.]\n- Договор Покровителя.\n[Магия Договора]\nЯчейки: 1 (1 круг, восст. на Коротком отдыхе)\n- Фокусы: Мистический заряд, Леденящее прикосновение\n- 1 круг: Сглаз (Hex), Адское возмездие";
        classEquip = "Кинжал, Кожаная броня, Компонентный мешочек";
        character.attacks = "Мистический заряд | +0 | 1d10 силовой\nКинжал | +0 | 1d4+0 колющий";
    }

    const bgObj = backgroundData[bg];
    character.money = bgObj.money;
    character.equipment = `${classEquip}\n\n[Инвентарь предыстории]\n${bgObj.equip}`;
    character.proficiencies = `${classProfs}\n\n[Языки расы]\n${raceLangs}\n\n[От предыстории (${bg})]\n${bgObj.profs()}`;
    character.features = `${raceFeatures}\n\n${classFeatures}\n\n[Предыстория: ${bg}]\n${bgObj.feature}`;
    
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

function addXP(amount) {
    character.xp = (character.xp || 0) + amount;
    document.getElementById("sheet-xp").value = character.xp;
    checkLevelUp();
}

function checkLevelUp() {
    let oldLevel = character.level;
    let targetLevel = 1;
    // Официальные пороги опыта 5-й редакции (до 20 уровня)
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

// Получение списка способностей для конкретного уровня
function getAbilitiesForLevel(cls, sc, lvl) {
    let features = [];
    let asiText = "Увеличение характеристик (или черта. Увеличьте статы вручную в листе)";
    
    // 1. Повсеместное Увеличение Характеристик (ASI)
    if ([4,8,12,16,19].includes(lvl)) features.push(asiText);
    if (cls === "Воин" && [6,14].includes(lvl)) features.push(asiText);
    if (cls === "Плут" && lvl === 10) features.push(asiText);

    // 2. Способности Архетипа/Подкласса
    if (sc && archFeatures[sc] && archFeatures[sc][lvl]) {
        features.push(`[${sc}]: ` + archFeatures[sc][lvl]);
    }

    // 3. Базовые классовые способности (PHB)
    switch(cls) {
        case "Варвар":
            if(lvl===2) features.push("Безрассудная атака (преим. на атаку, по вам бьют с преим.), Чувство опасности (преим. на ЛОВ спасброски)");
            if(lvl===3) features.push("Путь дикости (выбор пути), Ярость x3 (кол-во раз)");
            if(lvl===5) features.push("Дополнительная атака (2 удара за действие), Быстрое передвижение (+10 фт скорости)");
            if(lvl===6) features.push("Ярость x4");
            if(lvl===7) features.push("Дикий инстинкт (преимущество на инициативу)");
            if(lvl===9) features.push("Сильный критический удар (+1 кость к криту)");
            if(lvl===11) features.push("Непреклонная ярость (не падает в 0 ХП при спасе)");
            if(lvl===12) features.push("Ярость x5");
            if(lvl===13) features.push("Сильный критический удар (+2 кости к криту)");
            if(lvl===15) features.push("Непрерывная ярость (не спадает, пока жив)");
            if(lvl===16) features.push("Ярость x6");
            if(lvl===17) features.push("Сильный критический удар (+3 кости к криту)");
            if(lvl===18) features.push("Неукротимая мощь (замена проверки Силы на ваш счет Силы)");
            if(lvl===20) features.push("Дикий чемпион (+4 Сила, +4 Телосложение, лимита на ярость нет)");
            break;
        case "Бард":
            if(lvl===2) features.push("Мастер на все руки (+половина бонуса ко всем навыкам), Песнь отдыха (доп. хил 1d6 на коротком)");
            if(lvl===3) features.push("Компетентность (удвоение бонуса у 2 навыков), Заклинания 2 кр. (Рекомендуемые, можно заменить: Удержание личности (паралич))");
            if(lvl===5) features.push("Вдохновение (кубик становится d8), Источник вдохновения (восст. на коротком). Закл. 3 кр. (Рекомендуемые: Рассеивание магии (снятие чар))");
            if(lvl===6) features.push("Контрочарование (защита группы от страха/очарования)");
            if(lvl===7) features.push("Заклинания 4 кр. (Рекомендуемые: Высшая невидимость (не слетает в бою))");
            if(lvl===9) features.push("Песнь отдыха (d8). Заклинания 5 кр. (Рекомендуемые: Массовое исцеление ран (АоЕ хил))");
            if(lvl===10) features.push("Вдохновение (кубик становится d10), Компетентность (еще 2 навыка), Тайны магии (2 заклинания из ЛЮБОГО класса)");
            if(lvl===11) features.push("Заклинания 6 кр. (Рекомендуемые: Неудержимая пляска Отто (вывод из строя))");
            if(lvl===13) features.push("Песнь отдыха (d10). Заклинания 7 кр. (Рекомендуемые: Телепортация (перемещение по миру))");
            if(lvl===14) features.push("Тайны магии (еще 2 заклинания из ЛЮБОГО класса)");
            if(lvl===15) features.push("Вдохновение (d12). Заклинания 8 кр. (Рекомендуемые: Подчинение чудовища (контроль монстра))");
            if(lvl===17) features.push("Песнь отдыха (d12). Заклинания 9 кр. (Рекомендуемые: Истинное превращение (смена формы))");
            if(lvl===18) features.push("Тайны магии (еще 2 заклинания из ЛЮБОГО класса)");
            if(lvl===20) features.push("Превосходное вдохновение (восст. 1 куба если их нет при броске инициативы)");
            break;
        case "Воин":
            if(lvl===2) features.push("Всплеск действий (одно дополнительное действие за ход, 1/отдых)");
            if(lvl===3) features.push("Воинский архетип (специализация класса)");
            if(lvl===5) features.push("Дополнительная атака (2 удара за действие)");
            if(lvl===9) features.push("Неукротимость (переброс проваленного спасброска 1/день)");
            if(lvl===11) features.push("Дополнительная атака (3 удара за действие)");
            if(lvl===13) features.push("Неукротимость (переброс спасброска 2/день)");
            if(lvl===17) features.push("Всплеск действий (2 применения/отдых), Неукротимость (переброс спасброска 3/день)");
            if(lvl===20) features.push("Дополнительная атака (4 удара за действие)");
            break;
        case "Волшебник":
            if(lvl===2) features.push("Магическая традиция (школа магии). Закл. (Рекомендуемые: Пылающая сфера (ДоТ огонь))");
            if(lvl===3) features.push("Заклинания 2 кр. (Рекомендуемые, можно заменить: Невидимость (скрытность), Паутина (АоЕ контроль))");
            if(lvl===5) features.push("Заклинания 3 кр. (Рекомендуемые, можно заменить: Огненный шар (АоЕ урон), Полет (перемещение в воздухе))");
            if(lvl===7) features.push("Заклинания 4 кр. (Рекомендуемые, можно заменить: Изгнание (отправка в другой план), Высшая невидимость (не спадает))");
            if(lvl===9) features.push("Заклинания 5 кр. (Рекомендуемые, можно заменить: Телекинез (перенос объектов), Стена силы (непробиваемый барьер))");
            if(lvl===11) features.push("Заклинания 6 кр. (Рекомендуемые, можно заменить: Цепная молния (скачущий урон), Дезинтеграция (огромный урон в одну цель))");
            if(lvl===13) features.push("Заклинания 7 кр. (Рекомендуемые, можно заменить: Телепортация (прыжок по миру), Замедленный огненный шар (бомба))");
            if(lvl===15) features.push("Заклинания 8 кр. (Рекомендуемые, можно заменить: Клон (бессмертие), Лабиринт (изгнание без спасброска))");
            if(lvl===17) features.push("Заклинания 9 кр. (Рекомендуемые, можно заменить: Желание (лучшее заклинание в игре), Метеоритный рой (максимальный АоЕ))");
            if(lvl===18) features.push("Мастерство заклинаний (выбор закл. 1 и 2 круга для бесконечного каста)");
            if(lvl===20) features.push("Подпись заклинателя (выбор двух закл. 3 круга для бесплатного каста)");
            break;
        case "Друид":
            if(lvl===2) features.push("Круг друидов (круг), Дикий облик (превращение в зверя 2/отдых)");
            if(lvl===3) features.push("Заклинания 2 кр. (Рекомендуемые, можно заменить: Пылающая сфера (шар огня), Дубовая кора (КД=16))");
            if(lvl===4) features.push("Дикий облик (до CR 1/2, без полета/плавания)");
            if(lvl===5) features.push("Заклинания 3 кр. (Рекомендуемые, можно заменить: Призыв молнии (АоЕ каждый ход))");
            if(lvl===7) features.push("Заклинания 4 кр. (Рекомендуемые, можно заменить: Превращение (превратить в Тиу-Рекса))");
            if(lvl===8) features.push("Дикий облик (до CR 1, разрешен полет)");
            if(lvl===9) features.push("Заклинания 5 кр. (Рекомендуемые, можно заменить: Массовое исцеление ран (АоЕ хил))");
            if(lvl===11) features.push("Заклинания 6 кр. (Рекомендуемые, можно заменить: Солнечный луч (луч слепоты/урона))");
            if(lvl===13) features.push("Заклинания 7 кр. (Рекомендуемые, можно заменить: Огненная буря (огромное АоЕ))");
            if(lvl===15) features.push("Заклинания 8 кр. (Рекомендуемые, можно заменить: Землетрясение (разрушение зданий))");
            if(lvl===17) features.push("Заклинания 9 кр. (Рекомендуемые, можно заменить: Предвидение (преимущество на всё))");
            if(lvl===18) features.push("Вечная юность (старение в 10 раз медленнее), Заклинания зверя (можно кастовать в облике животного)");
            if(lvl===20) features.push("Архидруид (бесконечный Дикий облик)");
            break;
        case "Жрец":
            if(lvl===2) features.push("Божественный домен (архетип), Божественный канал (особая сила домена, 1/отдых)");
            if(lvl===3) features.push("Заклинания 2 кр. (Рекомендуемые, можно заменить: Духовное оружие (удар бонусным))");
            if(lvl===5) features.push("Заклинания 3 кр. (Рекомендуемые, можно заменить: Духовные стражи (АоЕ аура урона))");
            if(lvl===6) features.push("Божественный канал (2/отдых)");
            if(lvl===7) features.push("Заклинания 4 кр. (Рекомендуемые, можно заменить: Изгнание (отправить в другой мир))");
            if(lvl===8) features.push("Разрушение нежити (убийство нежити до CR 1)");
            if(lvl===9) features.push("Заклинания 5 кр. (Рекомендуемые, можно заменить: Высшее восстановление (снятие мощных дебаффов))");
            if(lvl===10) features.push("Божественное вмешательство (просьба богу о чуде)");
            if(lvl===11) features.push("Заклинания 6 кр. (Рекомендуемые, можно заменить: Исцеление (мощный хил в 1 цель))");
            if(lvl===13) features.push("Заклинания 7 кр. (Рекомендуемые, можно заменить: Воскрешение (возврат к жизни до 100 лет))");
            if(lvl===14) features.push("Разрушение нежити (убийство нежити до CR 3)");
            if(lvl===15) features.push("Заклинания 8 кр. (Рекомендуемые, можно заменить: Святая аура (максимальная защита партии))");
            if(lvl===17) features.push("Заклинания 9 кр. (Рекомендуемые, можно заменить: Врата (портал куда угодно))");
            if(lvl===18) features.push("Божественный канал (3/отдых)");
            if(lvl===20) features.push("Божественное вмешательство (просьба богу исполняется гарантированно)");
            break;
        case "Монах":
            if(lvl===2) features.push("Ци (2 очка на спец. приемы), Движение без доспехов (+10 фт скорости)");
            if(lvl===3) features.push("Монашеская традиция (архетип), Отражение снарядов (ловля стрел реакцией)");
            if(lvl===4) features.push("Медленное падение (уменьшение урона от падения реакцией)");
            if(lvl===5) features.push("Дополнительная атака (2 удара за действие), Ошеломляющий удар (стан врага за 1 Ци)");
            if(lvl===6) features.push("Ки-удары (ваши кулаки игнорируют сопр. не-маг урону), Движение (+15 фт)");
            if(lvl===7) features.push("Уклонение (игнор урона при успешном спасе ЛОВ), Спокойствие разума (снятие страха/очарования)");
            if(lvl===9) features.push("Движение по стенам и воде (не падая/не тоня в свой ход)");
            if(lvl===10) features.push("Чистота тела (иммунитет к болезням и ядам), Движение (+20 фт)");
            if(lvl===13) features.push("Язык солнца и луны (понимание всех языков)");
            if(lvl===14) features.push("Алмазная душа (владение ВСЕМИ спасбросками, реролл за 1 Ци)");
            if(lvl===15) features.push("Вневременное тело (отсутствие старения/голода/жажды), Движение (+25 фт)");
            if(lvl===18) features.push("Пустое тело (невидимость на 1 мин и сопр. всем видам урона за 4 Ци)");
            if(lvl===20) features.push("Идеальный самоконтроль (получение 4 Ци при броске инициативы, если пусто)");
            break;
        case "Паладин":
            if(lvl===2) features.push("Боевой стиль (стойка), Божественная кара (трата ячейки на доп. урон излучением), Заклинания (Рекомендуемые: Щит веры (+2 КД))");
            if(lvl===3) features.push("Священная клятва (архетип), Божественное здоровье (иммунитет к болезням)");
            if(lvl===5) features.push("Дополнительная атака (2 удара за действие), Закл. 2 кр. (Рекомендуемые: Найти скакуна (боевой конь))");
            if(lvl===6) features.push("Аура защиты (добавление бонуса Харизмы ко всем спасброскам рядом)");
            if(lvl===9) features.push("Закл. 3 кр. (Рекомендуемые: Аура живучести (хил бонусным))");
            if(lvl===10) features.push("Аура отваги (иммунитет к испугу)");
            if(lvl===11) features.push("Улучшенная божественная кара (каждый удар бесплатно наносит +1d8 урона)");
            if(lvl===13) features.push("Закл. 4 кр. (Рекомендуемые: Охраняющий страж (АоЕ урон при подходе))");
            if(lvl===14) features.push("Очищающее касание (снятие заклинания с цели действием)");
            if(lvl===17) features.push("Закл. 5 кр. (Рекомендуемые: Разрушительная волна (АоЕ урон и нокдаун))");
            if(lvl===18) features.push("Улучшенные ауры (радиус защиты и отваги увеличен до 30 фт)");
            break;
        case "Следопыт":
            if(lvl===2) features.push("Боевой стиль (стойка), Заклинания (Рекомендуемые: Метка охотника (доп. урон))");
            if(lvl===3) features.push("Архетип, Первозданная осведомленность (радар типов существ за ячейку)");
            if(lvl===5) features.push("Дополнительная атака (2 удара за действие), Закл. 2 кр. (Рекомендуемые: Бесследное передвижение (+10 к стелсу группы))");
            if(lvl===6) features.push("Избранный враг / Исследователь природы (новые враги/местность)");
            if(lvl===8) features.push("Проход сквозь землю (игнор сложной местности)");
            if(lvl===9) features.push("Закл. 3 кр. (Рекомендуемые: Призыв животных (стаи зверей))");
            if(lvl===10) features.push("Маскировка на природе (+10 к скрытности при стоянии)");
            if(lvl===13) features.push("Закл. 4 кр. (Рекомендуемые: Каменная кожа (сопр. физ. урону))");
            if(lvl===14) features.push("Исчезновение (засада бонусным действием, невозможность выслеживания магией)");
            if(lvl===17) features.push("Закл. 5 кр. (Рекомендуемые: Удар стального ветра (серия телепортов с атакой))");
            if(lvl===18) features.push("Дикие чувства (игнор штрафов по невидимым, знание положения невидимок)");
            if(lvl===20) features.push("Убийца врагов (добавление бонуса Мудрости к броску атаки/урона против избранного врага)");
            break;
        case "Плут":
            if(lvl===2) features.push("Хитрое действие (Засада, Отход или Рывок бонусным действием)");
            if(lvl===3) features.push("Роговской архетип (архетип), Скрытая атака: 2d6 (урон при преим.)");
            if(lvl===5) features.push("Невероятное уклонение (уменьшение любого урона в 2 раза реакцией), Скрытая атака: 3d6");
            if(lvl===6) features.push("Компетентность (удвоение мастерства еще у 2 навыков)");
            if(lvl===7) features.push("Увертливость (нет урона при успешном спасе Ловкости от АоЕ), Скрытая атака: 4d6");
            if(lvl===9) features.push("Скрытая атака: 5d6");
            if(lvl===11) features.push("Надежный талант (любой бросок навыка с мастерством ниже 9 считается 10), Скрытая атака: 6d6");
            if(lvl===13) features.push("Скрытая атака: 7d6");
            if(lvl===14) features.push("Слепое зрение (зрение на 10 фт без света)");
            if(lvl===15) features.push("Скользкий ум (владение спасбросками Мудрости), Скрытая атака: 8d6");
            if(lvl===17) features.push("Скрытая атака: 9d6");
            if(lvl===18) features.push("Неуловимый (враги не могут иметь преимущество по вам, если вы не парализованы)");
            if(lvl===19) features.push("Скрытая атака: 10d6");
            if(lvl===20) features.push("Удар удачи (сделать любой промах попаданием 1/отдых)");
            break;
        case "Чародей":
            if(lvl===2) features.push("Источник магии (2 очка чар на восполнение магии)");
            if(lvl===3) features.push("Метамагия (выбор 2 улучшений заклинаний), Закл. 2 кр. (Рекомендуемые: Паутина (контроль))");
            if(lvl===5) features.push("Закл. 3 кр. (Рекомендуемые, можно заменить: Огненный шар (АоЕ урон), Контрзаклинание (отмена каста врага))");
            if(lvl===7) features.push("Закл. 4 кр. (Рекомендуемые, можно заменить: Превращение (стать Тиу-Рексом))");
            if(lvl===9) features.push("Закл. 5 кр. (Рекомендуемые, можно заменить: Телекинез (бросок врагов))");
            if(lvl===10) features.push("Метамагия (еще 1 улучшение заклинаний)");
            if(lvl===11) features.push("Закл. 6 кр. (Рекомендуемые, можно заменить: Цепная молния (Прыгающий урон))");
            if(lvl===13) features.push("Закл. 7 кр. (Рекомендуемые, можно заменить: Огненная буря (огромное АоЕ огнем))");
            if(lvl===15) features.push("Закл. 8 кр. (Рекомендуемые, можно заменить: Землетрясение (разрушение зданий))");
            if(lvl===17) features.push("Метамагия (еще 1 улучшение), Закл. 9 кр. (Рекомендуемые, можно заменить: Метеоритный рой (макс АоЕ в игре))");
            if(lvl===20) features.push("Восстановление чар (восполнение 4 очков чар на коротком отдыхе)");
            break;
        case "Колдун":
            if(lvl===2) features.push("Таинственные воззвания (выбор 2 пассивных улучшений)");
            if(lvl===3) features.push("Предмет договора (оружие/книга/бес). Закл. 2 кр. (Рекомендуемые: Тьма (слепота))");
            if(lvl===5) features.push("Воззвания (3 шт), Закл. 3 кр. (Рекомендуемые: Полет (парение))");
            if(lvl===7) features.push("Воззвания (4 шт), Закл. 4 кр. (Рекомендуемые: Изгнание (отправить в др. мир))");
            if(lvl===9) features.push("Воззвания (5 шт), Закл. 5 кр. (Рекомендуемые: Удержание чудовища (паралич босса))");
            if(lvl===11) features.push("Таинственный арканум (выбор 1 закл. 6 круга, каст без ячейки 1/день)");
            if(lvl===12) features.push("Воззвания (6 шт)");
            if(lvl===13) features.push("Таинственный арканум (выбор 1 закл. 7 круга, каст без ячейки 1/день)");
            if(lvl===15) features.push("Таинственный арканум (выбор 1 закл. 8 круга), Воззвания (7 шт)");
            if(lvl===17) features.push("Таинственный арканум (выбор 1 закл. 9 круга, каст без ячейки 1/день)");
            if(lvl===18) features.push("Воззвания (8 шт)");
            if(lvl===20) features.push("Мастер мистической магии (восстановление ячеек за 1 минуту 1/день)");
            break;
    }
    return features;
}

// Отображение диалогового окна повышения уровня
function showLevelUpModal(oldLvl, newLvl, subclassOpts) {
    let newAbilities = [];
    
    // Собираем способности (включая архетипные, если архетип УЖЕ был выбран на предыдущих уровнях)
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
        html += `<div class="flex-col gap-10">` + subclassOpts.map(opt => 
            `<button class="btn-panel" style="text-align:center;" onclick="commitLevelUp(${oldLvl}, ${newLvl}, '${opt}')">${opt}</button>`
        ).join("") + `</div>`;
    } else {
        html += `<button class="btn-secondary" style="width: 100%; margin-top: 10px; padding: 15px;" onclick="commitLevelUp(${oldLvl}, ${newLvl}, null)">Отлично! Принять изменения</button>`;
    }

    container.innerHTML = html;
    document.getElementById("modal-levelup").classList.remove("hidden");
}

// Применение нового уровня и сохранение способностей в текст
function commitLevelUp(oldLvl, newLvl, chosenSubclass) {
    document.getElementById("modal-levelup").classList.add("hidden");
    
    if (chosenSubclass) {
        character.subclass = chosenSubclass;
    }

    let newAbilities = [];
    for (let lvl = oldLvl + 1; lvl <= newLvl; lvl++) {
        // Вызываем еще раз, теперь с учетом свежевыбранного подкласса
        newAbilities.push(...getAbilitiesForLevel(character.class, character.subclass, lvl));
    }

    if (newAbilities.length > 0) {
        let abilitiesText = `\n\n[Получено при повышении до ${newLvl} ур.]\n- ` + newAbilities.join("\n- ");
        character.features += abilitiesText;
    }

    character.level = newLvl; // Устанавливаем новый уровень ПЕРЕД перерасчетом

    let oldMax = character.maxHp;
    updateCalculations(); 
    let hpGain = character.maxHp - oldMax;
    character.hp = character.maxHp; 
    
    saveGame();
    updateAllUI();
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
    
    if (character.class === "Варвар") { hpBase = 12; hpPerLevel = 7; }
    else if (["Воин", "Паладин", "Следопыт"].includes(character.class)) { hpBase = 10; hpPerLevel = 6; }
    else if (["Жрец", "Бард", "Друид", "Монах", "Плут", "Колдун"].includes(character.class)) { hpBase = 8; hpPerLevel = 5; }
    else if (["Волшебник", "Чародей"].includes(character.class)) { hpBase = 6; hpPerLevel = 4; }

    if (hpBase > 0) {
        let newMaxHp = (hpBase + conMod) + (character.level - 1) * (hpPerLevel + conMod);
        if (character.subclass === "Наследие Драконов" || (character.class === "Чародей" && character.level < 3 && character.features.includes("Наследие драконов"))) {
            newMaxHp += character.level; 
        }
        if (character.subrace === "Холмовой дварф") {
            newMaxHp += character.level; 
        }
        
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

    let dexMod = calculateModifierRaw(character.stats['dexterity'] || 10);
    let wisMod = calculateModifierRaw(character.stats['wisdom'] || 10);
    let conModActual = calculateModifierRaw(character.stats['constitution'] || 10);

    if (character.class === "Варвар") {
        character.ac = 10 + dexMod + conModActual;
    } else if (character.class === "Монах") {
        character.ac = 10 + dexMod + wisMod;
    } else if (character.class === "Чародей") {
        if (character.subclass === "Наследие Драконов" || (character.level < 3 && character.features.includes("Наследие драконов"))) {
            character.ac = 13 + dexMod; 
        } else {
            character.ac = 10 + dexMod;
        }
    } else if (character.class === "Волшебник") {
        character.ac = 10 + dexMod;
    } else if (["Бард", "Плут", "Колдун"].includes(character.class)) {
        character.ac = 11 + dexMod; 
    } else if (["Жрец", "Друид", "Следопыт"].includes(character.class)) {
        character.ac = 14 + Math.min(2, dexMod); 
        if(character.class === "Жрец") character.ac = 13 + Math.min(2, dexMod) + 2; 
        if(character.class === "Друид") character.ac = 11 + dexMod + 2; 
    } else if (["Воин", "Паладин"].includes(character.class)) {
        character.ac = 16; 
        if(character.class === "Воин") character.ac = 13 + Math.min(2, dexMod) + 2; 
    } else {
        character.ac = 10 + dexMod;
    }
    
    document.getElementById('sheet-ac').value = character.ac;

    character.initiative = dexMod > 0 ? `+${dexMod}` : `${dexMod}`;
    document.getElementById('sheet-init').value = character.initiative;

    if (character.attacks) {
        let strMod = calculateModifierRaw(character.stats['strength'] || 10);
        let intMod = calculateModifierRaw(character.stats['intelligence'] || 10);
        let chaMod = calculateModifierRaw(character.stats['charisma'] || 10);
        let finMod = Math.max(strMod, dexMod); 
        
        let text = character.attacks;
        let hitStr = (strMod + pb > 0 ? "+" : "") + (strMod + pb);
        let dmgStr = (strMod > 0 ? "+" + strMod : (strMod < 0 ? strMod : ""));
        let hitDex = (dexMod + pb > 0 ? "+" : "") + (dexMod + pb);
        let dmgDex = (dexMod > 0 ? "+" + dexMod : (dexMod < 0 ? dexMod : ""));
        let hitFin = (finMod + pb > 0 ? "+" : "") + (finMod + pb);
        let dmgFin = (finMod > 0 ? "+" + finMod : (finMod < 0 ? finMod : ""));
        
        let hitInt = (intMod + pb > 0 ? "+" : "") + (intMod + pb);
        let hitWis = (wisMod + pb > 0 ? "+" : "") + (wisMod + pb);
        let hitCha = (chaMod + pb > 0 ? "+" : "") + (chaMod + pb);

        let dcWis = 8 + pb + wisMod; 
        let dcCha = 8 + pb + chaMod; 

        // Расчет количества кубиков для заговоров (1 на 1м, 2 на 5м, 3 на 11м, 4 на 17м)
        let cantripDice = character.level >= 17 ? 4 : (character.level >= 11 ? 3 : (character.level >= 5 ? 2 : 1));

        if (character.class === "Варвар") {
            text = text.replace(/Секира \| [+\-0-9]+ \| 1d12[+\-0-9]* рубящий/, `Секира | ${hitStr} | 1d12${dmgStr} рубящий`);
            text = text.replace(/Ручной топор \| [+\-0-9]+ \| 1d6[+\-0-9]* рубящий/, `Ручной топор | ${hitStr} | 1d6${dmgStr} рубящий`);
        } else if (character.class === "Воин") {
            let dmgDueling = (strMod + 2 > 0 ? "+" + (strMod + 2) : (strMod + 2 < 0 ? (strMod + 2) : ""));
            text = text.replace(/Длинный меч \| [+\-0-9]+ \| 1d8[+\-0-9]* рубящий/, `Длинный меч | ${hitStr} | 1d8${dmgDueling} рубящий`);
        } else if (character.class === "Волшебник") {
            text = text.replace(/Огненный снаряд \| [+\-0-9]+ \| \d+d10 огонь/, `Огненный снаряд | ${hitInt} | ${cantripDice}d10 огонь`);
        } else if (character.class === "Жрец") {
            text = text.replace(/Булава \| [+\-0-9]+ \| 1d6[+\-0-9]* дробящий/, `Булава | ${hitStr} | 1d6${dmgStr} дробящий`);
            text = text.replace(/Священное пламя \| Спас Лов( СЛ \d+ )?\| \d+d8 излуч./, `Священное пламя | Спас Лов СЛ ${dcWis} | ${cantripDice}d8 излуч.`);
        } else if (character.class === "Бард") {
            text = text.replace(/Рапира \| [+\-0-9]+ \| 1d8[+\-0-9]* колющий/, `Рапира | ${hitFin} | 1d8${dmgFin} колющий`);
            text = text.replace(/Злая насмешка \| Спас Муд( СЛ \d+ )?\| \d+d4 псих./, `Злая насмешка | Спас Муд СЛ ${dcCha} | ${cantripDice}d4 псих.`);
        } else if (character.class === "Друид") {
            text = text.replace(/Боевой посох \| [+\-0-9]+ \| 1d6[+\-0-9]* дробящий/, `Боевой посох | ${hitStr} | 1d6${dmgStr} дробящий`);
            text = text.replace(/Производство пламени \| [+\-0-9]+ \| \d+d8 огонь/, `Производство пламени | ${hitWis} | ${cantripDice}d8 огонь`);
        } else if (character.class === "Монах") {
            let monkDice = character.level >= 17 ? "1d10" : (character.level >= 11 ? "1d8" : (character.level >= 5 ? "1d6" : "1d4"));
            text = text.replace(/Короткий меч \| [+\-0-9]+ \| 1d6[+\-0-9]* колющий/, `Короткий меч | ${hitFin} | 1d6${dmgFin} колющий`);
            text = text.replace(/Безоружный удар \| [+\-0-9]+ \| 1d\d+[+\-0-9]* дробящий/, `Безоружный удар | ${hitFin} | ${monkDice}${dmgFin} дробящий`);
        } else if (character.class === "Паладин") {
            text = text.replace(/Длинный меч \| [+\-0-9]+ \| 1d8[+\-0-9]* рубящий/, `Длинный меч | ${hitStr} | 1d8${dmgStr} рубящий`);
            text = text.replace(/Метательное копье \| [+\-0-9]+ \| 1d6[+\-0-9]* колющий/, `Метательное копье | ${hitStr} | 1d6${dmgStr} колющий`);
        } else if (character.class === "Следопыт") {
            text = text.replace(/Длинный лук \| [+\-0-9]+ \| 1d8[+\-0-9]* колющий/, `Длинный лук | ${hitDex} | 1d8${dmgDex} колющий`);
            text = text.replace(/Короткий меч \| [+\-0-9]+ \| 1d6[+\-0-9]* колющий/, `Короткий меч | ${hitFin} | 1d6${dmgFin} колющий`);
        } else if (character.class === "Плут") {
            let sneakDice = Math.ceil(character.level / 2);
            text = text.replace(/Рапира \| [+\-0-9]+ \| 1d8[+\-0-9]* колющий/, `Рапира | ${hitFin} | 1d8${dmgFin} колющий`);
            text = text.replace(/Кинжал \| [+\-0-9]+ \| 1d4[+\-0-9]* колющий/, `Кинжал | ${hitFin} | 1d4${dmgFin} колющий`);
            text = text.replace(/Скрытая атака \| Доп\. урон \| \+\d+d6 колющий/, `Скрытая атака | Доп. урон | +${sneakDice}d6 колющий`);
        } else if (character.class === "Чародей") {
            text = text.replace(/Огненный снаряд \| [+\-0-9]+ \| \d+d10 огонь/, `Огненный снаряд | ${hitCha} | ${cantripDice}d10 огонь`);
            text = text.replace(/Кинжал \| [+\-0-9]+ \| 1d4[+\-0-9]* колющий/, `Кинжал | ${hitFin} | 1d4${dmgFin} колющий`);
        } else if (character.class === "Колдун") {
            text = text.replace(/Мистический заряд \| [+\-0-9]+ \| \d+d10 силовой/, `Мистический заряд | ${hitCha} | ${cantripDice}d10 силовой`);
            text = text.replace(/Кинжал \| [+\-0-9]+ \| 1d4[+\-0-9]* колющий/, `Кинжал | ${hitFin} | 1d4${dmgFin} колющий`);
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

    // Динамические кнопки повышения опыта в зависимости от уровня (3 штуки)
    let xpBtnDiv = document.getElementById("xp-buttons-container");
    if (xpBtnDiv) {
        let xp1 = 10, xp2 = 50, xp3 = 100;
        if (character.level >= 15) { xp1 = 1000; xp2 = 5000; xp3 = 10000; }
        else if (character.level >= 10) { xp1 = 500; xp2 = 1000; xp3 = 2500; }
        else if (character.level >= 5) { xp1 = 100; xp2 = 250; xp3 = 500; }
        else if (character.level >= 3) { xp1 = 50; xp2 = 100; xp3 = 250; }
        
        xpBtnDiv.innerHTML = `
            <button onclick="addXP(${xp1})" class="btn-xp">+${xp1}</button>
            <button onclick="addXP(${xp2})" class="btn-xp">+${xp2}</button>
            <button onclick="addXP(${xp3})" class="btn-xp">+${xp3}</button>
        `;
    }

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

function resetGame() {
    if(confirm("Вы уверены, что хотите удалить текущего персонажа? Убедитесь, что сделали экспорт (TXT)!")) {
        localStorage.removeItem("dnd_char");
        
        let loadBtn = document.getElementById("loadGameBtn");
        let clearBtn = document.getElementById("clearSaveBtn");
        if(loadBtn) loadBtn.classList.add("hidden");
        if(clearBtn) clearBtn.classList.add("hidden");
        
        character = {
            name: "", race: "", subrace: "", class: "", subclass: "", background: "",
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
    
    a.click(); 
    URL.revokeObjectURL(url);
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