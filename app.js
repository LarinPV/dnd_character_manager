let character = {

    name:"",
    race:"",
    class:"",

    level:1,
    xp:0,

    stats:{},

    skills:[]
};

function nextScreen(id){

    document
    .querySelector('.screen.active')
    .classList.remove('active');

    document
    .getElementById(id)
    .classList.add('active');
}

function selectRace(race){

    character.race = race;

    nextScreen('screen-class');
}

function selectClass(cls){

    character.class = cls;

    generateStats();

    nextScreen('screen-stats');
}

function rollStat(){

    let rolls=[];

    for(let i=0;i<4;i++){

        rolls.push(
            Math.floor(Math.random()*6)+1
        );
    }

    rolls.sort((a,b)=>a-b);

    return rolls[1]+rolls[2]+rolls[3];
}

function generateStats(){

    character.stats = {

        strength:rollStat(),
        dexterity:rollStat(),
        constitution:rollStat(),
        intelligence:rollStat(),
        wisdom:rollStat(),
        charisma:rollStat()
    };

    renderStats();
}

function renderStats(){

    document.getElementById("stats").innerHTML=`

        <p>Сила: ${character.stats.strength}</p>
        <p>Ловкость: ${character.stats.dexterity}</p>
        <p>Телосложение: ${character.stats.constitution}</p>
        <p>Интеллект: ${character.stats.intelligence}</p>
        <p>Мудрость: ${character.stats.wisdom}</p>
        <p>Харизма: ${character.stats.charisma}</p>
    `;
}

function finishCreation(){

    character.name =
    document.getElementById(
    "characterName").value;

    if(character.class==="Воин"){

        character.skills=[
            "Владение оружием"
        ];
    }

    if(character.class==="Маг"){

        character.skills=[
            "Огненная стрела"
        ];
    }

    showSheet();
}

function showSheet(){

    document
    .getElementById("wizard")
    .style.display="none";

    document
    .getElementById("sheet")
    .classList.remove("hidden");

    updateSheet();
}

function updateSheet(){

    document.getElementById(
    "sheetName").textContent =
    character.name;

    document.getElementById(
    "sheetRace").textContent =
    character.race;

    document.getElementById(
    "sheetClass").textContent =
    character.class;

    document.getElementById(
    "sheetLevel").textContent =
    character.level;

    document.getElementById(
    "sheetXP").textContent =
    character.xp;

    document.getElementById(
    "sheetStats").innerHTML =

    Object.entries(character.stats)
    .map(([k,v])=>`<p>${k}: ${v}</p>`)
    .join("");

    document.getElementById(
    "sheetSkills").innerHTML =

    character.skills
    .map(skill=>`<li>${skill}</li>`)
    .join("");
}

function addXP(amount){

    character.xp += amount;

    if(
        character.level===1 &&
        character.xp>=100
    ){

        character.level=2;

        if(character.class==="Воин"){

            character.stats.strength+=2;

        }else{

            character.stats.intelligence+=2;
            character.skills.push(
                "Магическая броня"
            );
        }
    }

    if(
        character.level===2 &&
        character.xp>=300
    ){

        character.level=3;

        if(character.class==="Воин"){

            character.skills.push(
                "Мощный удар"
            );

        }else{

            character.skills.push(
                "Огненный шар"
            );
        }
    }

    updateSheet();
}

function saveCharacter(){

    localStorage.setItem(
        "dndCharacter",
        JSON.stringify(character)
    );

    alert("Персонаж сохранён");
}