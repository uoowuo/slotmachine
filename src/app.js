/**
 * Slotmachine, v1.1.0
 *
 * Description: A simple slot machine.
 */

import Slotmachine from './classes/slotmachine';

  ///////////////////////
 // Application start //
///////////////////////
(function (globals) {
    'use strict';

    // Start the application
    document.addEventListener('DOMContentLoaded', function (event) {

        const scene = document.querySelector('#game-scene');

        // Start a new slot machine
        // To access application state for debugging, start at the window.slotmachine top level object
        globals.slotmachine = new Slotmachine(scene, 3);

        // Run the slot machine on start button press
        document.querySelector('[data-action="start-game"]').addEventListener('click', function () {
            slotmachine.pull();
        });
    });

}(self));