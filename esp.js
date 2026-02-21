//Usage: ESP boxes only
(function () {

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    let randomDebugKey = `debug${randomInt(9,999)}`;

    let crackedShell = typeof $WEBSOCKET !== 'undefined';

    let originalReplace = String.prototype.replace;
    String.prototype.originalReplace = function() {
        return originalReplace.apply(this, arguments);
    };

    let enableESP = false;

    document.addEventListener('keydown', function(event) {
        if (event.key === 't' || event.key === 'T') {
            enableESP = !enableESP;
        };
    }, true);

    const useXHRMethod = false;
    if (useXHRMethod) {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRGetResponse = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
        let shellshockjs;
        XMLHttpRequest.prototype.open = function(...args) {
            const url = args[1];
            if (url && url.includes("js/shellshock.js")) shellshockjs = this;
            originalXHROpen.apply(this, args);
        };
        Object.defineProperty(XMLHttpRequest.prototype, 'response', {
            get: function() {
                if (this === shellshockjs) return applyLibertyMutual(originalXHRGetResponse.get.call(this));
                return originalXHRGetResponse.get.call(this);
            }
        });
    };

    let _apc = HTMLElement.prototype.appendChild;
    let shellshock_og = null;

    HTMLElement.prototype.appendChild = function(node) {
        if (node.tagName === 'SCRIPT' && node.innerHTML && node.innerHTML.startsWith('(()=>{')) {
            shellshock_og = node.innerHTML;
            node.innerHTML = applyLibertyMutual(node.innerHTML);
        };
        return _apc.call(this, node);
    };

    const proto = window.HTMLScriptElement.prototype;
    const existing = Object.getOwnPropertyDescriptor(proto, "textContent");
    const original = existing || Object.getOwnPropertyDescriptor(window.Node.prototype, "textContent");

    Object.defineProperty(proto, "textContent", {
        get: function () {
            let textContent = original.get.call(this);
            if (textContent && textContent.startsWith('(()=>{')) {
                return shellshock_og;
            } else {
                return textContent;
            };
        },
        set: original.set,
        configurable: true,
        enumerable: true
    });

    //VAR STUFF
    let F = [];
    let H = {};
    let functionNames = [];
    let ESPArray = [];

    const getScrambled = function() { return Array.from({length: 10}, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('') };
    const createAnonFunction = function(name, func) {
        const funcName = getScrambled();
        window[funcName] = func;
        F[name] = window[funcName];
        functionNames[name] = funcName;
    };
    const findKeyWithProperty = function(obj, propertyToFind) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === propertyToFind) {
                    return [key];
                } else if (
                    typeof obj[key] === 'object' &&
                    obj[key] !== null &&
                    obj[key].hasOwnProperty(propertyToFind)
                ) {
                    return key;
                };
            };
        };
        return null;
    };
    const fetchTextContent = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send();
        if (xhr.status === 200) {
            return xhr.responseText;
        } else {
            return null;
        };
    };

    const applyLibertyMutual = function(js) {
        let clientKeys;
        const onlineClientKeys = fetchTextContent("https://raw.githubusercontent.com/StateFarmNetwork/client-keys/main/libertymutual_latest.json");

        if (onlineClientKeys == "value_undefined" || onlineClientKeys == null) {
            let userInput = prompt('Valid keys could not be retrieved online. Enter keys if you have them. Join the StateFarm Network Discord server to generate keys! https://discord.gg/HYJG3jXVJF', '');
            if (userInput !== null && userInput !== '') {
                alert('Aight, let\'s try this. If it is invalid, it will just crash.');
                clientKeys = JSON.parse(userInput);
            } else {
                alert('You did not enter anything, this is gonna crash lmao.');
            };
        } else {
            clientKeys = JSON.parse(onlineClientKeys);
        };

        H = clientKeys.vars;

        let injectionString = "";

        const modifyJS = function(find, replace) {
            let oldJS = js;
            js = js.originalReplace(find, replace);
            if (oldJS !== js) {
            } else {
            };
        };
        const variableNameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        for (let name in H) {
            const deobf = H[name];
            if (variableNameRegex.test(deobf)) {
                injectionString = `${injectionString}${name}: (() => { try { return ${deobf}; } catch (error) { return "value_undefined"; } })(),`;
            } else {
                alert("WARNING! Non-variable characters in keys. Report to LibertyMutual devs.");
                const crashplease = "balls";
                crashplease = "balls2";
            };
        };

        modifyJS(H.SCENE + '.render', `window["${functionNames.retrieveFunctions}"]({${injectionString}BABYLON: (() => { try { return BABYLON; } catch(error) { return null; } })(),},true)||${H.SCENE}.render`);
        modifyJS(`{if(${H.CULL})`, `{if(true)`);
        modifyJS("Not playing in iframe", "LIBERTYMUTUAL ACTIVE!");
        return js;
    };

    const resolveBABYLON = () => {
        if (window.BABYLON?.Vector3) return true;
        if (!ss.SCENE) return false;

        const scene = ss.SCENE;

        if (ss.BABYLON) {
            window.BABYLON = ss.BABYLON;
            return true;
        }

        const Vector3 = scene.meshes?.[0]?.position?.constructor
                     || scene.cameras?.[0]?.position?.constructor;

        const Color3 = scene.lights?.[0]?.diffuse?.constructor;
        const Color4 = scene.clearColor?.constructor;

        let MeshBuilder = null;
        for (const key of Object.keys(window)) {
            try {
                const val = window[key];
                if (val && typeof val.CreateLines === 'function' && typeof val.CreateLineSystem === 'function') {
                    MeshBuilder = val;
                    break;
                }
            } catch(e) {}
        }

        if (!MeshBuilder) {
            for (const key of Object.keys(window)) {
                try {
                    const val = window[key];
                    if (val && typeof val === 'object') {
                        for (const subkey of Object.keys(val)) {
                            try {
                                if (val[subkey]?.CreateLines && val[subkey]?.CreateLineSystem) {
                                    MeshBuilder = val[subkey];
                                    break;
                                }
                            } catch(e) {}
                        }
                    }
                    if (MeshBuilder) break;
                } catch(e) {}
            }
        }

        if (Vector3 && MeshBuilder) {
            window.BABYLON = { Vector3, Color3: Color3 || Vector3, Color4: Color4 || Vector3, MeshBuilder };
            return true;
        }

        return false;
    };

    let ss = {};
    createAnonFunction("retrieveFunctions", function(vars) {
        Object.assign(ss, vars);
        resolveBABYLON();
        F.LIBERTYMUTUAL();
    });

    createAnonFunction("LIBERTYMUTUAL", function() {
        if (!window.BABYLON?.Vector3) return;

        ss.PLAYERS.forEach(PLAYER => {
            if (PLAYER.hasOwnProperty("ws")) ss.MYPLAYER = PLAYER;
        });

        H.actor = findKeyWithProperty(ss.MYPLAYER, H.mesh);

        let CROSSHAIRS = new window.BABYLON.Vector3();
        CROSSHAIRS.copyFrom(ss.MYPLAYER[H.actor][H.mesh].position);
        CROSSHAIRS.y += 0.4;
        const forwardOffset = -5;
        const yaw = ss.MYPLAYER[H.yaw];
        const pitch = -ss.MYPLAYER[H.pitch];
        CROSSHAIRS.x += Math.sin(yaw) * Math.cos(pitch) * forwardOffset;
        CROSSHAIRS.y += Math.sin(pitch) * forwardOffset;
        CROSSHAIRS.z += Math.cos(yaw) * Math.cos(pitch) * forwardOffset;

        const timecode = Date.now();
        ss.PLAYERS.forEach(PLAYER => {
            if (PLAYER) {
                PLAYER.timecode = timecode;
                if ((PLAYER !== ss.MYPLAYER) && ((ss.MYPLAYER.team == 0) || (PLAYER.team !== ss.MYPLAYER.team))) {
                    if (!PLAYER.generatedESP) {
                        const boxSize = { width: 0.4, height: 0.65, depth: 0.4 };
                        const vertices = [
                            new window.BABYLON.Vector3(-boxSize.width / 2, 0, -boxSize.depth / 2),
                            new window.BABYLON.Vector3(boxSize.width / 2, 0, -boxSize.depth / 2),
                            new window.BABYLON.Vector3(boxSize.width / 2, boxSize.height, -boxSize.depth / 2),
                            new window.BABYLON.Vector3(-boxSize.width / 2, boxSize.height, -boxSize.depth / 2),
                            new window.BABYLON.Vector3(-boxSize.width / 2, 0, boxSize.depth / 2),
                            new window.BABYLON.Vector3(boxSize.width / 2, 0, boxSize.depth / 2),
                            new window.BABYLON.Vector3(boxSize.width / 2, boxSize.height, boxSize.depth / 2),
                            new window.BABYLON.Vector3(-boxSize.width / 2, boxSize.height, boxSize.depth / 2),
                        ];
                        const lines = [];
                        for (let i = 0; i < 4; i++) {
                            lines.push([vertices[i], vertices[(i + 1) % 4]]);
                            lines.push([vertices[i + 4], vertices[(i + 1) % 4 + 4]]);
                            lines.push([vertices[i], vertices[i + 4]]);
                        };
                        const box = window.BABYLON.MeshBuilder.CreateLineSystem(getScrambled(), { lines }, ss.SCENE);
                        box.color = new window.BABYLON.Color3(1, 1, 1);
                        box[H.renderingGroupId] = 1;
                        box.parent = PLAYER[H.actor][H.mesh];
                        PLAYER.box = box;
                        PLAYER.generatedESP = true;
                        ESPArray.push([box, PLAYER]);
                    };
                    PLAYER.box.visibility = enableESP;                };
            };
        });

        for (let i = 0; i < ESPArray.length; i++) {
            if (ESPArray[i][1] && ESPArray[i][1].timecode == timecode) {
            } else {
                ESPArray[i][0].dispose();
                ESPArray.splice(i, 1);
            };
        };

        if (window[randomDebugKey]) {
            window.globalSS = {
                ss, F, H, functionNames, BABYLON: window.BABYLON, ESPArray, timecode
            };
        };
    });
})();
