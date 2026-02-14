/**
 * Generates a static OG image and saves to public/og-image.png
 * Run: npx tsx scripts/generate-og-image.ts
 * Messenger/Facebook sometimes work better with static images than dynamic.
 */
import { ImageResponse } from "next/og";
import * as fs from "fs";
import * as path from "path";

async function generate() {
  const response = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 80,
            left: 80,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#0ea5e9",
              opacity: 0.85,
              position: "absolute",
              left: 0,
              top: 20,
            }}
          />
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#0ea5e9",
              position: "absolute",
              left: 100,
              top: 0,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#0369a1",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          NudgeSoon
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#475569",
            fontWeight: 500,
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          Gentle Reminders for Your Items
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#64748b",
            marginTop: 24,
          }}
        >
          Passports, memberships, food, medicine & more
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(process.cwd(), "public", "og-image.png");
  fs.writeFileSync(outPath, buffer);
  console.log("✅ Generated public/og-image.png");
}

generate().catch(console.error);
