package dev.sophiawhite.logging;

public enum LogLevel {

    NETWORK(1),
    DEBUG(2),
    INFO(3),
    WARN(4),
    ERROR(5),
    SEVERE(6);

    private final int level;

    LogLevel(int level) {
        this.level = level;
    }

    public int getLevel(){
        return this.level;
    }

}
