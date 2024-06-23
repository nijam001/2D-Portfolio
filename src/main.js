import { dialogueData, scaleFactor } from "./constant";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;

    const map = k.add([
        k.sprite("map"),
        k.pos(0, 0),
        k.scale(scaleFactor),
    ]);

    const player = k.add([
        k.sprite("spritesheet", {
            anim: "idle-down",
        }),
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player",
    ]);

    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0, 0), boundary.width, boundary.height),
                    }),
                    k.body({
                        isStatic: true, // make sure the player would not be able to move over the boundary basically a wall
                    }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(dialogueData[boundary.name], () => {
                             player.isInDialogue = false 
                            });
                    });
                }
            }
        } else if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
                if (entity.name === "" || entity.name === "player") {
                    // Debugging output
                    console.log("Player spawn point:", entity.x, entity.y);
                    console.log("Map position:", map.pos);
                    console.log("Scale factor:", scaleFactor);
                    
                    player.pos = k.vec2(
                        entity.x * scaleFactor,
                        entity.y * scaleFactor
                    );

                    // Debugging output
                    console.log("Player position:", player.pos);
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    });

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });

    // Move
    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) {
            return;
        }
        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up") {
            player.play("walk-up");
            player.direction = "up";
            return;
        }

        if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down") {
            player.play("walk-down");
            player.direction = "down";
            return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
            player.flipX = false;
            if (player.curAnim() !== "walk-side") {
                player.play("walk-side");
                player.direction = "right";
                return;
            }
        }

        if (Math.abs(mouseAngle) < lowerBound) {
            player.flipX = true;
            if (player.curAnim() !== "walk-side") {
                player.play("walk-side");
                player.direction = "left";
                return;
            }
        }
    });

    // Idle
    k.onMouseRelease(() => {
        if (player.direction === "down") {
            player.play("idle-down");
        } else if (player.direction === "up") {
            player.play("idle-up");
        } else {
            player.play("idle-side");
        }
    });
});

k.go("main");
