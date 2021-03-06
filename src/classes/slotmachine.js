// Because https://www.npmjs.com/package/phaser#browserify--cjs
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

import Reel from './reel';

/**
 * Represents the overall slot machine setup.
 * 
 * @requires  reel
 */
class Slotmachine {

    /**
     * Creates a new slot machine instance.
     *
     * @param  {HTMLElement}  scene  DOM element to place game scene into
     * @param  {Number}       reelCount  Number of reels to add
     */
    constructor (scene, reelCount) {

        // Set properties
        const this1 = this;
        this.symbolWidth = 216;
        this.symbolHeight = 144;
        this.symbolsShown = 3;
        this.reelTemplate = ['e', 'e', 'e', 'e', 'r', 'r', 'r', 'r', 'h', 'n', 'n', 'o', 'o', 'o', 's', 's', 'u', 'u'];
        this.reelCount = reelCount;
        this.reelWidth = this.symbolWidth;
        this.reelHeight = this.symbolHeight * this.symbolsShown;
        this.winningMatches = [

            // Words and acronyms
            'eon', 'err', 'nee', 'nor', 'nun', 'one', 'ore', 'our', 'roe', 'rue', 'run', 'see', 'son', 'uss',
            'sos', 'sue', 'sun', 'urn', 'use', 'usr', 'ron', 'seo', 'uno', 'eur', 'ros', 'rus', 'sor', 'nes',
            'noo', 'nou', 'soo', 'neo', 'rss', 'ssn', 'eos', 'oss', 'snu', 'ero', 'eru', 'suo', 'sur', 'nos', 'orr', 'res',
            'roo', 'esr', 'srs', 'usn', 'unn', 'rur', 'sen', 'ren', 'sno', 'sse', 'neu', 'sou', 'oun', 'urs', 'uro', 'nuo',

            // Words with [heart] working as 'o' or other letters
            'hne', 'shn', 'shs', 'rhn', 'seh', 'shr', 'rhs', 'ush', 'neh', 'hss', 'enh', 'hur', 'nsh', 'ssh', 'eho',

            // Words with heart as a delimiter
            'nho', 'sho',

            // Pictographic and semi-pictographic sequences
            // Faces
            'oeo', 'oro', 'ono', 'oso',
            'eoe', 'ror', 'uou',
            'ehe', 'rhr', 'nhn', 'shs',
            'hrh',
            'oou', 'uoo',
            'ere', 'ene',
            'ooh', 'hoo',
            'oor', 'roo',
            'eoo', 'ooe',
            'ueu',
            'oos', 'soo',
            // [Heart] as word/notion of love and similar
            'hhu', 'uhh', 'hon', 'roh', 'noh', 'urh', 'hen', 'hes', 'hne', 'hno', 'hos',
            'hso', 'hus', 'heu', 'orh', 'soh', 'hor'
        ];
        this.superWinningMatches = [

            // Three in a row
            'eee', 'rrr', 'hhh', 'nnn', 'ooo', 'sss', 'uuu',

            // Words and acronyms
            'non', 'reo',

            // Words with [heart] working as an 'o'
            'nhn', 'erh',

            // Pictographic and semi-pictographic sequences
            // Faces
            'ouo',
            'oho',
            'heh', 'hoh', 'hnh', 'hsh', 'huh',
            // [Heart] as word/notion of love and similar
            'hse', 'hun', 'rhe'
        ];

        // Setup asset loader
        const preload = () => {
            this1.assets = this1.loadAssets([
                './images/symbolE.png',
                './images/symbolR.png',
                './images/symbolH.png',
                './images/symbolN.png',
                './images/symbolO.png',
                './images/symbolS.png',
                './images/symbolU.png'
            ], 'spritesheet', 216, 144);
        };

        // Start the game
        this.game = new Phaser.Game(scene.clientWidth, scene.clientHeight, Phaser.AUTO, scene, {
            preload: preload,
            create: this.setupWorld.bind(this),
            update: this.mainLoop.bind(this)
        });
    }

