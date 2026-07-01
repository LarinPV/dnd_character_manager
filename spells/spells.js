// Этот файл собирает все подключенные массивы заклинаний в единую базу данных spellsDB
const spellsDB = [].concat(
    typeof spellsPHB0 !== 'undefined' ? spellsPHB0 : [],
    typeof spellsPHB1 !== 'undefined' ? spellsPHB1 : [],
    typeof spellsPHB2 !== 'undefined' ? spellsPHB2 : [],
    typeof spellsPHB3 !== 'undefined' ? spellsPHB3 : [],
    typeof spellsPHB4 !== 'undefined' ? spellsPHB4 : [],
    typeof spellsPHB5 !== 'undefined' ? spellsPHB5 : [],
    typeof spellsPHB6 !== 'undefined' ? spellsPHB6 : [],
    typeof spellsPHB7 !== 'undefined' ? spellsPHB7 : [],
    typeof spellsPHB8 !== 'undefined' ? spellsPHB8 : [],
    typeof spellsPHB9 !== 'undefined' ? spellsPHB9 : []
);