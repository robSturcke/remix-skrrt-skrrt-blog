import { Form, useActionData } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createPost } from "~/models/post.server";

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  // return new Response(null, {
  //   headers: {
  //     status: "302",
  //     Location: "posts/admin",
  //   },
  // });
  // console.log(await request.formData());
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((error) => error !== null);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title == "string", "title must be a string");
  invariant(typeof slug == "string", "slug must be a string");
  invariant(typeof markdown == "string", "markdown must be a string");

  await createPost({ title, slug, markdown });

  return redirect("posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPostRoute() {
  const errors = useActionData() as ActionData;
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input type="text" name="slug" className={inputClassName} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Post Title: </label>
        {errors?.markdown ? (
          <em className="text-red-600">{errors.markdown}</em>
        ) : null}
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        >
          Create Post
        </button>
      </p>
    </Form>
  );
}
