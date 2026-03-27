package dev.sophiawhite.tasks;

public abstract class Task implements Runnable {

    protected boolean repeating;
    protected int startTick;
    protected int interval;
    protected boolean isAsync;

    public Task(){

    }

    protected void setRepeating(boolean repeating) {
        this.repeating = repeating;
    }

    public boolean isRepeating(){
        return this.repeating;
    }

    protected void setStartTick(int startTick){
        this.startTick = startTick;
    }

    protected int getStartTick(){
        return this.startTick;
    }

    protected void setInterval(int interval){
        if(interval < 1)
            throw new IllegalArgumentException("The interval for a repeating task cannot be less than 1.");
        this.interval = interval;
    }

    protected int getInterval(){
        return this.interval;
    }

    protected boolean isAsync(){
        return this.isAsync;
    }

    protected void setAsync(boolean isAsync){
        this.isAsync = isAsync;
    }

}
