

let hideHUDInterval2 = setInterval(() => {
	if (typeof (vueApp) === "undefined") return;
	clearInterval(hideHUDInterval2);

	let oldLocFunc2 = vueApp.setLocData;
	vueApp.setLocData = (languageCode, newLocData) => {
		oldLocFunc2(languageCode, newLocData);
		vueApp.loc.keybindings_x = "X";
	}

	vueApp.loc.keybindings_x = "X";
	vueApp.settingsUi.controls.keyboard.spectate.push({ id: 'xxx', locKey: 'keybindings_x', value: 'X' });
}, 250);
