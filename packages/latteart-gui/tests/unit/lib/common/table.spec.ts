import { filterTableRows, sortTableRows } from "@/lib/common/table";

describe("filterTableRows", () => {
  it("テーブル行群を指定の条件でフィルタして返す", () => {
    const rows = [
      { a: "hoge", b: "huga" },
      { a: "hoge", b: "piyo" },
      { a: "foo", b: "bar" }
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
      { a: "ccc", b: 3, c: { d: "ccc" }, e: "bbb" },
      { a: "bbb", b: 2, c: { d: "bbb" }, e: "aaa" },
      { a: "aaa", b: 1, c: { d: "aaa" }, e: "aaa" }
    ];

    // 文字列型の列
    expect(sortTableRows(rows, [{ key: "a", order: "asc" }])).toEqual([rows[2], rows[1], rows[0]]);

    // 文字列型の列（降順）
    expect(sortTableRows(rows, [{ key: "a", order: "desc" }])).toEqual([rows[0], rows[1], rows[2]]);

    // 数値型の列
    expect(sortTableRows(rows, [{ key: "b", order: "asc" }])).toEqual([rows[2], rows[1], rows[0]]);

    // ネストしたキーを持つ列が引けること
    expect(sortTableRows(rows, [{ key: "c.d", order: "asc" }])).toEqual([
      rows[2],
      rows[1],
      rows[0]
    ]);

    // 同じ値のもの同士は順番が入れ替わらないこと
    expect(sortTableRows(rows, [{ key: "e", order: "asc" }])).toEqual([rows[1], rows[2], rows[0]]);

    // パスが空文字の場合は順番が変わらないこと
    expect(sortTableRows(rows, [{ key: "", order: "asc" }])).toEqual(rows);

    const rows2: {
      a: string;
      b: number;
      c: { d: string } | null;
      e: string;
    }[] = [
      { a: "ccc", b: 3, c: { d: "ccc" }, e: "aaa" },
      { a: "bbb", b: 2, c: null, e: "aaa" },
      { a: "aaa", b: 1, c: { d: "aaa" }, e: "aaa" }
    ];

    // ネストしたキーを持つ列(一部の親要素がnull)
    expect(sortTableRows(rows2, [{ key: "c.d", order: "asc" }])).toEqual([
      rows2[1],
      rows2[2],
      rows2[0]
    ]);
  });
});
