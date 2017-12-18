const { Phaser } = require("phaser");

window.onload = () => {

	//  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
	//  Although it will work fine with this tutorial, it"s almost certainly not the most current version.
	//  Be sure to replace it with an updated version before you start experimenting with adding your own code.
	const preload = () => {
		game.load.image("logo", "img/phaser.png");
	}

	const create = () => {
		const logo = game.add.sprite(game.world.centerX, game.world.centerY, "logo");
		logo.anchor.setTo(0.5, 0.5);
	}
	const game = new Phaser.Game("100%", "100%", Phaser.AUTO, "", { preload: preload, create: create });
};