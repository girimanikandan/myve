package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final Neo4jClient neo4j;

    public GraphController(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    @GetMapping
    public Map<String, Object> getGraph() {

        String nodeQuery = """
            MATCH (p:Person)
            RETURN p.id AS id, p.name AS name
        """;

        String relQuery = """
            MATCH (a:Person)-[:FRIEND_WITH]->(b:Person)
            RETURN a.id AS source, b.id AS target
        """;

        List<Map<String, Object>> nodes = new ArrayList<>(neo4j.query(nodeQuery).fetch().all());
        List<Map<String, Object>> rels = new ArrayList<>(neo4j.query(relQuery).fetch().all());

        Random r = new Random();

        for (Map<String, Object> n : nodes) {
            n.put("x", r.nextInt(600));
            n.put("y", r.nextInt(400));
            n.put("color", "#FFD54F");
            n.put("width", 180);
            n.put("height", 120);
        }

        Map<String, Object> graph = new HashMap<>();
        graph.put("nodes", nodes);
        graph.put("relationships", rels);

        return graph;
    }
}
