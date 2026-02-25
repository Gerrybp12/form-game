"use client";

import { useEffect, useRef, useState } from "react";
import CreateFormIntroModal from "./CreateFormIntroModal";
import CreateFormModal from "./CreateFormModal";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ManageFormsModal from "./ManageFormsModal";
import PublicFormsModal from "./PublicFormsModal";

type Plaza = {
  id: number;
  rect: { x: number; y: number; w: number; h: number }; // world coords
};



export default function Game() {
  const { user, loading } = useCurrentUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  // simpan scene buat enable/disable keyboard Phaser saat modal open
  const sceneRef = useRef<any>(null);

  // modal states
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isYourFormOpen, setIsYourFormOpen] = useState(false);
  const [isPublicFormsOpen, setIsPublicFormsOpen] = useState(false);

  // ref untuk logic di Phaser update()
  const modalOpenRef = useRef(false);

  // modalOpenRef harus ngikutin intro/form (bukan isModalOpen)
  useEffect(() => {
    modalOpenRef.current = isIntroOpen || isFormOpen || isYourFormOpen || isPublicFormsOpen;
  }, [isIntroOpen, isFormOpen, isYourFormOpen, isPublicFormsOpen]);

  // ESC untuk nutup modal manapun
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsIntroOpen(false);
        setIsFormOpen(false);
        setIsYourFormOpen(false);
        setIsPublicFormsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // IMPORTANT: disable keyboard Phaser saat modal open biar WASD bisa ngetik normal
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const modalOpen = isIntroOpen || isFormOpen || isYourFormOpen || isPublicFormsOpen;

    scene.input.keyboard.enabled = !modalOpen;

    // biar ga "nyangkut" setelah modal ditutup
    if (!modalOpen) {
      scene.input.keyboard.resetKeys();
    }
  }, [isIntroOpen, isFormOpen, isYourFormOpen, isPublicFormsOpen]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let destroyed = false;

    const start = async () => {
      const Phaser = (await import("phaser")).default;

      class MainScene extends Phaser.Scene {
        player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        keys!: {
          W: Phaser.Input.Keyboard.Key;
          A: Phaser.Input.Keyboard.Key;
          S: Phaser.Input.Keyboard.Key;
          D: Phaser.Input.Keyboard.Key;
        };
        spaceKey!: Phaser.Input.Keyboard.Key;

        wallLayer!: Phaser.Physics.Arcade.StaticGroup;

        TILE = 32;
        SPEED = 220;

        lastDir: "down" | "up" | "side" = "down";

        // 1 tile wall yang pasti kelihatan (row 1 col 5) => 21
        WALL_FRAME = 21;

        plazas: Plaza[] = [];
        hintText!: Phaser.GameObjects.Text;
        lastHintPlaza: number | null = null;

        preload() {
          this.load.spritesheet("player", "/sprites/player.png", {
            frameWidth: 256,
            frameHeight: 512,
          });

          this.load.spritesheet("grass", "/tiles/grass.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
          this.load.spritesheet("stone", "/tiles/stone_ground.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
          this.load.spritesheet("wall", "/tiles/wall.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
          this.load.spritesheet("plant", "/tiles/plant.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
          this.load.spritesheet("shadow", "/tiles/shadow.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
        }

        create() {
          // expose scene ke React
          sceneRef.current = this;

          // kamera FIXED
          this.cameras.main.scrollX = 0;
          this.cameras.main.scrollY = 0;

          // anim player: 0-3 down, 4-7 side, 8-11 up
          this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("player", {
              start: 0,
              end: 3,
            }),
            frameRate: 8,
            repeat: -1,
          });
          this.anims.create({
            key: "walk-side",
            frames: this.anims.generateFrameNumbers("player", {
              start: 4,
              end: 7,
            }),
            frameRate: 8,
            repeat: -1,
          });
          this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("player", {
              start: 8,
              end: 11,
            }),
            frameRate: 8,
            repeat: -1,
          });

          // input
          this.cursors = this.input.keyboard!.createCursorKeys();
          this.keys = this.input.keyboard!.addKeys("W,A,S,D") as any;
          this.spaceKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
          );

          // build level
          this.buildLevelToViewport();

          // UI hint (di layar)
          this.hintText = this.add
            .text(16, 16, "", {
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
              fontSize: "16px",
              color: "#ffffff",
              backgroundColor: "rgba(0,0,0,0.55)",
              padding: { left: 10, right: 10, top: 6, bottom: 6 },
            })
            .setDepth(9999)
            .setScrollFactor(0)
            .setVisible(false);

          // resize: restart supaya rebuild pas ukuran layar berubah
          this.scale.on("resize", () => {
            this.scene.restart();
          });

          this.game.events.on(Phaser.Core.Events.BLUR, () => {
            if (this.player) this.player.setVelocity(0, 0);
          });
        }

        clamp(n: number, min: number, max: number) {
          return Math.max(min, Math.min(max, n));
        }

        plazaRectFromTiles(tx0: number, ty0: number, tw: number, th: number) {
          const t = this.TILE;
          return { x: tx0 * t, y: ty0 * t, w: tw * t, h: th * t };
        }

        isPointInRect(
          px: number,
          py: number,
          r: { x: number; y: number; w: number; h: number },
        ) {
          return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
        }

        createPlazaLabel(plaza: Plaza, text: string) {
          const cx = plaza.rect.x + plaza.rect.w / 2;
          const cy = plaza.rect.y + plaza.rect.h / 2;

          // label agak ke atas supaya tidak nutup player
          const y = cy - 20;

          const label = this.add.text(cx, y, text, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "18px",
            fontStyle: "bold",
            color: "#f7ead0", // parchment-ish
            stroke: "#2b1a0b",
            strokeThickness: 5,
            shadow: {
              offsetX: 2,
              offsetY: 2,
              color: "#000000",
              blur: 2,
              fill: true,
            },
            backgroundColor: "rgba(60, 35, 12, 0.55)", // dark leather
            padding: { left: 10, right: 10, top: 6, bottom: 6 },
          });

          label.setOrigin(0.5, 0.5);
          label.setDepth(-5); // di atas lantai, tapi di bawah hint UI
          // kalau mau label tidak ketutupan apa-apa, naikkan jadi 5 atau 10

          return label;
        }

        buildLevelToViewport() {
          const tile = this.TILE;

          const vw = Math.floor(this.scale.gameSize.width);
          const vh = Math.floor(this.scale.gameSize.height);

          const tilesX = Math.max(18, Math.floor(vw / tile));
          const tilesY = Math.max(12, Math.floor(vh / tile));

          const worldW = tilesX * tile;
          const worldH = tilesY * tile;

          // bounds = layar
          this.physics.world.setBounds(0, 0, worldW, worldH);
          this.cameras.main.setBounds(0, 0, worldW, worldH);
          this.cameras.main.setSize(vw, vh);

          const rand = (a: number, b: number) => Phaser.Math.Between(a, b);

          // reset plaza list
          this.plazas = [];

          // ===== FLOOR grass =====
          for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
              const px = x * tile + tile / 2;
              const py = y * tile + tile / 2;
              this.add.image(px, py, "grass", rand(0, 7)).setDepth(-30);
            }
          }

          // ===== PLAZA SIZE (auto) =====
          const plazaW = this.clamp(Math.floor(tilesX * 0.16), 6, 11);
          const plazaH = this.clamp(Math.floor(tilesY * 0.22), 5, 10);

          // margin dari tepi: 1 tile wall + 1 tile ruang
          const margin = 2;

          // bagi space jadi 4 gap rata
          const distributeGaps = (available: number) => {
            const base = Math.floor(available / 4);
            let rem = available - base * 4;
            const gaps = [base, base, base, base];
            for (let i = 0; i < 4 && rem > 0; i++, rem--) gaps[i] += 1;
            return gaps;
          };

          const canHorizontal = tilesX - 2 * margin - 3 * plazaW >= 4;
          const canVertical = tilesY - 2 * margin - 3 * plazaH >= 4;

          const plazasTile: {
            id: number;
            x0: number;
            y0: number;
            w: number;
            h: number;
          }[] = [];

          if (canHorizontal) {
            const available = tilesX - 2 * margin - 3 * plazaW;
            const gaps = distributeGaps(available);
            const g0 = gaps[0],
              g1 = gaps[1],
              g2 = gaps[2];

            const y0 = Math.floor((tilesY - plazaH) / 2);

            const x1 = margin + g0;
            const x2 = x1 + plazaW + g1;
            const x3 = x2 + plazaW + g2;

            plazasTile.push(
              { id: 1, x0: x1, y0, w: plazaW, h: plazaH },
              { id: 2, x0: x2, y0, w: plazaW, h: plazaH },
              { id: 3, x0: x3, y0, w: plazaW, h: plazaH },
            );
          } else if (canVertical) {
            const available = tilesY - 2 * margin - 3 * plazaH;
            const gaps = distributeGaps(available);
            const g0 = gaps[0],
              g1 = gaps[1],
              g2 = gaps[2];

            const x0 = Math.floor((tilesX - plazaW) / 2);

            const y1 = margin + g0;
            const y2 = y1 + plazaH + g1;
            const y3 = y2 + plazaH + g2;

            plazasTile.push(
              { id: 1, x0, y0: y1, w: plazaW, h: plazaH },
              { id: 2, x0, y0: y2, w: plazaW, h: plazaH },
              { id: 3, x0, y0: y3, w: plazaW, h: plazaH },
            );
          } else {
            const w = this.clamp(plazaW, 5, 8);
            const h = this.clamp(plazaH, 4, 6);
            const x0 = Math.floor((tilesX - w) / 2);
            plazasTile.push(
              { id: 1, x0, y0: 2, w, h },
              { id: 2, x0, y0: Math.floor((tilesY - h) / 2), w, h },
              { id: 3, x0, y0: tilesY - h - 2, w, h },
            );
          }

          // ===== render plaza stone + simpan rect =====
          for (const p of plazasTile) {
            for (let y = p.y0; y < p.y0 + p.h; y++) {
              for (let x = p.x0; x < p.x0 + p.w; x++) {
                const px = x * tile + tile / 2;
                const py = y * tile + tile / 2;
                this.add.image(px, py, "stone", rand(0, 5)).setDepth(-25);
              }
            }
            this.plazas.push({
              id: p.id,
              rect: this.plazaRectFromTiles(p.x0, p.y0, p.w, p.h),
            });
          }

          // ===== Plaza Labels (medieval) =====
          const p1 = this.plazas.find((p) => p.id === 1);
          const p2 = this.plazas.find((p) => p.id === 2);
          const p3 = this.plazas.find((p) => p.id === 3);

          if (p1) this.createPlazaLabel(p1, "Your Forms");
          if (p2) this.createPlazaLabel(p2, "Create Form");
          if (p3) this.createPlazaLabel(p3, "Public Forms");

          // ===== WALL BORDER =====
          this.wallLayer = this.physics.add.staticGroup();

          for (let x = 0; x < tilesX; x++) {
            this.spawnWall(x, 0);
            this.spawnWall(x, tilesY - 1);
          }
          for (let y = 1; y < tilesY - 1; y++) {
            this.spawnWall(0, y);
            this.spawnWall(tilesX - 1, y);
          }

          // ===== plants (hindari plaza + hindari tembok) =====
          const plantCount = Math.floor(tilesX * tilesY * 0.02);
          for (let i = 0; i < plantCount; i++) {
            const tx = rand(2, tilesX - 3);
            const ty = rand(2, tilesY - 3);

            const px = tx * tile + tile / 2;
            const py = ty * tile + tile / 2;

            let insidePlaza = false;
            for (const p of this.plazas) {
              if (this.isPointInRect(px, py, p.rect)) {
                insidePlaza = true;
                break;
              }
            }
            if (insidePlaza) continue;

            const plantFrame = rand(0, 10);
            this.add.image(px, py - 8, "plant", plantFrame).setDepth(-15);

            const sh = this.add.image(px, py + 10, "shadow", 0);
            sh.setDepth(-16);
            sh.setAlpha(0.55);
          }

          // ===== player spawn di plaza #2 =====
          const plaza2 = this.plazas.find((p) => p.id === 2) ?? this.plazas[0];
          const spawnX = plaza2.rect.x + plaza2.rect.w / 2;
          const spawnY = plaza2.rect.y + plaza2.rect.h / 2;

          this.player = this.physics.add.sprite(spawnX, spawnY, "player", 0);
          this.player.setCollideWorldBounds(true);

          this.player.setScale(0.25);

          this.player.body.setSize(80, 95);
          this.player.body.setOffset(256 / 2 - 40, 512 - 120);

          this.physics.add.collider(this.player, this.wallLayer);
        }

        spawnWall(tx: number, ty: number) {
          const tile = this.TILE;
          const px = tx * tile + tile / 2;
          const py = ty * tile + tile / 2;

          this.add.image(px, py, "wall", this.WALL_FRAME).setDepth(-10);

          const body = this.wallLayer.create(px, py, "wall", this.WALL_FRAME);
          body.refreshBody();
          body.setVisible(false);
        }

        playIdle() {
          this.player.anims.stop();

          if (this.lastDir === "down") {
            this.player.setFlipX(false);
            this.player.setFrame(0);
          } else if (this.lastDir === "up") {
            this.player.setFlipX(false);
            this.player.setFrame(8);
          } else {
            this.player.setFrame(4);
          }
        }

        getCurrentPlazaId(): number | null {
          const footX = this.player.x;
          const footY = this.player.y + 20;

          for (const p of this.plazas) {
            if (this.isPointInRect(footX, footY, p.rect)) return p.id;
          }
          return null;
        }

        updateHint(plazaId: number | null) {
          if (plazaId === this.lastHintPlaza) return;
          this.lastHintPlaza = plazaId;

          if (plazaId) {
            this.hintText.setText(`Press SPACE to interact (Plaza ${plazaId})`);
            this.hintText.setVisible(true);
          } else {
            this.hintText.setVisible(false);
          }
        }

        update() {
          if (!this.player) return;

          // kalau modal open, stop movement & skip movement logic
          if (modalOpenRef.current) {
            this.player.setVelocity(0, 0);
            this.playIdle();
            return;
          }

          const plazaId = this.getCurrentPlazaId();
          this.updateHint(plazaId);

          // interaction
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (plazaId === 2) {
              setIsIntroOpen(true);
            } else if (plazaId === 1) {
              console.log(setIsYourFormOpen(true));
            } else if (plazaId === 3) {
              console.log(setIsPublicFormsOpen(true));
            } else if (plazaId) {
              console.log(`Interact: Plaza ${plazaId}`);
            } else {
              console.log("Interact: (not on plaza)");
            }
          }

          // movement
          const left = this.cursors.left.isDown || this.keys.A.isDown;
          const right = this.cursors.right.isDown || this.keys.D.isDown;
          const up = this.cursors.up.isDown || this.keys.W.isDown;
          const down = this.cursors.down.isDown || this.keys.S.isDown;

          let vx = 0;
          let vy = 0;

          if (left) vx -= 1;
          if (right) vx += 1;
          if (up) vy -= 1;
          if (down) vy += 1;

          if (vx === 0 && vy === 0) {
            this.player.setVelocity(0, 0);
            this.playIdle();
            return;
          }

          const len = Math.hypot(vx, vy);
          vx /= len;
          vy /= len;

          this.player.setVelocity(vx * this.SPEED, vy * this.SPEED);

          if (Math.abs(vx) > Math.abs(vy)) {
            this.lastDir = "side";
            this.player.anims.play("walk-side", true);

            // sheet side default kiri
            if (vx < 0) this.player.setFlipX(false);
            else this.player.setFlipX(true);
          } else {
            if (vy < 0) {
              this.lastDir = "up";
              this.player.setFlipX(false);
              this.player.anims.play("walk-up", true);
            } else {
              this.lastDir = "down";
              this.player.setFlipX(false);
              this.player.anims.play("walk-down", true);
            }
          }
        }
      }

      if (destroyed) return;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current!,
        backgroundColor: "#0b1020",
        pixelArt: true,

        input: {
          keyboard: {
            capture: [], // <- disable capture semua tombol
          },
        },

        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [MainScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: "100%",
          height: "100%",
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });

      gameRef.current = game;
    };

    start();

    return () => {
      destroyed = true;

      if (sceneRef.current) {
        sceneRef.current = null;
      }

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const router = useRouter();
  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div
    style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "black",
    }}
  >
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

    {/* === TOP RIGHT HUD === */}
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px",
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(92,58,28,0.95), rgba(58,32,14,0.95))",
        border: "2px solid rgba(40,22,10,0.95)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        color: "#f7ead0",
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 700,
      }}
    >
      {/* Username placeholder */}
      <div
        style={{
          padding: "4px 10px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {loading ? (
          "Loading..."
        ) : user ? (
          <span>{user.name}</span>
        ) : (
          "Guest"
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={() => {
          logout();
        }}
        style={{
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: 10,
          fontWeight: 800,
          background:
            "linear-gradient(180deg, rgba(180,50,50,0.95), rgba(120,30,30,0.95))",
          border: "2px solid rgba(60,15,15,0.95)",
          color: "#fff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        }}
      >
        Logout
      </button>
    </div>

    <CreateFormIntroModal
      open={isIntroOpen}
      onClose={() => setIsIntroOpen(false)}
      onConfirm={() => {
        setIsIntroOpen(false);
        setIsFormOpen(true);
      }}
    />

    <CreateFormModal
      open={isFormOpen}
      onClose={() => setIsFormOpen(false)}
      onSuccess={() => {
        console.log("Form created successfully");
      }}
    />

    <ManageFormsModal
      open={isYourFormOpen}
      onClose={() => setIsYourFormOpen(false)}
    />

    <PublicFormsModal 
    open={isPublicFormsOpen}
    onClose={() => setIsPublicFormsOpen(false)}
    />
  </div>
  );
}
