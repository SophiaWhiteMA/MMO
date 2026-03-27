package dev.sophiawhite.tasks;

import java.util.List;
import java.util.ArrayList;

public class TaskManager {

    private static final TaskManager instance = new TaskManager();

    private List<Task> taskList = new ArrayList<Task>();
    private int tick;


    private TaskManager(){



    }

    public static TaskManager getInstance(){
        return instance;
    }

    public void scheduleTask(Task task, int delay) {
        task.setRepeating(false);
        task.setStartTick(this.tick + delay);
        task.setAsync(false);
        this.taskList.add(task);
    }

    /**
     * Schedudles a repeating task with a delay of 0
     * @param task
     * @param interval
     */
    public void scheduleRepeatingTask(Task task, int interval) {
        this.scheduleRepeatingTask(task, interval, 1);
    }

    public void scheduleRepeatingTask(Task task, int interval, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setRepeating(true);
        task.setInterval(interval);
        task.setStartTick(this.tick + delay);
        this.taskList.add(task);
    }

    public void scheduleAsyncTask(Task task, int delay) {
        task.setAsync(true);
        task.setStartTick(this.tick + delay);
        task.setRepeating(false);
        this.taskList.add(task);
    }


    public void scheduleAsyncRepeatingTask(Task task, int interval) {
        this.scheduleAsyncRepeatingTask(task, interval, 1);
    }

    public void scheduleAsyncRepeatingTask(Task task, int interval, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setRepeating(true);
        task.setInterval(interval);
        task.setStartTick(this.tick + delay);
        task.setAsync(true);
        this.taskList.add(task);
    }

    public void onTick(){

        List<Task> tasksToRemove = new ArrayList<Task>();
        List<Task> taskListCopy = new ArrayList<Task>(this.taskList);

        for(Task t: taskListCopy) {

            if(t.getStartTick() > this.tick) {
                continue;
            } else {
                if(t.isAsync()) {
                    new Thread(t).start();
                } else {
                    t.run();
                }

                if(t.isRepeating())
                    t.setStartTick(t.getStartTick() + t.getInterval());
            }

            if(!t.isRepeating())
                tasksToRemove.add(t);
        }

        for(Task t: tasksToRemove) {
            this.taskList.remove(t);
        }

        this.tick++;
    }

    public int getCurrentTick(){
        return this.tick;
    }

}
