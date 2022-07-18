import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createPost, getPost, updatePost } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  // return json({});
  if (params.slug == "new") {
    return json({});
  }
  const post = await getPost(params.slug);
  return json({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  // return new Response(null, {
  //   headers: {
  //     status: "302",
  //     Location: "posts/admin",
  //   },
  // });
  // console.log(await request.formData());
  await requireAdminUser(request);
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

  if (params.slug == "new") {
    await createPost({ title, slug, markdown });
  } else {
    // TODO update post
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPostRoute() {
  const data = useLoaderData();
  const errors = useActionData() as ActionData;

  const transition = useTransition();
  // const isCreating = Boolean(transition.submission);
  const isCreating = transition.submission?.formData.get("intent") == "create";
  const isUpdating = transition.submission?.formData.get("intent") == "update";

  const isNewPost = !data.post;

  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={data.post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={data.post?.slug}
          />
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
          defaultValue={data.post?.markdown}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          name="intent"
          value={isCreating ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
        </button>
      </p>
    </Form>
  );
}
