package dev.sophiawhite.entity;

import dev.sophiawhite.level.MapInstance;

import java.util.*;

public class Pathfinder {

    private static final int PATH_ITERATION_LIMIT = 2000;

    public static long pack(int x, int y) {
        return ((long) x << 32) | (y & 0xFFFFFFFFL);
    }

    private List<int[]> currentPath = new ArrayList<>();

    public List<int[]> beginPathfinding(MapInstance mapInstance, int startX, int startY, int endX, int endY) {

        if (startX == endX && startY == endY || mapInstance == null) {
            this.currentPath = new ArrayList<>();
            return this.currentPath;
        }

        PriorityQueue<Node> openSet = new PriorityQueue<>();
        Map<Long, Node> allNodes = new HashMap<>();
        Set<Long> closedSet = new HashSet<>();

        Node startNode = new Node(startX, startY);
        startNode.gCost = 0;
        startNode.hCost = getOctileDistance(startX, startY, endX, endY);

        openSet.add(startNode);
        allNodes.put(pack(startX, startY), startNode);

        int iterations = 0;

        while (!openSet.isEmpty()) {
            if (++iterations > PATH_ITERATION_LIMIT) break;

            Node current = openSet.poll();
            long currentKey = pack(current.x, current.y);
            closedSet.add(currentKey);

            if (current.x == endX && current.y == endY) {
                this.currentPath = retracePath(current);
                return this.currentPath;
            }

            for (int dx = -1; dx <= 1; dx++) {
                for (int dy = -1; dy <= 1; dy++) {
                    if (dx == 0 && dy == 0) continue;

                    int nextX = current.x + dx;
                    int nextY = current.y + dy;
                    long nextKey = pack(nextX, nextY);

                    if (!mapInstance.isInBounds(nextX, nextY) || mapInstance.isObstructedAt(nextX, nextY) || closedSet.contains(nextKey)) {
                        continue;
                    }

                    // Corner cutting protection
                    if (dx != 0 && dy != 0) {
                        if (mapInstance.isObstructedAt(current.x + dx, current.y) || mapInstance.isObstructedAt(current.x, current.y + dy)) {
                            continue;
                        }
                    }

                    int moveCost = (dx == 0 || dy == 0) ? 10 : 14;
                    int newGCost = current.gCost + moveCost;

                    Node neighbor = allNodes.get(nextKey);
                    if (neighbor == null) {
                        neighbor = new Node(nextX, nextY);
                        allNodes.put(nextKey, neighbor);
                    }

                    if (newGCost < neighbor.gCost) {
                        neighbor.gCost = newGCost;
                        neighbor.hCost = getOctileDistance(nextX, nextY, endX, endY);
                        neighbor.parent = current;

                        openSet.remove(neighbor);
                        openSet.add(neighbor);
                    }
                }
            }
        }

        this.currentPath = null;
        return null;
    }

    private int getOctileDistance(int x1, int y1, int x2, int y2) {
        int dx = Math.abs(x1 - x2);
        int dy = Math.abs(y1 - y2);
        return 10 * (dx + dy) + (14 - 20) * Math.min(dx, dy);
    }

    private List<int[]> retracePath(Node endNode) {
        LinkedList<int[]> path = new LinkedList<>();
        Node current = endNode;
        while (current != null) {
            path.addFirst(new int[]{current.x, current.y});
            current = current.parent;
        }
        path.removeFirst();
        return path;
    }

    public List<int[]> getCurrentPath() {
        return currentPath;
    }

    public void clearPath() {
        this.currentPath = new ArrayList<>();
    }

    private static class Node implements Comparable<Node> {
        final int x, y;
        int gCost = Integer.MAX_VALUE;
        int hCost;
        Node parent;

        Node(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public int compareTo(Node other) {
            int f = Integer.compare(this.gCost + this.hCost, other.gCost + other.hCost);
            return (f != 0) ? f : Integer.compare(this.hCost, other.hCost);
        }
    }
}