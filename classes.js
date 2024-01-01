class Character {
    _life = 1
    maxLife = 1
    defense = 0
    attack = 0

    constructor(name){
    this.name = name
    }
    get life(){
        return this._life
    }
    set life(newLife){
        this._life = newLife < 0 ? 0 : newLife
    }
}
class Knight extends Character{
    constructor(name){
        super(name)
        this.life = 100
        this.attack = 10
        this.defense = 8
        this.maxLife = this.life
    }
}
class Mage extends Character{
    constructor(name){
        super(name)
        this.life = 60
        this.attack = 25
        this.defense = 5
        this.maxLife = this.life
    }
}
class LittleMonster extends Character{
    constructor(){
    super('Little Monster')
    this.life = 30
    this.attack = 5
    this.defense = 2
    this.maxLife = this.life
}
}
class BigMonster extends Character{
    constructor(){
    super('Big Monster')
    this.life = 120
    this.attack = 15
    this.defense = 1
    this.maxLife = this.life
}
}
class Stage {
    constructor(Fighter1, Fighter2, FighterEL1, FighterEL2) {
        this.Fighter1 = Fighter1
        this.Fighter2 = Fighter2
        this.FighterEL1 = FighterEL1
        this.FighterEL2 = FighterEL2
    }

    start() {
        this.update()

        this.FighterEL1.querySelector('.AttackButton').addEventListener('click', () => this.doAttack(this.Fighter1,this.Fighter2))

        this.FighterEL2.querySelector('.AttackButton').addEventListener('click', () => this.doAttack(this.Fighter2,this.Fighter1))
        
    }

    update() {

        let f1PCT = (this.Fighter1.life / this.Fighter1.maxLife) * 100
        this.FighterEL1.querySelector('.name').innerHTML = `${this.Fighter1.name} - ${this.Fighter1.life.toFixed(1)}HP`
        this.FighterEL1.querySelector('.Bar').style.width = `${f1PCT}%`

        let f2PCT = (this.Fighter2.life / this.Fighter2.maxLife) * 100
        this.FighterEL2.querySelector('.name').innerHTML = `${this.Fighter2.name} - ${this.Fighter2.life.toFixed(1)}HP`
        this.FighterEL2.querySelector('.Bar').style.width = `${f2PCT}%`
        
    }
    doAttack(attacking, attacked){
       if(attacking.life <= 0 || attacked.life <= 0){
            console.log('alguém ta morto')
            return
       }
       let attackFactor = (Math.random() * 2).toFixed(2)
       let defenseFactor = (Math.random() * 2).toFixed(2)

       let actualAttack = attacking.attack * attackFactor
       let actualDefense = attacked.defense * defenseFactor

       if (actualAttack > actualDefense) {
            attacked.life -= actualAttack
            console.log(`${attacking.name} acaba de causa ${actualAttack.toFixed(2)} em ${attacked.name}`)
       } else {
        console.log('defesa perfeita')

       }

        this.update()
    }
}
