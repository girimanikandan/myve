import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/stickies/ui")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Sticky Notes Board</h2>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {notes.map((note) => (
            <Group key={note.id} x={note.x} y={note.y} draggable>
              <Rect
                width={note.width}
                height={note.height}
                fill={note.color}
                cornerRadius={10}
                shadowBlur={8}
              />

              <Text
                text={note.title}
                x={10}
                y={10}
                fontSize={16}
                fontStyle="bold"
                fill="black"
              />

              <Text
                text={note.text}
                x={10}
                y={40}
                width={note.width - 20}
                fill="black"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
