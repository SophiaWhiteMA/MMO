package dev.sophiawhite.config;

import dev.sophiawhite.logging.LogLevel;

public class ServerConfig {

    private static ServerConfig instance = new ServerConfig();

    private final int logLevel;

    private ServerConfig(){
        this.logLevel = LogLevel.INFO.getLevel();
    }

    public int getLogLevel(){
        return this.logLevel;
    }

    public int getTicksPerSecond(){
        return 2;
    }

    public static ServerConfig getInstance() {
        return instance;
    }


}
