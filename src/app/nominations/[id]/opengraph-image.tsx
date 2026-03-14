import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "MS 2026 – Má nominace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nomination = await prisma.nomination.findUnique({
    where: { id },
  });

  if (!nomination) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0c0e12",
          }}
        >
          <span style={{ color: "white", fontSize: 48 }}>Nominace nenalezena</span>
        </div>
      ),
      { ...size }
    );
  }

  const players = await prisma.player.findMany({
    where: { id: { in: nomination.selectedPlayerIds } },
  });

  const captain = players.find((p) => p.id === nomination.captainId);
  const captainName = captain?.name?.split(" ").pop() || "";

  const playerNames = players
    .slice(0, 8)
    .map((p) => p.name.split(" ").pop())
    .join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c0e12",
          border: "8px solid #c41e3a",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "white",
              letterSpacing: "0.1em",
            }}
          >
            MS 2026
          </span>
          <span
            style={{
              fontSize: 36,
              color: "#c41e3a",
              fontWeight: "bold",
              letterSpacing: "0.05em",
            }}
          >
            MÁ NOMINACE
          </span>
          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: "#003f87",
              marginTop: 16,
            }}
          />
        </div>

        {playerNames && (
          <div
            style={{
              marginTop: 32,
              fontSize: 24,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: 1000,
            }}
          >
            {playerNames}
            {players.length > 8 && " …"}
          </div>
        )}

        {captainName && (
          <div
            style={{
              marginTop: 24,
              padding: "8px 20px",
              backgroundColor: "#003f87",
              color: "white",
              fontSize: 22,
              borderRadius: 8,
            }}
          >
            C: {captainName}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Sestav si vlastní na hockey-nomination.cz
        </div>
      </div>
    ),
    { ...size }
  );
}
