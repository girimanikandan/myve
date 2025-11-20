package com.example.demo.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
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
            MATCH (p:Person)
            RETURN 
                p.id AS id,
                p.name AS title,
                p.name AS text
        """;

        Collection<Map<String, Object>> raw = neo4j.query(cypher).fetch().all();

        List<Map<String, Object>> list = new ArrayList<>();
        Random r = new Random();

        for (Map<String, Object> row : raw) {
            Map<String, Object> note = new HashMap<>(row);
            note.put("color", "#FFD54F");
            note.put("x", r.nextInt(600));
            note.put("y", r.nextInt(400));
            note.put("width", 180);
            note.put("height", 120);

            list.add(note);
        }

        return list;
    }
}
