package com.example.analyticsservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private MongoTemplate mongoTemplate;

    // 1. Global Stats: Popular categories across the whole app
    public List<Map> getGlobalCategoryStats() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.group("category").count().as("count"),
                Aggregation.sort(Sort.Direction.DESC, "count")
        );
        return mongoTemplate.aggregate(aggregation, "habits", Map.class).getMappedResults();
    }

    // 2. Pro Insight: Success Rate per Category for a specific user
    public List<Map> getCategorySuccessRate(Long userId) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("userId").is(userId)),
                Aggregation.group("category")
                        .count().as("totalHabits")
                        .sum("completedCount").as("totalCompletions"),
                Aggregation.project("totalHabits", "totalCompletions")
                        .andExpression("totalCompletions / totalHabits").as("successRate"),
                Aggregation.sort(Sort.Direction.DESC, "successRate")
        );
        return mongoTemplate.aggregate(agg, "habits", Map.class).getMappedResults();
    }

    // 3. Heatmap Data: Completion counts by day of the week
    public List<Map> getWeeklyHeatmap(Long userId) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("userId").is(userId)),
                Aggregation.project()
                        .and("completionDate").project("dayOfWeek").as("day"),
                Aggregation.group("day").count().as("count"),
                Aggregation.sort(Sort.Direction.ASC, "_id")
        );
        return mongoTemplate.aggregate(agg, "habit_logs", Map.class).getMappedResults();
    }
}