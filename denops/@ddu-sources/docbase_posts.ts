import type { GatherArguments } from "https://deno.land/x/ddu_vim@v4.1.0/base/source.ts";
import type { ActionData as FileActionData } from "https://deno.land/x/ddu_kind_file@v0.7.1/file.ts";
import type { Item } from "https://deno.land/x/ddu_vim@v4.1.0/types.ts";
import { BaseSource } from "https://deno.land/x/ddu_vim@v4.1.0/types.ts";
import {
  isPost,
  Post,
} from "https://denopkg.com/kyoh86/denops-docbase.vim@master/denops/docbase/types.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

type ActionData = FileActionData & Post;

type Params = {
  domain: string;
  per_page: number;
  max_page: number;
  query: string;
};

export class Source extends BaseSource<Params, ActionData> {
  override kind = "file";

  override gather(
    args: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        try {
          const queue: Promise<void>[] = [];
          for (let page = 1; page < args.sourceParams.max_page; page++) {
            queue.push((async () => {
              const res = await args.denops.dispatch(
                "docbase",
                "searchPosts",
                {
                  domain: args.sourceParams.domain,
                  q: args.sourceParams.query,
                  page,
                  per_page: args.sourceParams.per_page,
                },
              );
              const { posts } = ensure(
                res,
                is.ObjectOf({
                  posts: is.ArrayOf(isPost),
                }),
              );
              controller.enqueue(posts.map((p) => {
                return {
                  word: p.title,
                  action: {
                    ...p,
                    path:
                      `docbase://post;domain=${args.sourceParams.domain}&postId=${p.id}`,
                    url:
                      `https://${args.sourceParams.domain}.docbase.io/posts/${p.id}`,
                  },
                };
              }));
            })());
          }
          await Promise.all(queue);
        } finally {
          controller.close();
        }
      },
    });
  }

  override params(): Params {
    return { domain: "", max_page: 5, per_page: 100, query: "desc:changed_at" };
  }
}
