import {
  BaseFilter,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.10.3/types.ts";
import {
  isPost,
  Post,
} from "https://denopkg.com/kyoh86/denops-docbase.vim@main/denops/docbase/types.ts";
import { ensure } from "https://deno.land/x/unknownutil@v3.17.2/mod.ts";

type Params = {
  field: keyof Pick<
    Post,
    | "id"
    | "title"
    | "created_at"
    | "updated_at"
    | "stars_count"
    | "good_jobs_count"
  >;
  order: "desc" | "asc";
};

export class Filter extends BaseFilter<Params> {
  filter(args: {
    filterParams: Params;
    items: DduItem[];
  }): Promise<DduItem[]> {
    const { filterParams, items } = args;
    return Promise.resolve(items.sort((a, b) => {
      const postA = ensure(a.action, isPost);
      const postB = ensure(b.action, isPost);
      const fieldA = postA[filterParams.field];
      const fieldB = postB[filterParams.field];
      if (fieldA < fieldB) {
        return filterParams.order == "desc" ? 1 : -1;
      } else if (fieldA > fieldB) {
        return filterParams.order == "desc" ? -1 : 1;
      }
      return 0;
    }));
  }

  params(): Params {
    return {
      field: "updated_at",
      order: "desc",
    };
  }
}
