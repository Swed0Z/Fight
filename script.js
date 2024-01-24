let Char
let Monster = new LittleMonster()

let stage = new Stage(
    Char,
    Monster,
    document.querySelector('#Character'),
    document.querySelector('#Monster')
);

stage.start();
