import { filterTableRows, sortTableRows } from "@/lib/common/table";

describe("filterTableRows", () => {
  it("テーブル行群を指定の条件でフィルタして返す", () => {
    const rows = [
      { index: 0, columns: { a: "hoge", b: "huga" } },
      { index: 1, columns: { a: "hoge", b: "piyo" } },
      { index: 2, columns: { a: "foo", b: "bar" } },
    ];
    const predicate1 = (item: { a: string; b: string }) => item.a === "hoge";
    const predicate2 = (item: { a: string; b: string }) => item.b === "huga";

    // 単数条件
    expect(filterTableRows(rows, [predicate1])).toEqual([rows[0], rows[1]]);

    // 複数条件
    expect(filterTableRows(rows, [predicate1, predicate2])).toEqual([rows[0]]);

    // 条件無し
    expect(filterTableRows(rows, [])).toEqual(rows);
  });
});

describe("sortTableRows", () => {
  it("テーブル行群を指定のパスが示す要素でソートして返す", () => {
    const rows = [
      { index: 0, columns: { a: "ccc", b: 3, c: { d: "ccc" }, e: "bbb" } },
      { index: 1, columns: { a: "bbb", b: 2, c: { d: "bbb" }, e: "aaa" } },
      { index: 2, columns: { a: "aaa", b: 1, c: { d: "aaa" }, e: "aaa" } },
    ];

    // 文字列型の列
    expect(sortTableRows(rows, "a")).toEqual([rows[2], rows[1], rows[0]]);

    // 数値型の列
    expect(sortTableRows(rows, "b")).toEqual([rows[2], rows[1], rows[0]]);

    // ネストしたキーを持つ列が引けること
    expect(sortTableRows(rows, "c.d")).toEqual([rows[2], rows[1], rows[0]]);

    // 同じ値のもの同士は順番が入れ替わらないこと
    expect(sortTableRows(rows, "e")).toEqual([rows[1], rows[2], rows[0]]);

    // パスが空文字の場合は順番が変わらないこと
    expect(sortTableRows(rows, "")).toEqual(rows);

    const rows2: {
      index: number;
      columns: { a: string; b: number; c: { d: string } | null; e: string };
    }[] = [
      { index: 0, columns: { a: "ccc", b: 3, c: { d: "ccc" }, e: "aaa" } },
      { index: 1, columns: { a: "bbb", b: 2, c: null, e: "aaa" } },
      { index: 2, columns: { a: "aaa", b: 1, c: { d: "aaa" }, e: "aaa" } },
    ];

    // ネストしたキーを持つ列(一部の親要素がnull)
    expect(sortTableRows(rows2, "c.d")).toEqual([rows2[1], rows2[2], rows2[0]]);
  });
});
