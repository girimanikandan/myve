package com.example.demo.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stickies")
public class StickyController {

    private final Neo4jClient neo4j;

    public StickyController(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

   @GetMapping("/ui")
public List<Map<String, Object>> getStickyNotes() {

    String cypher = """
        MATCH (e:Entity)
        OPTIONAL MATCH (e)-[:TAGGED_WITH]->(t:Tag)
        RETURN e.entityId AS id,
               e.title AS title,
               e.summary AS text,
               collect(t.name) AS tags
    """;

    // FIX: fetch results as Collection
    Collection<Map<String, Object>> result =
            neo4j.query(cypher).fetch().all();

    // Convert to List (your IDE wants List)
    List<Map<String, Object>> list = new ArrayList<>(result);

    Random r = new Random();
    list.forEach(item -> {
        item.put("color", "#FFD54F");
        item.put("x", r.nextInt(600));
        item.put("y", r.nextInt(400));
        item.put("width", 200);
        item.put("height", 140);
    });

    return list;
}
}