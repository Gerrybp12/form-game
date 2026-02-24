"use client";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CreateFormIntroModal({
  open,
  title = "Create Form",
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 92vw)",
          borderRadius: 14,
          border: "3px solid rgba(78, 52, 28, 0.95)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(250,239,210,0.98), rgba(233,214,170,0.98))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background:
              "linear-gradient(180deg, rgba(120, 72, 32, 0.95), rgba(85, 48, 20, 0.95))",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.2)",
              color: "white",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 16, color: "rgba(40, 24, 10, 0.95)" }}>
          <div style={{ fontSize: 14, lineHeight: 1.45 }}>
            You stand on the central plaza. A parchment seal glows faintly.
            <br />
            Press <b>Create</b> to start forging a new form.
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(120,72,32,0.35)",
              margin: "14px 0",
            }}
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                cursor: "pointer",
                borderRadius: 12,
                padding: "10px 14px",
                border: "2px solid rgba(78,52,28,0.55)",
                background: "rgba(255,255,255,0.35)",
                color: "rgba(60,36,14,0.95)",
                fontWeight: 800,
              }}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              style={{
                cursor: "pointer",
                borderRadius: 12,
                padding: "10px 14px",
                border: "2px solid rgba(60,35,12,0.95)",
                background:
                  "linear-gradient(180deg, rgba(214,159,64,0.98), rgba(162,108,34,0.98))",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 900,
                letterSpacing: 0.3,
              }}
            >
              Create
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Tip: press <b>ESC</b> to close.
          </div>
        </div>
      </div>
    </div>
  );
}