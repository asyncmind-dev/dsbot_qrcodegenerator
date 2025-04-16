import { ClientEvents } from "discord.js";

export default interface EventI {
    name:   keyof ClientEvents,     //  The name of the event
    once:   boolean,    //  If the event should be ran only once should be set to true
    active: boolean,    //  If the event is active should be set to true
    execute: (...args: any) => void     // The function that should run when the event fires
}