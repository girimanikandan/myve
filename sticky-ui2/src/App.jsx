import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

function App() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "http://localhost:8084/api/stickies/ui";   // <- IMPORTANT

    console.log("Fetching from:", url);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error("HTTP " + res.status + " - " + msg);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Received data:", data);

        if (!Array.isArray(data)) {
          throw new Error("Backend returned invalid format.");
        }

        setNodes(data);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: "red" }}>Error: {error}</h2>;
  if (nodes.length === 0) return <h2>No nodes returned from backend.</h2>;

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Sticky Notes</h2>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {nodes.map((n, idx) => (
            <Group key={idx} x={n.x} y={n.y} draggable>
              <Rect
                width={n.width}
                height={n.height}
                fill={n.color}
                cornerRadius={10}
                shadowBlur={10}
              />
              <Text text={n.title} x={10} y={10} fontSize={18} fill="black" />
              <Text
                text={n.text}
                x={10}
                y={40}
                width={n.width - 20}
                fontSize={14}
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
