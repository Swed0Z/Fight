class Character {
    _life = 1
    maxLife = 1
    defense = 0
    attack = 0

    constructor(name) {
        this.name = name
    }
    get life() {
        return this._life
    }
    set life(newLife) {
        this._life = newLife < 0 ? 0 : newLife
    }
}
class Knight extends Character {
    constructor(name) {
        super(name)
        this.life = 100
        this.attack = 10
        this.defense = 8
        this.maxLife = this.life
    }
}
class Mage extends Character {
    constructor(name) {
        super(name)
        this.life = 60
        this.attack = 25
        this.defense = 5
        this.maxLife = this.life
    }
}
class Archer extends Character {
    constructor(name) {
        super(name)
        this.life = 70
        this.attack = 15
        this.defense = 6
        this.maxLife = this.life
    }
}
class LittleMonster extends Character {
    constructor() {
        super('Little Monster')
        this.life = 30
        this.attack = 5
        this.defense = 2
        this.maxLife = this.life
    }
}
class BigMonster extends Character {
    constructor() {
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
            this.loadGame()
            this.update()
            this.FighterEL1.querySelector('.AttackButton').addEventListener('click', () => this.doAttack(this.Fighter1, this.Fighter2))
    
            this.FighterEL2.querySelector('.AttackButton').addEventListener('click', () => this.doAttack(this.Fighter2, this.Fighter1))  

            document.querySelector('#newGame').addEventListener('click', () => {
                this.criation()
                this.update()
            })  
    }

    update() {
        if (this.Fighter1 && this.Fighter1._life !== undefined && this.Fighter2 && this.Fighter2._life !== undefined) {
            let f1PCT = (this.Fighter1._life / this.Fighter1.maxLife) * 100
            this.FighterEL1.querySelector('.name').innerHTML = `${this.Fighter1.name} - ${this.Fighter1._life.toFixed(1)}HP`
            this.FighterEL1.querySelector('.Bar').style.width = `${f1PCT}%`
        
            let f2PCT = (this.Fighter2._life / this.Fighter2.maxLife) * 100
            this.FighterEL2.querySelector('.name').innerHTML = `${this.Fighter2.name} - ${this.Fighter2._life.toFixed(1)}HP`
            this.FighterEL2.querySelector('.Bar').style.width = `${f2PCT}%`
        }else {
            this.criation()
            this.update()
        }
        if (this.Fighter1._life <= 0) {
            this.FighterEL1.querySelector('.name').innerHTML = `${this.Fighter1.name} - 0HP`;
        }

        if (this.Fighter2._life <= 0) {
            this.FighterEL2.querySelector('.name').innerHTML = `${this.Fighter2.name} - 0HP`;
        }
    }
    criation(){
        this.Fighter1 = new Knight('Swed')
        this.Fighter2 = new LittleMonster()

        this.saveGame()
    }


    doAttack(attacking, attacked) {
        let attackFactor = (Math.random() * 2).toFixed(2)
        let defenseFactor = (Math.random() * 2).toFixed(2)

        let actualAttack = attacking.attack * attackFactor
        let actualDefense = attacked.defense * defenseFactor

        if( attacked._life <= 0 || attacking._life <= 0){
            console.log('alguém morreu')
            return attacked._life = 0
        }else{
            if (actualAttack > actualDefense) {
            attacked._life -= actualAttack
            console.log(`${attacking.name} acaba de causa ${actualAttack.toFixed(2)} em ${attacked.name}`)
            } else {
            console.log('defesa perfeita')

            }
        }
        this.update()
        this.saveGame()
    }
    saveGame() {
        localStorage.setItem('Fighter1', JSON.stringify(this.Fighter1))
        localStorage.setItem('Fighter2', JSON.stringify(this.Fighter2))
    }
    loadGame() {
        this.Fighter1 = JSON.parse(localStorage.getItem('Fighter1'))
        this.Fighter2 = JSON.parse(localStorage.getItem('Fighter2'))
    }
}