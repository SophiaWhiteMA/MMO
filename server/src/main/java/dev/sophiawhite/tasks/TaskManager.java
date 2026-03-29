package dev.sophiawhite.tasks;

import java.util.List;
import java.util.ArrayList;

/**
 * The lifeblood of the game loop. This class orchestrates all game events that don't occur instantly. For all methods,
 * a delay and/or interval of 0 is invalid and will throw an IllegalArgumentException. This class is also the only
 * place the definitive record of the game's current tick number is tracked.
 */
public class TaskManager {

    private static final TaskManager instance = new TaskManager();

    private List<Task> taskList = new ArrayList<Task>();
    private int tick;

    private TaskManager(){



    }

    public static TaskManager getInstance(){
        return instance;
    }

    /**
     * Schedules a task to be executed after the specified delay.
     * @param delay Delay in ticks
     */
    public void scheduleTask(Task task, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setRepeating(false);
        task.setStartTick(this.tick + delay);
        task.setAsync(false);
        this.taskList.add(task);
    }

    /**
     * Schedules a recurring task with a delay of 1
     * @param task
     * @param interval
     */
    public void scheduleRepeatingTask(Task task, int interval) {
        this.scheduleRepeatingTask(task, interval, 1);
    }

    /**
     * Schedules a recurring task that starts after the specified delay
     * @param task
     * @param interval Interval in ticks
     * @param delay Delay in ticks
     */
    public void scheduleRepeatingTask(Task task, int interval, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setRepeating(true);
        task.setInterval(interval);
        task.setStartTick(this.tick + delay);
        this.taskList.add(task);
    }

    /**
     * Schedules a task that will execute on a new Thread after the  specified delay
     * @param task
     * @param delay Delay in ticks
     */
    public void scheduleAsyncTask(Task task, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setAsync(true);
        task.setStartTick(this.tick + delay);
        task.setRepeating(false);
        this.taskList.add(task);
    }


    /**
     * Schedules a task that will execute asynchronously on a set interval starting on the next game tick
     * @param task
     * @param interval
     */
    public void scheduleAsyncRepeatingTask(Task task, int interval) {
        this.scheduleAsyncRepeatingTask(task, interval, 1);
    }

    /**
     * Schedules a task that will execute asynchronously on a set interval after the specified delay
     * @param task
     * @param interval Interval in ticks
     * @param delay Delay in ticks
     */
    public void scheduleAsyncRepeatingTask(Task task, int interval, int delay) {
        if(delay < 1)
            throw new IllegalArgumentException("The delay provided to the task manager for a task must be greater than 0. Value provided: " + delay);
        task.setRepeating(true);
        task.setInterval(interval);
        task.setStartTick(this.tick + delay);
        task.setAsync(true);
        this.taskList.add(task);
    }

    /**
     * Executes all tasks scheduled for this tick and then increments the internal tick counter
     */
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
