import type { TagsResponse } from "../dto/tags";
import Elysia from "elysia";
import { useStorage } from "../../storage";
import { tagsDTO } from "../dto/tags";

const app = new Elysia({ prefix: "/tags" });

function mapStorageError(status: unknown, error: unknown): never {
  const setStatus = status as (
    code: number,
    payload: { message: string },
  ) => never;

  if (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed")
  ) {
    return setStatus(409, { message: "Tag already exists" });
  }

  return setStatus(500, { message: "Failed to create tag" });
}

app
  .use(tagsDTO)
  // Получение списка тегов
  .get(
    "/",
    () => {
      const storage = useStorage();
      const result = storage.tags.getTags();

      return result as TagsResponse;
    },
    {
      response: "tagsResponse",
      detail: {
        tags: ["Tags"],
      },
    },
  )
  // Добавление тега
  .post(
    "/",
    ({ body, status }) => {
      const storage = useStorage();
      try {
        const { id } = storage.tags.createTag(body.name);
        return { id };
      } catch (error) {
        return mapStorageError(status, error);
      }
    },
    {
      body: "tagsAdd",
      response: "tagsAddResponse",
      detail: {
        tags: ["Tags"],
      },
    },
  )
  // Удаление тега и удаление его из всех сниппетов
  .delete(
    "/:id",
    ({ params, status }) => {
      const storage = useStorage();
      const { deleted } = storage.tags.deleteTag(Number(params.id));

      if (!deleted) {
        return status(404, { message: "Tag not found" });
      }

      return { message: "Tag deleted" };
    },
    {
      detail: {
        tags: ["Tags"],
      },
    },
  );

export default app;
