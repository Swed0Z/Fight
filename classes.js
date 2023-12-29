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
        this.maxlife = this.life
    }
}
class Mage extends Character{
    constructor(name){
        super(name)
        this.life = 50
        this.attack = 25
        this.defense = 5
        this.maxlife = this.life
    }
}