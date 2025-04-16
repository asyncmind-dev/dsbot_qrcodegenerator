import { Events } from "discord.js";

//  Importing the interfaces
import CustomClientI from "@interfaces/CustomClientI";
import EventI from "@interfaces/EventI";

export default class Ready implements EventI {
  public readonly name  = Events.ClientReady;
  public readonly once  = true;
  public readonly active = true;

  public execute(client: CustomClientI): void {
    //  Checking if the client passed exists
    if(!client) throw new Error("Event "+ this.name + ": The client is not valid.");
    //  Checking if there is a client.user
    if(!client.user) throw new Error("Event "+ this.name + ": The client user is not valid.");
    //  Console logging a message to know if the client is ready
    console.log(client.user.tag + " is ready.");
  }; 
}
