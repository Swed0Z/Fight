let interface1 = document.querySelector('.interface1')
let interface2 = document.querySelector('.interface2')
let initial = document.querySelector('.initial')
let fightArea = document.querySelector('.FightArea')
let selectHero = document.querySelector('.selectHero')
let nameHero = document.querySelector('.nameHeroArea')
function Play() {
    interface2.classList.remove('hidden')
    interface1.classList.add ('hidden')
}
function FightArea(){
    fightArea.classList.remove('hidden')
    initial.classList.add ('hidden')
}
function nameHeroArea(){

}
function selectHeroArea(){
    selectHero.classList.remove('hidden')
    initial.classList.add ('hidden')
}
function FightArea2(){    
    fightArea.classList.remove('hidden')
    selectHero.classList.add ('hidden')
}
document.querySelector('#beginning').addEventListener('click', function() {
    location.reload();
});
function NewGame(){
    localStorage.clear();
}

function selectCharacter(characterClass) {
    switch (characterClass) {
      case 'Mage':
        Char = new Mage(nameHero);
        break;
      case 'Knight':
        Char = new Knight(nameHero);
        break;
      case 'Archer':
        Char = new Archer(nameHero);
        break;
      default:
        console.error('Invalid character class');
        return;
    }
}