import path from "path";
import fs from "fs";

import EventI from "@interfaces/EventI";
import CustomClientI from "@interfaces/CustomClientI";

export default class EventHandler {
  private readonly eventsFolderPath: string = path.join(
    __dirname,
    "../",
    "Events"
  );
  private readonly client: CustomClientI;

  public constructor(client: CustomClientI) {
    this.client = client;
  }

  /**
   * Contains all the event handling logic.
   * Reads the files inside the events folder, imports the classes and executes the code
   */
  public async handleEvents(): Promise<void> {
    //  Getting all the event files inside the events folder that end with .ts or .js
    const eventFilenames = fs
      .readdirSync(this.eventsFolderPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    //  Looping through each filename and importing each event class separately
    for (const eventFilename of eventFilenames) {
      //  Setting the eventFilePath so the event class can be imported
      const eventFilePath = path.join(this.eventsFolderPath, eventFilename);
      //  Importing the event class dynamically
      const eventClass = (await import(eventFilePath)).default;

      //  Checking if the event class was imported successfully
      if (!eventClass) {
        throw new Error(
          "[--" +
            eventFilename +
            "--]" +
            " There was an error while importing the class."
        );
      }

      // Creating an event instance and casting it to EventI
      const event = new eventClass() as EventI;

      // Check if event instance was created successfully
      if (!event)
        throw new Error(
          "[--" +
            eventFilename +
            "--]" +
            " There was an error while initializing the class."
        );

      // Create an executable wrapper to forward the arguments to the event
      const execute = (...args: any) => event.execute(...args);

      //  Skipping events if they are marked as inactive
      if (!event.active) {
        console.log(
          "Event: [--" + event.name.toUpperCase() + "--]" + " Skipped!"
        );
        continue;
      }

      //  If the event requires to be run only once
      if (event.once) {
        this.client.once(event.name, execute);
        continue;
      }

      //  Listen for every time the event is fired
      this.client.on(event.name, execute);
    }
  }
}
