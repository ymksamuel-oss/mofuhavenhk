import { describe, expect, it } from "vitest";
import { MAX_FEATURED_PETS, parseFeaturedPets } from "../src/lib/featured-pets";

describe("featured pet CMS content", () => {
  it("keeps only valid, published entries in deterministic sort order", () => {
    const pets = parseFeaturedPets(JSON.stringify([
      {
        image_url: "https://images.example.com/rabbit.jpg",
        title: "兔仔午後日光浴",
        description: "在窗邊慢慢伸展的溫柔片刻。",
        link: "/menu",
        sort_order: 2,
        is_published: true,
      },
      {
        image_url: "https://images.example.com/cat.jpg",
        title: "貓咪的小日常",
        description: "柔軟午後的療癒寫真。",
        link: "https://example.com/story",
        sort_order: 1,
        is_published: true,
      },
      {
        image_url: "https://images.example.com/hidden.jpg",
        title: "不顯示內容",
        description: "這項目已被關閉。",
        link: null,
        sort_order: 3,
        is_published: false,
      },
    ]));

    expect(pets).toHaveLength(2);
    expect(pets.map((pet) => pet.title)).toEqual(["貓咪的小日常", "兔仔午後日光浴"]);
  });

  it("rejects invalid or duplicated content safely", () => {
    const pets = parseFeaturedPets(JSON.stringify([
      {
        image_url: "/not-an-absolute-image-url",
        title: "無效圖片",
        description: "不應被輸出。",
        sort_order: 1,
        is_published: true,
      },
      {
        image_url: "https://images.example.com/dog.jpg",
        title: "狗狗散步日記",
        description: "一段輕鬆的散步時光。",
        link: "javascript:alert(1)",
        sort_order: 4,
        is_published: true,
      },
      {
        image_url: "https://images.example.com/hamster.jpg",
        title: "倉鼠小角落",
        description: "小小毛孩的居家時光。",
        sort_order: 4,
        is_published: true,
      },
    ]));

    expect(pets).toHaveLength(1);
    expect(pets[0]).toMatchObject({ title: "狗狗散步日記", link: null, sort_order: 4 });
  });

  it("caps the CMS payload at the configured number of slots", () => {
    const raw = Array.from({ length: MAX_FEATURED_PETS + 4 }, (_, index) => ({
      image_url: `https://images.example.com/pet-${index}.jpg`,
      title: `內容 ${index + 1}`,
      description: `第 ${index + 1} 個精選寵物內容。`,
      sort_order: index,
      is_published: true,
    }));

    expect(parseFeaturedPets(JSON.stringify(raw))).toHaveLength(MAX_FEATURED_PETS);
  });
});
