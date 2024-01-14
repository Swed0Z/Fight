function Play() {
    let interface1 = document.querySelector('.interface1')
    let interface2 = document.querySelector('.interface2')

    interface2.classList.remove('hidden')
    interface1.classList.add ('hidden')
}
function NextArea(){
    let initial = document.querySelector('.initial')
    let FightArea = document.querySelector('.FightArea')

    FightArea.classList.remove('hidden')
    initial.classList.add ('hidden')
}
function NewGame(){
    localStorage.clear();
}