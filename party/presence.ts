import type * as Party from "partykit/server";

type Visitor = {
  id: string;
  x: number;
  y: number;
  color: string;
  number: number;
};

const METRO_COLORS = [
  '#0039A6', '#EE352E', '#00933C', '#FF6319', '#7B2D8E',
  '#00A1DE', '#6CBE45', '#B07CC6', '#10B981', '#D97706', '#E75480',
];

export default class PresenceServer implements Party.Server {
  visitors: Map<string, Visitor> = new Map();

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    // Assign all-time visitor number using durable storage
    const count = (await this.room.storage.get<number>('visitorCount')) ?? 0;
    const visitorNumber = count + 1;
    await this.room.storage.put('visitorCount', visitorNumber);

    const color = METRO_COLORS[Math.floor(Math.random() * METRO_COLORS.length)];
    const visitor: Visitor = { id: conn.id, x: 550, y: 300, color, number: visitorNumber };
    this.visitors.set(conn.id, visitor);

    // Send welcome with assigned identity
    conn.send(JSON.stringify({ type: "welcome", id: conn.id, color, number: visitorNumber }));

    // Send full sync of other visitors
    conn.send(JSON.stringify({
      type: "sync",
      visitors: Array.from(this.visitors.values()).filter(v => v.id !== conn.id),
    }));

    // Broadcast new visitor to everyone else
    this.room.broadcast(
      JSON.stringify({ type: "update", visitor }),
      [conn.id],
    );
  }

  onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection) {
    try {
      const data = JSON.parse(message as string);

      if (data.type === "position") {
        const visitor = this.visitors.get(sender.id);
        if (!visitor) return;
        visitor.x = data.x;
        visitor.y = data.y;
        this.room.broadcast(
          JSON.stringify({ type: "update", visitor }),
          [sender.id],
        );
      }

      if (data.type === "ping") {
        const visitor = this.visitors.get(sender.id);
        if (!visitor) return;
        this.room.broadcast(
          JSON.stringify({ type: "ping", x: data.x, y: data.y, color: visitor.color }),
        );
      }
    } catch {
      // Malformed message — ignore
    }
  }

  onClose(conn: Party.Connection) {
    this.visitors.delete(conn.id);
    this.room.broadcast(JSON.stringify({ type: "leave", id: conn.id }));
  }
}
