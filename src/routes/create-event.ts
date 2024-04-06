import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { formattedSlug } from "../utils/formatedSlug";
import { BadRequest } from "./_erros/bad-request";

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        summary: "Create an event",
        tags: ["events"],
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { details, maximumAttendees, title } = req.body;

      const slug = formattedSlug(title);

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug,
        },
      });

      if (eventWithSameSlug !== null) {
        throw new BadRequest("Another event with same title already");
      }

      const event = await prisma.event.create({
        data: {
          title: title,
          details: details,
          slug: slug,
          maximumAttendees: maximumAttendees,
        },
      });

      return res.status(201).send({ eventId: event.id });
    }
  );
}
