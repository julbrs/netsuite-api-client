import {describe, expect, it} from "vitest";
import {removeLeadingSlash, removeTrailingSlash} from "../src/utils.js";


describe("Test Utilities", () => {

    it("it should properly remove a trailing slash", () => {
        const original = 'https://example.com/';
        const fixed = 'https://example.com';
        expect(removeTrailingSlash(original)).toEqual(fixed);
    });

    it("it should properly remove a leading slash", () => {
        const original = '/path/to/something';
        const fixed = 'path/to/something';
        expect(removeLeadingSlash(original)).toEqual(fixed);
    });
});
