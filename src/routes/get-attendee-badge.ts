import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getAttendeeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attenddeId/badge",
    {
      schema: {
        summary: "Get an attendee information",
        tags: ["attendees"],
        params: z.object({
          attenddeId: z.string().transform(Number),
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string().email(),
              eventTitle: z.string(),
              checkInURL: z.string().url(),
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const { attenddeId } = req.params;

      const attendee = await prisma.attendee.findUnique({
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true,
            },
          },
        },
        where: {
          id: attenddeId,
        },
      });

      if (attendee === null) {
        throw new Error("Attendee not found");
      }

      const baseUrl = `${req.protocol}://${req.hostname}`;
      const checkInURL = new URL(`/attendees/${attenddeId}/check-in`, baseUrl);
      return res.send({
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: String(attendee.event),
          checkInURL: checkInURL.toString(),
        },
      });
    }
  );
}
