import { assertEquals } from "@std/assert";
import normalisePath from "../src/utilities/normalise-path.ts";

Deno.test("test normalise paths removes trailing slash", () => {
  const path = "/api/resource/name/";

  const normalised = normalisePath(path);

  assertEquals("/api/resource/name", normalised);
});

Deno.test("test normalise paths removes double slash", () => {
  const path = "/api/resource//name";

  const normalised = normalisePath(path);

  assertEquals("/api/resource/name", normalised);
});

Deno.test("test normalise paths retains index route", () => {
  const path = "/";

  const normalised = normalisePath(path);

  assertEquals("/", normalised);
});
