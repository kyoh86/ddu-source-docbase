import { BaseFilter, type DduItem } from "jsr:@shougo/ddu-vim@~5.0.0/types";
import { isPost, type Post } from "jsr:@kyoh86/denops-docbase-vim@~0.1.0/types";
import { ensure } from "jsr:@core/unknownutil@~3.18.1";

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
