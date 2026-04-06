package dev.sophiawhite.chat;

import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.level.Location;
import dev.sophiawhite.level.MapInstance;

import java.time.Instant;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

public class ChatMessage {

    private Instant timestamp;
    private String contentUncensored;
    private String content;
    private UUID mapInstanceId;
    private Location location;
    private UUID authorId;

    public ChatMessage(Entity author, String contentUncensored){
        this.timestamp = Instant.now();
        this.authorId = author.getUuid();
        this.location = author.getLocation();
        if(this.location != null)
            this.mapInstanceId = this.location.getMapInstanceUuid();
        this.content = contentUncensored;
        this.contentUncensored = contentUncensored;
    }


    public Instant getTimestamp(){
        return this.timestamp;
    }

    public Entity getAuthor(){
        return EntityManager.getInstance().getEntityById(this.authorId);
    }

    public String getContent(){
        return this.content;
    }

    public String getContentUncensored(){
        return this.contentUncensored;
    }

    public UUID getMapInstanceId(){
        return this.mapInstanceId;
    }

    public UUID getAuthorId(){
        return this.authorId;
    }


}
