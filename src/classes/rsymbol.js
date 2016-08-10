/**
 * Represents a reel symbol.
 */
class Rsymbol {

    /**
     * Creates a new symbol instance.
     *
     * @param  {Phaser.Game}  game       Phaser game object to add the symbol to
     * @param  {String}       name       A name identifier used for equivalence testing
     * @param  {String}       spriteKey  Key to a Phaser sprite 
     * @param  {Number}       offset     Offset (index) within the reel 
     */
    constructor (game, name, spriteKey, offset = 0) {
        
        // Set properties
        this.name = name;
        this.offset = offset;
        this.reel = undefined;
        this.gameObject = game.add.sprite(0, 0, spriteKey);
        game.physics.enable(this.gameObject, Phaser.Physics.ARCADE);
    }
}

export default Rsymbol;