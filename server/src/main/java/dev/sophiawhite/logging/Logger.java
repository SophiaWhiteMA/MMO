package dev.sophiawhite.logging;

import dev.sophiawhite.config.ServerConfig;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class Logger {

    public static final Logger instance = new Logger();

    private final ServerConfig serverConfig = ServerConfig.getInstance();

    private final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
                    .withZone(ZoneId.systemDefault());

    private Logger(){

    }

    public static Logger getInstance(){
        return instance;
    }

    public void log(LogLevel level, String message) {
        if(level.getLevel() < serverConfig.getLogLevel())
            return;
        String timestamp = FORMATTER.format(Instant.now());
        String levelBlock = String.format("[%s]", level);
        System.out.printf("[%s] %-12s %s%n", timestamp, levelBlock, message);    }

}
