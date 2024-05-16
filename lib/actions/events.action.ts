"use server"

import { CreateEventParams } from "@/types"
import { handleError } from "../utils"
import { connectToDatabase } from "../mongodb/database"
import User from "../mongodb/database/models/user.model"
import Event from "../mongodb/database/models/event.model"

export const createEvent = async({ event, userId, path }: CreateEventParams) => {
    try {
        await connectToDatabase();
        const organizer = await User.findById(userId);
        
        if(!organizer){
            throw new Error("Organizer not found");
        }

        console.log({
            categoryId: event.categoryId,
            organizerId: userId
        })

        const newEvent = await Event.create({
            ...event, category: event.categoryId, organizer: userId
        });

        return JSON.parse(JSON.stringify(newEvent));
    } catch (error) {
        handleError(error);   
    }
}