    /**
     * Runs a slot machine round
     * @todo there be horror
     */
    pull () {

        // Don't do anything if already running
        if (this.running) {
            return;
        }

        // Forbid pulling, disable the button and cleanup previous tweens
        this.running = true;
        document.querySelector('[data-action="start-game"]').setAttribute('disabled', 'disabled');
        this.game.tweens.removeAll();
        var stoppedReelsCount = 0;
        var currentSymbols = [];
        var currentSymbolNames = [];

        // Run at different speeds for different reels
        this.reels.forEach((reel) => {

            // Setup speeds, number of steps and the all-reels-stopped condition
            var speedRandom = Math.random() * 100;
            var stepsCount = Math.floor(Math.random() * 58) + 1;

            reel.onRunComplete = new Phaser.Signal();
            reel.onRunComplete.add(() => {

                // Advance and check if all reels are stopped
                stoppedReelsCount++;
                if (stoppedReelsCount === this.reels.length) {

                    // Collect symbols currently at the central row
                    this.reels.forEach((reel) => {
                        var symbolOffset = reel.offset % reel.symbols.length;
                        var dupliSymbols = reel.symbols.concat(reel.symbols);
                        var originalSymbolIndex = reel.symbols.length + 1;
                        var currentSymbol = dupliSymbols[originalSymbolIndex - symbolOffset];
                        currentSymbols.push(currentSymbol);
                        currentSymbolNames.push(currentSymbol.name);
                    });

                    // Determine if the player won, and the win category
                    var winType = 'none';
                    if (this.winningMatches.indexOf(currentSymbolNames.join('')) !== -1) {
                        winType = 'regular';
                    } else if (this.superWinningMatches.indexOf(currentSymbolNames.join('')) !== -1) {
                        winType = 'super';
                    }

                    // Play the winning animations if won; loop if super win
                    if (winType !== 'none') {
                        console.log('You may have won a million dollars!');
                        currentSymbols.forEach((symbol) => {
                            symbol.gameObject.animations
                                .add('win')
                                .play(6, (winType === 'super'))
                                .onComplete.add(() => {
                                    symbol.gameObject.animations.getAnimation('win').stop(true);
                                });
                        });
                    } else {
                        console.log('meh.');
                    }

                    // Restore pulling functionality
                    this.running = false;
                    document.querySelector('[data-action="start-game"]').removeAttribute('disabled');
                }
            }, this);

            // Tween-move each symbol separately in symbol height steps
            reel.symbols.forEach((symbol) => {

                // Remove previous animations if any
                symbol.gameObject.animations.stop(null, true);

                var stepNum = 0;

                // Performs one movement step between two valid symbol positions
                var stepOnce = (symbol) => {

                    // Wrap and setup the tween
                    this.game.world.wrap(symbol.gameObject);
                    var step = this.game.add.tween(symbol.gameObject);
                    step.to({ y: symbol.gameObject.y + this.symbolHeight }, 20 + speedRandom, Phaser.Easing.Linear.None);

                    // If not stopping yet
                    if (stepNum < stepsCount) {

                        // Run the tween and queue another one
                        step.onComplete.addOnce(stepOnce.bind(this, symbol), this);
                        step.start();
                        stepNum++;

                        // Advance corresponding reel's offset count per 0th element
                        if (symbol.offset === 0) {
                            symbol.reel.offset++;
                        }

                        // Otherwise stop
                    } else {
                        step.stop();
                        if (symbol.offset === 0) {
                            reel.onRunComplete.dispatch();
                        }
                    }
                };

                stepOnce(symbol);
            });
        });
    }

    /**
     * Shuffles array with a naive version of Fisher–Yates shuffle.
     *
     * @param   {Array}  array  Array to shuffle
     * @return  {Array}         Shuffled array
     */
    static shuffleArray (array) {

        // Copy the array and shuffle by exchangin a random element with the last
        var newArray = array.slice();

        for (let i = newArray.length - 1; i >= 1; i--) {

            let rndIndex = Math.round(Math.random() * i);
            let cache = newArray[rndIndex];
            newArray[rndIndex] = newArray[i];
            newArray[i] = cache;
        }

        return newArray;
    };


    /**
     * Loads images and returns asset access keys.
     *
     * @param    assetPaths  Array of relative asset path strings
     * @param    loaderFunc  Name of the Phaser load function to use on assets
     * @param    loaderArgs  The rest of the arguments are passed on to loader function
     * @returns  {Array}     Array of asset keys for access
     */
    loadAssets (assetPaths, loaderFunc, ...loaderArgs) {

        // Load assets with a given Phaser loader function, pushing asset keys to an array along the way, and return the array
        var assetKeys = [];
        for (let i = 0; i < assetPaths.length; i++) {
            let assetName = assetPaths[i].split('/').slice(-1)[0].replace(/[.][\w\d_-]+$/, '');  // Take last from path and remove '.ext'
            this.game.load[loaderFunc](assetName, assetPaths[i], ...loaderArgs);
            assetKeys.push(assetName);
        }
        return assetKeys;
    }

    /**
     * Sets up the game world
     */
    setupWorld () {

        // Setup physics & animations
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.world.setBounds(
            0,
            -this.symbolHeight,
            this.symbolWidth * this.symbolsShown,
            this.symbolHeight * (this.reelTemplate.length - 2 + 1)
        );
        this.game.tweens.frameBased = true;

        // Create reels
        this.reels = [];

        for (let i = 0; i < this.reelCount; i++) {
            var reel = new Reel(this.game, Slotmachine.shuffleArray(this.reelTemplate), 0, this.reelWidth * i, 0);
            this.reels.push(reel);
        }
    }

    /**
     * Main game loop
     */
    mainLoop () {

        // Wrap reel symbols
        this.reels.forEach((reel) => {
            reel.symbols.forEach((symbol) => {
                this.game.world.wrap(symbol.gameObject);
            });
        });
    }
}

export default Slotmachine;