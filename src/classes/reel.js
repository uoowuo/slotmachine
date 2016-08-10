import Rsymbol from './rsymbol';

/**
 * Represents a slot machine reel.
 *
 * @requires  rsymbol
 */
class Reel {

    /**
     * Creates a reel instance.
     * @todo Adding it all to a Phaser group destroys coordinate system somehow
     *
     * @param  {Phaser.Game}  game        Phaser game object to add the reel to
     * @param  {Array}        symbols     Array of symbol names to create in the reel
     * @param  {Number}       offset      Initial reel rotation offset in symbols
     * @param  {Number}       x           Reel X coordinate
     * @param  {Number}       y           Reel Y coordinate
     */
    constructor (game, symbols = [], offset = 0, x = 0, y = 0) {
        
        // Set properties
        this.offset = offset;
        this.gameObject = game.add.physicsGroup();
        this.name = 'reel-' + symbols.join('');  // For debugging only
        this.gameObject.x = x;
        this.gameObject.y = y;

        // Create and add symbols
        this.symbols = [];
        for (let i = 0; i < symbols.length; i++) {
            var symbol = new Rsymbol(game, symbols[i], 'symbol' + symbols[i].toUpperCase(), i);
            this.gameObject.addChild(symbol.gameObject);
            symbol.reel = this;
            symbol.gameObject.x = 0;
            symbol.gameObject.y = y + symbol.gameObject.texture.height * i;  // @todo use global setting
            this.symbols.push(symbol);
        }
    }

    /**
     * Spins the reel for a given number of steps.
     * @todo make spinning speed externally controllable
     * @todo spinning a promise
     *
     * @param  {Number}  steps  How many symbols to skip during spinning
     */
    spin (steps) {

        for (let i = 0; i < steps; i++) {
            // @todo Advance tweening target

            // Advance offset and wrap around if necessary
            this.offset++;
            if (this.offset > this.symbols.length) {
                this.offset = 0;
            }
        }
    }
}

export default Reel;