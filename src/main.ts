/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" /> 

window.onload = () => {
	const preload = () => {
		game.load.image("logo", "img/phaser.png");
	}

	const create = () => {
		const logo = game.add.sprite(game.world.centerX, game.world.centerY, "logo");
		logo.anchor.setTo(0.5, 0.5);
	}
	const game = new Phaser.Game("100%", "100%", Phaser.AUTO, "", { preload: preload, create: create });
};