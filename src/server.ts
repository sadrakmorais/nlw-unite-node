import fastify from "fastify";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import { formattedSlug } from "./utils/formatedSlug";

const app = fastify();

const prisma = new PrismaClient({
  log: ["query"],
});

app.get("/", () => {
  return "Hello World!";
});

app.post("/events", async (req, res) => {
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number().int().positive().nullable(),
  });

  const data = createEventSchema.parse(req.body);

  const event = await prisma.event.create({
    data: {
      title: data.title,
      details: data.details,
      slug: formattedSlug(data.title),
      maximumAttendees: data.maximumAttendees,
    },
  });

  return res.status(201).send({ eventId: event.id });
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP serve running!");
});
