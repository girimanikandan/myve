import { useEffect, useState, useMemo, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva"; // <- Added Line

// 1. Define the basic shape of a sticky node and a link
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

// The structure for your link data. You will need to fetch this from your backend as well.
// For now, let's define a hardcoded example link from one node to another.
const INITIAL_LINKS = [
  // This link assumes node with id: 1 connects to node with id: 2
  // You may need to adjust the IDs based on what your backend actually returns.
  { id: "L1", sourceId: 1, targetId: 2, color: "#333333" },
];

// Helper function to calculate where the arrow should connect on the boundary of the rectangle
const getArrowPoints = (source, target) => {
  // Simple connection for demonstration: center of source to center of target
  // For a more sophisticated connection (e.g., closest edge), a more complex geometry function is needed.
  const p1 = {
    x: source.x + NODE_WIDTH / 2,
    y: source.y + NODE_HEIGHT / 2,
  };
  const p2 = {
    x: target.x + NODE_WIDTH / 2,
    y: target.y + NODE_HEIGHT / 2,
  };

  // Line points
  const points = [p1.x, p1.y, p2.x, p2.y];

  return points;
};

function App() {
  // Use a map for nodes for O(1) lookup speed (faster than iterating array)
  const [nodesMap, setNodesMap] = useState({});
  const [links, setLinks] = useState(INITIAL_LINKS); // <- New state for links
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "http://localhost:8084/api/stickies/ui";

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

        // Convert the array into a Map/Object for O(1) lookup speed
        const initialNodesMap = data.reduce((acc, node) => {
          // Add a default width/height if your backend doesn't provide it
          acc[node.id] = { ...node, width: node.width || NODE_WIDTH, height: node.height || NODE_HEIGHT };
          return acc;
        }, {});

        setNodesMap(initialNodesMap);
        // NOTE: You would typically fetch links data here as well if they are separate.

      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handler to update a node's position after drag
  const handleDragEnd = useCallback((e, nodeId) => {
    // We update the state, which triggers a re-render, thus updating the arrow position
    setNodesMap((prevNodesMap) => ({
      ...prevNodesMap,
      [nodeId]: {
        ...prevNodesMap[nodeId],
        x: e.target.x(),
        y: e.target.y(),
      },
    }));
  }, []);


  // Extracting nodes array for mapping/rendering
  const nodes = useMemo(() => Object.values(nodesMap), [nodesMap]);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: "red" }}>Error: {error}</h2>;
  if (nodes.length === 0) return <h2>No nodes returned from backend.</h2>;

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Sticky Notes</h2>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>

          {/* 2. RENDER THE ARROW CONNECTIONS FIRST */}
          {links.map((link) => {
            const sourceNode = nodesMap[link.sourceId];
            const targetNode = nodesMap[link.targetId];

            // Only draw if both nodes exist
            if (!sourceNode || !targetNode) return null;

            const points = getArrowPoints(sourceNode, targetNode);

            return (
              <Line
                key={link.id}
                points={points}
                stroke={link.color || "black"}
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
                // Properties to turn the line end into an arrow head
                tension={0} // Straight line
                // The Konva Arrow shape would be a better choice for complex arrows
                // For a basic line with an arrow at the end, this is sufficient:
                dash={[10, 5]} // Example dashed line
                // To get a true arrowhead, use <Arrow /> instead of <Line />
                pointerLength={10}
                pointerWidth={10}
              />
            );
          })}


          {/* 3. RENDER THE DRAGGABLE NOTES */}
          {nodes.map((n) => (
            <Group
              key={n.id} // Use the actual node ID as the key
              x={n.x}
              y={n.y}
              draggable
              onDragEnd={(e) => handleDragEnd(e, n.id)} // <- Add handler to update position
            >
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