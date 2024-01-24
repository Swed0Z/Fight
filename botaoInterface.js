let interface1 = document.querySelector('.interface1')
let interface2 = document.querySelector('.interface2')
let initial = document.querySelector('.initial')
let fightAreaLocal = document.querySelector('.FightArea')
let selectHero = document.querySelector('.selectHero')
let nameHero = document.querySelector('.nameHeroArea')
let nameHeroValue
function Play() {
    interface2.classList.remove('hidden')
    interface1.classList.add ('hidden')
}
function FightArea(){
    fightAreaLocal.classList.remove('hidden')
    initial.classList.add ('hidden')
    nameHero.classList.add('hidden')
}
function nameHeroArea(){
    initial.classList.add ('hidden')
    nameHero.classList.remove('hidden')
}
function selectHeroArea(){
    selectHero.classList.remove('hidden')
    nameHero.classList.add ('hidden')
}
function FightArea2(){    
    fightAreaLocal.classList.remove('hidden')
    selectHero.classList.add ('hidden')
}
document.querySelector('#beginning').addEventListener('click', function() {
    location.reload();
});
function NewGame(){
    localStorage.clear();
}

function saveName(){
    nameHeroValue = document.querySelector('#nameInput').value
}

function selectCharacter(characterClass) {
    switch (characterClass) { 
      case 'Knight':
        Char = new Knight(nameHeroValue);
        break;
      case 'Mage':
        Char = new Mage(nameHeroValue);
        break;
      case 'Archer':
        Char = new Archer(nameHeroValue);
        break;
      default:
        console.error('Invalid character class');
        return;
    }
    console.log(Char.constructor.name)
    stage.Fighter1 = Char
    stage.Fighter1.name = nameHeroValue
    stage.update()

}