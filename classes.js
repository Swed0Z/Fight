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
    constructor(Fighter1,Fighter2,FighterEL1,FighterEL2){
        this.Fighter1 = Fighter1
        this.Fighter2 = Fighter2
        this.FighterEL1 = FighterEL1
        this.FighterEL2 = FighterEL2
    }
    start(){
        this.update()
    }
    update(){
        this.FighterEL1.querySelector('.name').innerHTML = this.Fighter1.name
        this.FighterEL2.querySelector('.name').innerHTML = this.Fighter2.name
    }
}