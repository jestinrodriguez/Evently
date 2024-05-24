"use server"

import { CreateEventParams, GetAllEventsParams } from "@/types"
import { handleError } from "../utils"
import { connectToDatabase } from "../mongodb/database"
import User from "../mongodb/database/models/user.model"
import Event from "../mongodb/database/models/event.model"
import Category from "../mongodb/database/models/category.model"

const populateEvent = async (query: any) => {
    return query
    .populate({ path: 'organizer', model:User, select: '_id firstName lastName'})
    .populate({ path: 'category', model:Category, select: '_id name'})
}

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

export const getEventById = async (eventId: string) => {
    try {
        await connectToDatabase();
        
        // returns additional data of eventId owner
        const event = await populateEvent(Event.findById(eventId));

        if(!event){
            throw new Error("Event not found");
        }

        return JSON.parse(JSON.stringify(event))
    } catch (error) {
        handleError(error);
    }
}

export const getAllEvents = async ({ query, limit = 6, page, category } : GetAllEventsParams) => {
    try {
        await connectToDatabase();
        
        const conditions = {};

        const eventsQuery = Event.find(conditions)
            .sort({ createdAt: 'desc'})
            .skip(0)
            .limit(limit)
        
        const events = await populateEvent(eventsQuery);
        const eventsCount = await Event.countDocuments(conditions);

        return {
            data: JSON.parse(JSON.stringify(events)),
            totalPages: Math.ceil(eventsCount / limit)
        }
    } catch (error) {
        handleError(error);
    }
}